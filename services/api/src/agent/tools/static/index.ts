import { default as semanticSearch } from "./semantic_search";
import { RunContext } from "../../../agent/types";

export async function createToolLoaders(context: RunContext) {
  const toolLoaders = [semanticSearch];
  return toolLoaders;
}
