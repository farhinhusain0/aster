import {
  GrafanaIntegration,
  investigationCheckModel,
  investigationModel,
} from "@aster/db";
import { PromptTemplate } from "@langchain/core/prompts";
import axios from "axios";
import { DynamicStructuredTool } from "langchain";
import { z } from "zod";
import { chatModel } from "../../../agent/model";
import { RunContext } from "../../../agent/types";
import { Timeframe } from "../../../utils/dates";
import { buildOutput } from "../utils";

const PROMPT_TEMPLATE = `
You are a Grafana logs expert. You mission is to give user meaningful insights from Grafana logs. You will be given a stringified response of the logs. Your task is to analyze the logs and provide the user with the most relevant information. Please follow the below instructions when giving answer
- Sum the values of the logs to get the total number of logs.
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
        "values": [[
            [[
                1771916740,
                "7"
            ]],
            [[
                1771995940,
                "22"
            ]],
            [[
                1771999540,
                "8"
            ]]
        ]]
    }}
]]

Request:
Please find the number of failed payment transactions.

Answer:
There are total 37 failed payment transactions in last 24 hours for the given logs in the payment service. It seems like the payment charge failed for 37 transactions.

Begin!

{request}
`;

const TOOL_DESCRIPTION = `
This tool serves as a Grafana logs expert. Given a request in plain english, it will try to find the relevant logs.
Here are some examples that you can use:
- What's the customer impact?
- What is the customer impact?
`;

async function getPrometheusDataSourceId(instanceURL: string, token: string) {
  const dataSourcesResponse = await axios.get(`${instanceURL}/datasources`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const dataSources = dataSourcesResponse.data;
  const prometheusDataSource = dataSources.find(
    (dataSource: { type: string }) => dataSource.type === "prometheus",
  );
  return prometheusDataSource?.id;
}

async function fetchMetricsWithDeltas(
  instanceURL: string,
  prometheusDataSourceId: string,
  query: string,
  start: number,
  end: number,
  token: string,
) {
  // Query with a fine-grained step (60s) to maximize data capture from Prometheus,
  // then aggregate deltas into hourly buckets for the bar graph.
  const apiUrl = `${instanceURL}/datasources/proxy/${prometheusDataSourceId}/api/v1/query_range?query=${encodeURIComponent(query)}&start=${start}&end=${end}&step=60`;
  const response = await axios.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  for (const series of response.data.data.result) {
    const raw = series.values as [number, string][];

    const hourlyBuckets = new Map<number, number>();
    for (let ts = start; ts < end; ts += 3600) {
      hourlyBuckets.set(ts, 0);
    }

    // Calculate the delta for each hour
    for (let i = 1; i < raw.length; i++) {
      const curr = parseFloat(raw[i][1]);
      const prev = parseFloat(raw[i - 1][1]);
      const delta = curr < prev ? curr : curr - prev;
      const bucketTs = start + Math.floor((raw[i][0] - start) / 3600) * 3600;
      hourlyBuckets.set(bucketTs, (hourlyBuckets.get(bucketTs) ?? 0) + delta);
    }

    // Fill the missing hours with 0
    const filled: [number, string][] = [];
    for (let ts = start; ts < end; ts += 3600) {
      filled.push([ts, String(Math.round(hourlyBuckets.get(ts) ?? 0))]);
    }
    series.values = filled;
  }

  return { apiUrl, response };
}

export default async function (
  integration: GrafanaIntegration,
  context: RunContext,
) {
  const investigation = await investigationModel.getOneById(
    context.investigationId as string,
  );
  const { instanceURL } = integration.metadata;
  const { token } = integration.credentials;

  return new DynamicStructuredTool({
    name: "logs_expert_tool",
    description: TOOL_DESCRIPTION,
    func: async ({ request, timeframe, incidentLabel }) => {
      try {
        // We need a prometheus data source id to be able to query the metrics.
        const prometheusDataSourceId = await getPrometheusDataSourceId(
          instanceURL,
          token,
        );
        const now = Math.floor(Date.now() / 1000);
        const twentyFourHoursAgo = now - 24 * 60 * 60;
        // TODO: This is a hack now for DEMO. We should fetch the label using
        // ${instanceURL}/api/datasources/proxy/${datasourceUid}/api/v1/label/__name__/values and then
        // ask LLM to pick the most relevant label.
        const query = `app_payment_transactions_total`;

        const { apiUrl, response } = await fetchMetricsWithDeltas(
          instanceURL,
          prometheusDataSourceId,
          query,
          twentyFourHoursAgo,
          now,
          token,
        );

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
          const investigationCheck = await investigationCheckModel.getOne({
            investigation: investigation,
            source: "grafana",
          });
          const stats = response.data.data.result[0];

          if (investigationCheck) {
            investigationCheck.result = {
              summary: "",
              explanation: "",
            };
            investigationCheck.action = {
              ...investigationCheck.action,
              request: request,
              query: query,
              url: apiUrl,
              stats: stats,
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
                stats: stats,
              },
              result: {
                summary: "",
                explanation: "",
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
