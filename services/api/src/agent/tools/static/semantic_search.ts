import { z } from "zod";
import { DynamicStructuredTool } from "langchain";
import { RunContext } from "../../types";
import { buildOutput } from "../utils";
import {
  investigationCheckModel,
  investigationModel,
  indexModel,
  VendorName,
} from "@aster/db";
import { Document, nodesToText } from "../../rag";
import { checksSummaryPrompt, dataExplanationPrompt } from "../../prompts";

export default async function (context: RunContext) {
  const index = await indexModel.getOne({
    organization: context.organizationId,
  });

  const investigation = await investigationModel.getOneById(
    context.investigationId as string,
  );

  return Promise.resolve(
    new DynamicStructuredTool({
      name: "semantic_search",
      description: `Perform semantic search across multiple sources of information, get top 10 results
      
      You can use this tool to access:
      - The indexed codebase files from GitHub.
      - The indexed documentation from Notion.
      - The indexed messages from Slack.
      - The indexed incident messages from PagerDuty.
      - The indexed documentation from Confluence.
      - The indexed issues from Jira.
      
      Currently indexed source names are: ${index?.dataSources?.join(", ")}. Use the source name exactly as it is.`,
      func: async ({
        query,
        incidentLabel,
        source,
      }: {
        query: string;
        incidentLabel: string;
        source: string;
      }) => {
        try {
          const chatModel = context.chatModel;
          console.log("####### inside semantic search tool ########");
          console.log("Query:", query);
          console.log("Source:", source);

          if (!index) {
            return "Knowledge base is not set up. Tool is not available.";
          }
          const vectorStore = context.getVectorStore(index.name, index.type);
          const documents = await vectorStore.query({
            query,
            topK: 10,
            ...(index.dataSources.includes(source as VendorName) && { metadata: { source } }),
          });
          documents.sort((a, b) => b.score - a.score);

          const text = nodesToText(documents);
          console.log(
            "####### search results count ########",
            text?.length || 0,
          );

          try {
            // Check and Create an investigation check
            if (context.shouldGenerateChecks && investigation) {
              const githubDocuments = [] as Document[];
              documents.forEach((document) => {
                if (document.metadata.source === VendorName.Github) {
                  githubDocuments.push(document);
                }
              });

              const githubDocumentsText = nodesToText(githubDocuments);

              const queryExplanationPrompt = await dataExplanationPrompt.format(
                {
                  toolDescription:
                    "Using semantic search to find relevant files from the codebase for the incident",
                  data: githubDocumentsText,
                  query: query,
                  context: incidentLabel,
                },
              );
              const explanationAiResponse = await chatModel.invoke(
                queryExplanationPrompt,
                {
                  callbacks: [],
                },
              );

              const checkSummaryPrompt = await checksSummaryPrompt.format({
                toolDescription:
                  "Using semantic search to find relevant files from the codebase for the incident",
                query,
                result: explanationAiResponse.content.toString(),
                context: incidentLabel,
              });
              const summaryAiResponse = await chatModel.invoke(
                checkSummaryPrompt,
                {
                  callbacks: [],
                },
              );

              const filesData = githubDocuments.map((doc) => ({
                filename: doc.metadata.file_name,
                file_path: doc.metadata.file_path,
                repo_path: doc.metadata.repo_path,
                url: doc.metadata.url.replace(
                  /api\.github\.com\/[^/]+/,
                  "github.com",
                ),
                text: doc.text,
              }));

              const investigationCheck = await investigationCheckModel.getOne({
                source: "github",
                investigation: investigation,
              });

              if (investigationCheck) {
                investigationCheck.result = {
                  summary: summaryAiResponse.content.toString(),
                  explanation: explanationAiResponse.content.toString(),
                };
                investigationCheck.updatedAt = new Date();
                await investigationCheck.save();
              } else {
                await investigationCheckModel.create({
                  investigation: investigation,
                  source: "github",
                  action: {
                    request: query,
                    files: filesData,
                  },
                  result: {
                    summary: summaryAiResponse.content.toString(),
                    explanation: explanationAiResponse.content.toString(),
                  },
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
              }
            }
          } catch (error) {
            console.error(error);
          }

          const output = buildOutput(text);
          return output;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error("semantic_search tool error:", error);
          return JSON.stringify(error);
        }
      },
      schema: z.object({
        source: z
          .string()
          .describe(
            `A source to search from which is currently indexed. For example: Github, Notion, Slack, PagerDuty, Confluence, Jira`,
          ),
        query: z
          .string()
          .describe(
            "Free form query to search across all sources. For example: payment service transaction error, payment charge failed, opentelemetry-demo/payment, recent code changes, STRIPE API failed",
          ),
        incidentLabel: z
          .string()
          .describe(
            "The triggered incident label from the PagerDuty. For example: [FIRING:1] payment service transaction error Demo (Payment charge failed payment payment)",
          ),
      }),
    }),
  );
}
