import { ChatOpenAI } from "@langchain/openai";
import { GetChatModel } from "./types";

export const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: process.env.OPENAI_CHAT_MODEL,
  temperature: 0,
  verbose: true,
});

export const visionModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: process.env.OPENAI_CHAT_MODEL,
  temperature: 0,
  verbose: true,
  maxTokens: 300,
});

export const embedModel = (() => {
  const { OpenAIEmbedding } = require("llamaindex");
  return new OpenAIEmbedding({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_EMBEDDING_MODEL,
    dimensions: process.env.OPENAI_EMBEDDING_DIMENSIONS,
  });
})();

export async function getChatModel(): GetChatModel {
  return chatModel;
}

export async function getTextEmbedding(text: string) {
  return await embedModel.getTextEmbedding(text);
}
