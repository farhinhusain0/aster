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
      tools: tools
    });

    const result = await agent.invoke({
      messages: [
        new SystemMessage(hypothesisSystemPrompt),
        new HumanMessage(`Analysis Report:\n${state.analysis_report}`)
      ]
    });

    const len = result.messages.length;
    const response = len > 0 ? result.messages[len-1].content : "No hypothesis generated.";

    return { response: response.toString() };
  };
};
