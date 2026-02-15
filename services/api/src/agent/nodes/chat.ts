import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { State } from "../types";
import { chatSystemPrompt } from "../prompts";
import { createAgent } from "langchain";
import { Tool } from "../tools/types";

export const makeChatNode = (llm: ChatOpenAI, tools: Tool[]) => {
  return async (state: State) => {
    console.log("### Chat Node");
    
    const agent = createAgent({
      model: llm,
      tools: tools,
      systemPrompt: chatSystemPrompt
    });

    const aiResponse = await agent.invoke({
      messages: state.messages
    });

    return { 
      messages: aiResponse.messages 
    };
  };
};
