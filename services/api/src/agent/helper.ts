import CallbackHandler, { Langfuse } from "langfuse-langchain";
import { v4 as uuid } from "uuid";
import { CreateTools } from "./tools";
import { AnswerContext, LLMCallbacks } from "./callbacks";
import {
  RunAgentParams,
  RunContext,
  RunModelParams,
  RunAgentResponse,
} from "./types";
import { secretManager } from "../common/secrets";
import { buildAnswer } from "./utils";
import { isLangfuseEnabled } from "../utils/ee";
import {
  investigationModel,
  IOrganization,
  organizationModel,
} from "@aster/db";
import { Callbacks } from "@langchain/core/callbacks/manager";
import { getChatModel as getChatModelFn } from "./model";
import { createGraph } from "./graph";
import { HumanMessage } from "@langchain/core/messages";

import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import mongoose from "mongoose";

export function generateTrace(context: RunContext) {
  const langfuse = new Langfuse({
    secretKey: process.env.LANGFUSE_SECRET_KEY as string,
    publicKey: process.env.LANGFUSE_PUBLIC_KEY as string,
    baseUrl: process.env.LANGFUSE_HOST as string,
  });
  const trace = langfuse.trace({
    sessionId: context.eventId || uuid(),
  });

  const tags = Object.values(context).map((v) => String(v));
  const userId = context.userId ? context.userId : null;
  trace.update({ metadata: context, tags, userId });

  return trace;
}

export async function runModel({ model, context, messages }: RunModelParams) {
  const callbacks: Callbacks = [];
  let lfCallback: CallbackHandler | null = null;
  if (isLangfuseEnabled()) {
    lfCallback = new CallbackHandler({
      root: context.trace,
      secretKey: process.env.LANGFUSE_SECRET_KEY as string,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY as string,
      baseUrl: process.env.LANGFUSE_HOST as string,
    });
    callbacks.push(lfCallback);
  }
  const response = await model.invoke(messages, { callbacks });
  const output = response.content as string;
  const traceId = lfCallback?.getTraceId();
  const observationId = lfCallback?.getLangchainRunId();
  return { output, traceId, observationId, trace: context.trace };
}

export async function runAgent({
  prompt,
  template,
  integrations,
  context,
  messages,
  model,
}: RunAgentParams): Promise<RunAgentResponse> {
  const organization = (await organizationModel.getOneById(
    context.organizationId as string,
  )) as IOrganization;

  let investigation = null;
  if (context?.isInvestigation) {
    console.log("### creating new investigation ###");
    investigation = await investigationModel.create({
      status: "init",
      createdAt: new Date(),
      updatedAt: new Date(),
      organization: organization,
      secondaryInvestigationId: context.secondaryInvestigationId,
    });
    context = { ...context, investigationId: investigation._id.toString() };
  } else if (context?.secondaryInvestigationId) {
    console.log("### fetching existing investigation ###");
    investigation = await investigationModel.getOne({
      secondaryInvestigationId: context.secondaryInvestigationId,
    });
    if (investigation) {
      context = { ...context, investigationId: investigation._id.toString() };
    }
  }

  console.log("### investigation id ###");
  console.log(investigation?._id.toString());

  console.log("### secondary investigation id ###");
  console.log(context.secondaryInvestigationId);

  const populatedIntegrations =
    await secretManager.populateCredentials(integrations);

  const tools = await new CreateTools(populatedIntegrations, context).create();

  // Custom logic for aggregating citations and sources from tools' activations
  const answerContext = isLangfuseEnabled()
    ? new AnswerContext(context.trace)
    : new AnswerContext();
  const globalCallbacks = new LLMCallbacks(answerContext);
  const callbacks: Callbacks = [globalCallbacks];

  // Langfuse monitoring
  if (isLangfuseEnabled()) {
    callbacks.push(
      new CallbackHandler({
        root: context.trace,
        secretKey: process.env.LANGFUSE_SECRET_KEY as string,
        publicKey: process.env.LANGFUSE_PUBLIC_KEY as string,
        baseUrl: process.env.LANGFUSE_HOST as string,
      }),
    );
  }
  const client = mongoose.connection.getClient() as any;
  // Polyfill appendMetadata if it doesn't exist (due to older mongodb driver in mongoose)
  if (!client.appendMetadata) {
    client.appendMetadata = () => {};
  }
  const memory = new MongoDBSaver({
    client,
  });
  const graph = createGraph(model, tools, memory);
  const result = await graph.invoke({
    messages: new HumanMessage({ content: prompt })
  }, { configurable: { thread_id: investigation?._id.toString() || context?.secondaryInvestigationId } });

  const output = result.messages[result.messages.length - 1].content;

  const answer = buildAnswer(
    output as string,
    answerContext.getSources(),
    context.initiatedBy === "SlackBot",
  );
  return {
    answer,
    answerContext,
    investigation,
  };
}
