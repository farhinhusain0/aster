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
      tools: tools
    });

    const aiResponse = await agent.invoke({
      messages: [
        new SystemMessage({content: chatSystemPrompt}),
        ...state.messages,
        new HumanMessage({ content: state.input })
      ]
    });

    const len = aiResponse.messages.length;
    const response = len > 0 ? aiResponse.messages[len-1].content : "Something went wrong!";

    return { response };
  };
};
