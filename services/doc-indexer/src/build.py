import traceback
from typing import List
import nest_asyncio
from storage.file import AsyncFileStorage
from llama_index.core.schema import Document

from nodes import documents_to_nodes

nest_asyncio.apply()

from argparse import ArgumentParser
from bson import ObjectId

import asyncio
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

import os
from rag.utils import get_vector_store
from db.snapshot import snapshot_model
from db.job import job_model
from db.index import index_model
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.embeddings.openai import OpenAIEmbedding
from db.llm import llm_model
from db.db_types import LLM

from snapshots.utils import load_documents


def get_embed_model(llm: LLM):
    if llm:
        model_name = llm.models.embedding
        return OpenAIEmbedding(model_name=model_name)

    api_key = os.getenv("OPENAI_API_KEY")
    model_name = os.getenv("OPENAI_EMBEDDING_MODEL")
    return OpenAIEmbedding(api_key=api_key, model=model_name)


async def build_index(
    snapshot_id: ObjectId,
    job_id: ObjectId,
    index_id: ObjectId,
):

    try:
        snapshot = await snapshot_model.get_one_by_id(snapshot_id)
        index = await index_model.get_one_by_id(index_id)
        llm = await llm_model.get_one(
            {"organization": snapshot.organization, "isDefault": True}
        )

        # Update job status
        await job_model.get_one_by_id_and_update(job_id, {"phase": "indexing"})

        store = get_vector_store(index.name, index.type)

        if not await store.is_index_live():
            await store.create_index()

        vector_store = store.get_llama_index_store()

        directory = os.getenv("SNAPSHOTS_DIRECTORY")
        if not directory:
            raise ValueError("SNAPSHOTS_DIRECTORY is not set")
        file_store = AsyncFileStorage(directory)

        documents = await load_documents(file_store, str(snapshot_id))
        documents_to_index: List[Document] = []

        total_nodes = []
        stats = {}
        for vendor in documents.keys():
            vendor_documents = documents[vendor]
            n_total_documents = sum(
                [
                    len(status_documents)
                    for status_documents in vendor_documents.values()
                ],
                0,
            )
            print(f"Found total of {n_total_documents} documents for {vendor}")

            for status in ["new", "changed"]:
                documents_to_index.extend(documents[vendor][status])
                nodes = documents_to_nodes(documents[vendor][status])
                total_nodes.extend(nodes)

            n_existing_docs = index.stats and sum(index.stats.values()) or 0
            stats[vendor] = n_existing_docs + len(vendor_documents["new"])

        # Delete nodes of documents that are about to be re-indexed
        if len(documents_to_index) > 0:
            docs_to_delete = list(
                set([document.doc_id for document in documents_to_index])
            )
            vector_store.delete(ref_doc_id=docs_to_delete)

        storage_context = StorageContext.from_defaults(vector_store=vector_store)

        VectorStoreIndex(
            total_nodes,
            vector_store=vector_store,
            show_progress=True,
            embed_model=get_embed_model(llm),
            storage_context=storage_context,
        )

        await index_model.get_one_by_id_and_update(
            index_id,
            {
                "state": {
                    "status": "completed",
                    "integrations": {vendor: "completed" for vendor in stats.keys()},
                },
                "stats": stats,
            },
        )
        await job_model.get_one_by_id_and_update(
            job_id,
            {"status": "completed", "phase": "completed"},
        )

        print("Build index completed")
    except Exception as e:
        print(e)
        traceback.print_exc()
        await job_model.get_one_by_id_and_update(
            job_id,
            {"status": "failed", "phase": "indexing-failed"},
        )
        await index_model.get_one_by_id_and_update(
            index_id,
            {
                "state": {
                    "status": "failed",
                    "integrations": {vendor: "failed" for vendor in stats.keys()},
                }
            },
        )


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--organization_id", type=str)
    parser.add_argument("--index_id", type=str)
    parser.add_argument("--index_name", type=str)

    args = parser.parse_args()

    asyncio.run(build_index(**vars(args)))
