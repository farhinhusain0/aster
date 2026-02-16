import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import { Tool } from "../tools/types";
import { State } from "../types";
import { analyzerSystemPrompt } from "../prompts";

export const makeAnalyzerNode = (llm: ChatOpenAI, tools: Tool[]) => {
  return async (state: State) => {
    console.log("### Analyzer Node");
    
    const agent = createAgent({
      model: llm,
      tools: tools,
      systemPrompt: analyzerSystemPrompt
    });

    const aiResponse = await agent.invoke({
      messages: state.messages
    });
    
    return { messages: aiResponse.messages };
  };
};
