import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { State } from "../types";
import { hypothesisSystemPrompt } from "../prompts";
import { Tool } from "../tools/types";
import { createAgent } from "langchain";

export const makeHypothesisNode = (llm: ChatOpenAI, tools: Tool[]) => {
  return async (state: State) => {
    console.log("### Hypothesis Node");

    const agent = createAgent({
      model: llm,
      tools: tools,
      systemPrompt: hypothesisSystemPrompt
    });

    const result = await agent.invoke({
      messages: state.messages
    });

    return { messages: result.messages };
  };
};
