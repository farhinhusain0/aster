import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  AIMessage,
  HumanMessage,
  MessageContent,
} from "@langchain/core/messages";
import {
  ChatOpenAI,
  AzureChatOpenAI,
  AzureOpenAIEmbeddings,
} from "@langchain/openai";
import type { IIntegration, IInvestigation } from "@aster/db";
import { LangfuseTraceClient } from "langfuse";
import { Annotation } from "@langchain/langgraph";
import { AnswerContext } from "./callbacks";
import { VectorStore } from "./rag/types";
const { OpenAIEmbedding } = require("llamaindex");

// Langchain helper types
export type ChatMessage = AIMessage | HumanMessage;
export interface TextBlock {
  type: "text";
  text: string;
}

export interface ImageBlock {
  type: "image_url";
  image_url:
    | string
    | {
        url: string;
        detail?: "auto" | "low" | "high";
      };
}

export interface BaseMessage {
  role: string;
  content: MessageContent;
}

// Run Agent/Model types
export interface RunContext {
  trace?: LangfuseTraceClient;
  email?: string;
  userId?: string;
  eventId?: string;
  /**
   * Variable that indicates if the agent is being run for an investigation
   * If the agent is being run for a follow-up then `isInvestigation` will be false
   * By default, `isInvestigation` is false
   */
  isInvestigation?: boolean;
  /**
   * `investigationId` will be only present if the agent is being run for an investigation
   * If the agent is being run for a follow-up then `investigationId` will not be present
   */
  investigationId?: string;
  env: string;
  organizationName: string;
  organizationId: string;
  context: string;
  initiatedBy?: "SlackBot" | "TeamsBot" | "WebApp" | "API";
  chatModel: ChatModel;
  /**
   * Variable that indicates if the agent should generate checks
   * When the agent is being run for a follow-up then `shouldGenerateChecks` will be false
   */
  shouldGenerateChecks: boolean;
  getVectorStore: (indexName: string, indexType: "chromadb") => VectorStore;
}

export interface RunAgentResponse {
  answer: string;
  answerContext: AnswerContext;
  investigation?: IInvestigation | null;
}

export type ChatModel = ChatOpenAI | AzureChatOpenAI;
export type EmbedModel =
  | InstanceType<typeof OpenAIEmbedding>
  | AzureOpenAIEmbeddings;

export interface RunAgentParams {
  prompt: string;
  template: ChatPromptTemplate;
  integrations: IIntegration[];
  context: RunContext;
  messages?: ChatMessage[];
  model: ChatModel;
}

export interface RunModelParams {
  model: ChatModel;
  template: ChatPromptTemplate;
  context: RunContext;
  messages: ChatMessage[];
}

// Graph State Definition
export const StateDefinition = Annotation.Root({
  input: Annotation<string>,
  response: Annotation<string | undefined>,
  messages: Annotation<ChatMessage[]>,
  router_decision: Annotation<"analyze" | "chat">,
  analysis_report: Annotation<string | undefined>,
});

export type State = typeof StateDefinition.State;

export type GetChatModel = Promise<ChatModel>;
export type GetEmbedModel = Promise<EmbedModel>;
