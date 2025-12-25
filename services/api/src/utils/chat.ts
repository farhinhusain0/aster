import { Request, Response } from "express";
import { integrationModel, IOrganization } from "@aster/db";
import { IIntegration } from "@aster/db";
import { runAgent } from "../agent";
import { parseMessages } from "../agent/parse";
import { GetChatModel, RunContext, TextBlock } from "../agent/types";
import { conversationTemplate, investigationTemplate } from "../agent/prompts";
import { visionModel } from "../agent/model";
import { generateTrace, runModel } from "../agent/helper";
import { AppError, ErrorCode } from "../errors";
import { isLangfuseEnabled } from "../utils/ee";
import { getChatModel } from "../agent/model";
import { VectorStoresManager } from "../agent/rag/utils";

export interface GetCompletionsResponse {
  output: string;
  traceURL: string;
  traceId: string;
  observationId: string;
  investigationId: string;
}

export class ChatCompletions {
  private readonly req: Request;

  constructor(req: Request) {
    this.req = req;
  }

  protected checkUserStatus(): void {
    if (this.req.user.status === "invited") {
      throw AppError({
        message: "User hasn't accepted the invitation yet",
        statusCode: 403,
        internalCode: ErrorCode.INVITATION_NOT_ACCEPTED,
      });
    }
  }

  protected async getChatModel(): GetChatModel {
    return await getChatModel();
  }

  protected async getOrganization(): Promise<IOrganization> {
    return await this.req.user.organization;
  }

  /**
   * Returns a function to get vector stores for semantic search.
   *
   * We wrap the method call in an arrow function to preserve the `this` context.
   * If we returned `new VectorStoresManager().getStore` directly, the method
   * would lose its `this` binding when called later, causing errors like
   * "this.getChromaDBStore is not a function" because `this` would be undefined.
   *
   * By capturing the VectorStoresManager instance in a closure, the arrow function
   * maintains the proper context when `getStore` calls internal methods like
   * `this.getChromaDBStore()`.
   */
  protected async getVectorStore() {
    const manager = new VectorStoresManager();
    return (indexName: string, indexType: "chromadb") => {
      return manager.getStore(indexName, indexType);
    };
  }

  protected async getRunContext(): Promise<RunContext> {
    const initiatedBy = this.req.headers[
      "x-initiated-by"
    ] as RunContext["initiatedBy"];
    const email = this.req.headers["x-slack-email"] as string;
    const organization = await this.getOrganization();
    const organizationName = organization.name;
    const organizationId = String(organization._id);
    const chatModel = await this.getChatModel();
    const isInvestigation = this.req.body.isInvestigation || false;

    return {
      email,
      env: process.env.NODE_ENV as string,
      userId: String(this.req.user._id),
      organizationName,
      organizationId,
      isInvestigation,
      context: "chat",
      initiatedBy,
      chatModel,
      shouldGenerateChecks: isInvestigation,
      getVectorStore: await this.getVectorStore(),
    };
  }

  async getCompletions(): Promise<GetCompletionsResponse> {
    this.checkUserStatus();

    const {
      messages,
      metadata: requestMetadata = {},
      isInvestigation,
    } = this.req.body;

    const organization = await this.getOrganization();
    const organizationName = organization.name;
    const organizationId = String(organization._id);
    const integrations = (await integrationModel
      .get({
        organization: organizationId,
      })
      .populate("vendor")) as IIntegration[];
    if (!integrations.length) {
      throw AppError({
        message: "No integrations at all",
        statusCode: 404,
        internalCode: ErrorCode.NO_INTEGRATION,
      });
    }

    let output: string | null = null;
    let traceId = "";
    let traceURL = "";
    let observationId = "";
    let investigationId = "";
    const chatMessages = parseMessages(messages);
    const message = chatMessages[chatMessages.length - 1];

    const hasImages =
      typeof message.content !== "string" &&
      message?.content?.some?.((item: any) => item?.type === "image_url");

    const chatModel = await this.getChatModel();
    const runContext = await this.getRunContext();
    // Create trace
    if (isLangfuseEnabled()) {
      const trace = generateTrace({ ...runContext });
      runContext.trace = trace;
    }

    if (requestMetadata.eventId) {
      runContext.eventId = requestMetadata.eventId;
    }

    if (!hasImages) {
      // Remove the last item
      chatMessages.pop();

      const prompt =
        typeof message.content === "string"
          ? message.content
          : (message.content[0] as TextBlock).text;

      try {
        const { answer, answerContext, investigation } = await runAgent({
          prompt,
          template: isInvestigation
            ? investigationTemplate
            : conversationTemplate,
          integrations,
          messages: chatMessages,
          context: runContext,
          model: chatModel,
        });

        output = answer;
        traceId = answerContext.getTraceId()!;
        observationId = answerContext.getObservationId()!;
        traceURL = answerContext.getTraceURL()!;
        investigationId = investigation ? String(investigation._id) : "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(error);
        throw AppError({
          message: error.message,
          statusCode: 500,
          internalCode: ErrorCode.AGENT_RUN_FAILED,
          stack: error.stack,
        });
      }
    } else {
      try {
        const result = await runModel({
          model: visionModel,
          template: conversationTemplate,
          context: runContext,
          messages: chatMessages,
        });
        output = result.output;
        traceId = result.traceId!;
        observationId = result.observationId!;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        throw AppError({
          message: error.message,
          statusCode: 500,
          internalCode: ErrorCode.MODEL_RUN_FAILED,
        });
      }
    }

    return { output, traceURL, traceId, observationId, investigationId };
  }
}
