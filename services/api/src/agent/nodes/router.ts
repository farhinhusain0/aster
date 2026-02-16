import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { State } from "../types";
import { routerPrompt } from "../prompts";

export const makeRouterNode = (llm: ChatOpenAI) => {
  return async (state: State) => {
    console.log("### Router Node");
    const result = await llm.invoke([
      new SystemMessage(routerPrompt),
      ...state.messages
    ]);
    const decision = result.content.toString().trim().toLowerCase();
    console.log(`### Router Decision: ${decision}`);
    return { router_decision: decision === "analyze" ? "analyze" : "chat" };
  };
};
