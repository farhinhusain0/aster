import { ChromaDBVectorStore } from "./chromadb";
import type { Document } from "./types";

export class VectorStoresManager {
  protected validateChromaDBEnvironment() {
    if (!process.env.CHROMA_HOST || !process.env.CHROMA_API_KEY) {
      throw new Error(
        "CHROMA_HOST and CHROMA_API_KEY are required for ChromaDB",
      );
    }
  }

  protected getChromaDBStore(indexName: string) {
    this.validateChromaDBEnvironment();
    return new ChromaDBVectorStore(
      process.env.CHROMA_HOST as string,
      process.env.CHROMA_API_KEY as string,
      indexName,
    );
  }

  public getStore(indexName: string, indexType: "chromadb") {
    switch (indexType) {
      case "chromadb":
        return this.getChromaDBStore(indexName);
      default:
        throw new Error(`Invalid index source: ${indexType}`);
    }
  }
}

export function nodesToText(documents: Document[]) {
  const formattedNodes = documents.map(
    (document, index) =>
      `Document: ${index + 1}\n
       Source: ${document?.metadata?.source || ""}\n
       URL: ${document?.metadata?.url}\n
       Path: ${document.metadata?.file_path || ""}\n
       Score: ${document?.score || 0}\n
       Text: ${document?.text || ""}`,
  );
  return formattedNodes.join("\n\n");
}
