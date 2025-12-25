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
      tools: tools
    });

    const aiResponse = await agent.invoke({
      messages: [
        new SystemMessage({content: analyzerSystemPrompt}),
        new HumanMessage({ content: state.input })
      ]
    });
    
    const len = aiResponse.messages.length;
    const report = len > 0 ? aiResponse.messages[len-1].content : "No analysis generated.";
    
    return { analysis_report: report };
  };
};
