import { ChromaClient, IncludeEnum } from "chromadb";
import { VectorStore, Document, QueryOptions } from "./types";
import { getTextEmbedding } from "../model";

export class ChromaDBVectorStore implements VectorStore {
  private readonly chroma: ChromaClient;
  private readonly collectionName: string;

  constructor(host: string, apiKey: string, collectionName: string) {
    let finalHost = host;
    let finalPort: number | undefined;
    let finalSsl = false;

    try {
      if (host.startsWith("http")) {
        const url = new URL(host);
        finalHost = url.hostname;
        finalPort = url.port ? parseInt(url.port) : undefined;
        finalSsl = url.protocol === "https:";
      }
    } catch (e) {
      console.error("Failed to parse ChromaDB host URL, using as is:", host);
    }

    this.chroma = new ChromaClient({
      host: finalHost,
      port: finalPort,
      ssl: finalSsl,
      headers: {
        "X-Chroma-Token": apiKey,
      },
    });
    this.collectionName = collectionName;
  }

  protected async getTextEmbedding(text: string): Promise<number[]> {
    return await getTextEmbedding(text);
  }

  async query({
    query,
    topK = 5,
    metadata = {},
  }: QueryOptions): Promise<Document[]> {
    const vector = await this.getTextEmbedding(query);

    const collection = await this.chroma.getCollection({
      name: this.collectionName,
    });

    const response = await collection.query({
      queryEmbeddings: [vector],
      nResults: topK,
      include: [
        IncludeEnum.metadatas,
        IncludeEnum.documents,
        IncludeEnum.embeddings,
        IncludeEnum.distances,
      ],
      // TODO: haven't checked this
      where: metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
    });

    if (!response.documents) {
      return [];
    }
    const documents = [];
    const batch = 0; // Chroma can run a batch of queries. Right now, we don't use it;

    for (let i = 0; i < response.documents.length; i++) {
      for (let j = 0; j < response.documents[i].length; j++) {
        const id = response.ids[j] as unknown as string;
        const text = response.documents[batch][j] ?? "";
        const score = (
          response.distances ? response.distances[batch][j] : 0
        ) as number;
        const metadata = response.metadatas[batch][j] || {};
        const embedding = (response.embeddings
          ? response.embeddings[j]
          : []) as unknown as number[];

        const document: Document = {
          id,
          embedding,
          score,
          text,
          metadata,
        };

        documents.push(document);
      }
    }
    return documents;
  }

  async deleteIndex(): Promise<void> {
    return await this.chroma.deleteCollection({ name: this.collectionName });
  }
}
