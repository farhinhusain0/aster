import { ChromaClient, IncludeEnum } from "chromadb";
import { VectorStore, Document, QueryOptions } from "./types";
import { getTextEmbedding } from "../model";

export class ChromaDBVectorStore implements VectorStore {
  private readonly chroma: ChromaClient;
  private readonly collectionName: string;

  constructor(host: string, apiKey: string, collectionName: string) {
    this.chroma = new ChromaClient({
      path: host,
      auth: {
        provider: "token",
        credentials: apiKey,
        tokenHeaderType: "X_CHROMA_TOKEN",
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
      queryEmbeddings: vector,
      nResults: topK,
      include: [
        IncludeEnum.Metadatas,
        IncludeEnum.Documents,
        IncludeEnum.Embeddings,
        IncludeEnum.Distances,
      ],
      // TODO: haven't checked this
      where: metadata,
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
