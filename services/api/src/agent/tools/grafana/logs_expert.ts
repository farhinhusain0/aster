import { z } from "zod";
import {
  GrafanaIntegration,
  investigationCheckModel,
  investigationModel,
} from "@aster/db";
import { Timeframe } from "../../../utils/dates";
import { RunContext } from "../../../agent/types";
import axios from "axios";
import { chatModel } from "../../../agent/model";
import { buildOutput } from "../utils";
import {
  checksSummaryPrompt,
  dataExplanationPrompt,
} from "../../../agent/prompts";
import { PromptTemplate } from "@langchain/core/prompts";
import { DynamicStructuredTool } from "langchain";

const PROMPT_TEMPLATE = `
You are a Grafana logs expert. You mission is to give user meaningful insights from Grafana logs. You will be given a stringified response of the logs. Your task is to analyze the logs and provide the user with the most relevant information. Please follow the below instructions when giving answer
- When writing response for transaction failed, we shouldn't say 23.3. Because it is a float value. We should say 23.
- The response tone should be simple and easy to understand.
- Be concise with your answers. Don't write messages that are too long. Try to say more with less words.

Here are some examples that you can use:

For instance, given the following logSample + request:

Log example:
[[
    {{
        "metric": {{
            "__name__": "app_payment_transactions_total",
            "app_payment_failure": "Payment charge failed",
            "job": "payment",
            "service_name": "payment"
        }},
        "value": [[
            1739164771.809,
            "7"
        ]]
    }}
]]

Request:
Please find the number of failed payment transactions.

Answer:
There are total 7 failed payment transactions in last 24 hours for the given logs in the payment service. It seems like the payment charge failed for 7 transactions.

Begin!

{request}
`;

const TOOL_DESCRIPTION = `
This tool serves as a Grafana logs expert. Given a request in plain english, it will try to find the relevant logs.
Here are some examples that you can use:
- What's the customer impact?
- What is the customer impact?
`;

export default async function (
  integration: GrafanaIntegration,
  context: RunContext,
) {
  const investigation = await investigationModel.getOneById(
    context.investigationId as string,
  );
  const { instanceURL } = integration.metadata;

  return new DynamicStructuredTool({
    name: "logs_expert_tool",
    description: TOOL_DESCRIPTION,
    func: async ({ request, timeframe, incidentLabel }) => {
      try {
        const query = `increase(app_payment_transactions_total[24h])`;
        const apiUrl = `${instanceURL}/datasources/proxy/1/api/v1/query?query=${query}`;
        const response = await axios.get(apiUrl);

        const prompt = await PromptTemplate.fromTemplate(
          PROMPT_TEMPLATE,
        ).format({
          request: `
          ${request} in last 24 hours for ${JSON.stringify(response.data)}`,
        });

        // Ask ai to generate logs expert response
        const aiResponse = await chatModel.invoke(prompt, { callbacks: [] });
        const { content } = aiResponse;
        const output = buildOutput(content.toString());

        // Check and Create an investigation check
        if (context.shouldGenerateChecks && investigation) {
          const queryExplanationPrompt = await dataExplanationPrompt.format({
            toolDescription:
              "Using Grafana logs to find number of failed payment transactions in the last 24 hours",
            data: JSON.stringify(response.data),
            query: query,
            context: content.toString(),
          });
          const explanationAiResponse = await chatModel.invoke(
            queryExplanationPrompt,
            {
              callbacks: [],
            },
          );

          const checkSummaryPrompt = await checksSummaryPrompt.format({
            toolDescription:
              "Using Grafana logs to find number of failed payment transactions in the last 24 hours",
            query: request,
            result: explanationAiResponse.content.toString(),
            context: incidentLabel,
          });
          const summaryAiResponse = await chatModel.invoke(checkSummaryPrompt, {
            callbacks: [],
          });

          const investigationCheck = await investigationCheckModel.getOne({
            investigation: investigation,
            source: "grafana",
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
              source: "grafana",
              action: {
                request: request,
                query: query,
                url: apiUrl,
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

        return output;
      } catch (error) {
        console.error(error);
        return JSON.stringify(error);
      }
    },
    schema: z.object({
      request: z.string().describe("The request to be used with Grafana."),
      timeframe: z
        .enum([
          Timeframe.Last1Minute,
          Timeframe.Last2Minutes,
          Timeframe.Last5Minutes,
          Timeframe.Last15Minutes,
          Timeframe.Last30Minutes,
          Timeframe.Last1Hour,
          Timeframe.Last2Hours,
          Timeframe.Last6Hours,
          Timeframe.Last12Hours,
          Timeframe.Last24Hours,
          Timeframe.Last2Days,
          Timeframe.Last3Days,
          Timeframe.Last5Days,
          Timeframe.Last7Days,
        ])
        .describe(
          "The period for which you wish to search the logs. Default is last 24 hours.",
        )
        .default(Timeframe.Last24Hours),
      incidentLabel: z
        .string()
        .describe(
          "The triggered incident label from the PagerDuty. For example: [FIRING:1] payment service transaction error Demo (Payment charge failed payment payment)",
        ),
    }),
  });
}
