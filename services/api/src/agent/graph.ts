import { ChatOpenAI } from "@langchain/openai";
import { Tool } from "./tools/types";
import {
  StateGraph,
  START,
  END,
} from '@langchain/langgraph';
import { StateDefinition, State } from "./types";
import { 
  makeRouterNode, 
  makeAnalyzerNode, 
  makeHypothesisNode, 
  makeChatNode 
} from "./nodes";

const createGraph = (
  llm: ChatOpenAI,
  tools: Tool[],
  memory: any
) => {

  // Instantiate nodes with dependencies
  const routerNode = makeRouterNode(llm);
  const analyzerNode = makeAnalyzerNode(llm, tools);
  const hypothesisNode = makeHypothesisNode(llm, tools);
  const chatNode = makeChatNode(llm, tools);

  const graph = new StateGraph(StateDefinition)
  .addNode("router", routerNode)
  .addNode("analyzer", analyzerNode)
  .addNode("hypothesis", hypothesisNode)
  .addNode("chat", chatNode)
  .addEdge(START, "router")
  .addConditionalEdges(
    "router",
    (state: State) => state.router_decision === "analyze" ? "analyzer" : "chat"
  )
  .addEdge("analyzer", "hypothesis")
  .addEdge("hypothesis", END)
  .addEdge("chat", END)
  .compile({ checkpointer: memory });

  return graph;

}

export { createGraph };