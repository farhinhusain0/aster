import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { BaseMessage, ChatMessage } from "./types";
import { LangChainMessageRoles } from "@aster/utils";

export function parseMessages(messages: BaseMessage[]): ChatMessage[] {
  return messages.map(({ content, role }) => {
    if (role === LangChainMessageRoles.assistant) {
      return new AIMessage({ content });
    }
    return new HumanMessage({ content });
  });
}
