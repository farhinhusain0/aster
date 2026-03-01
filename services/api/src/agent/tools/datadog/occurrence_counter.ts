import { z } from "zod";
import { DynamicStructuredTool } from "langchain";
import { v2 } from "@datadog/datadog-api-client";
import type { DataDogIntegration } from "@aster/db";
import { investigationModel, investigationCheckModel } from "@aster/db";
import { getLogsInstance } from "../../../clients/datadog";
import { RunContext } from "../../../agent/types";
import { buildDatadogLogsUrl } from "../utils";

const getTimeSeriesStats = (logs: v2.Log[]) => {
  const now = new Date();
  const HOUR_MS = 60 * 60 * 1000;

  return Array.from({ length: 24 }, (_, i) => {
    const hourStart = new Date(now.getTime() - (24 - i) * HOUR_MS);
    const hourEnd = new Date(hourStart.getTime() + HOUR_MS);

    const value = logs.filter((log) => {
      if (!log.attributes?.timestamp) return false;
      const ts = new Date(log.attributes.timestamp).getTime();
      return ts >= hourStart.getTime() && ts < hourEnd.getTime();
    }).length;

    return { timestamp: hourStart.toISOString(), value };
  });
};

const TOOL_DESCRIPTION = `This tool counts the occurrences of a specific incident within the last 24 hours from Datadog logs to assess the impact of the issue. By providing an array of keywords related to the incident, the tool delivers the count of occurrences that have been logged during that time frame.

Here are some examples that you can use:
- What's the customer impact?
- What is the customer impact?`;

export default async function (
  integration: DataDogIntegration,
  context: RunContext,
) {
  const investigation = await investigationModel.getOneById(
    context.investigationId as string,
  );
  const { apiKey, appKey } = integration.credentials;
  const { region } = integration.metadata;
  const instance = getLogsInstance(apiKey, appKey, region);

  return new DynamicStructuredTool({
    name: "occurrence_counter",
    description: TOOL_DESCRIPTION,
    func: async ({ incident_keywords }: { incident_keywords: string[] }) => {
      try {
        const words_search_query = incident_keywords
          .map((word) => `*:${word}`)
          .join(" OR ");

        const query = `@status:error AND (${words_search_query})`;
        const from = `now-24h`;
        const params: v2.LogsApiListLogsRequest = {
          body: {
            filter: {
              query,
              from,
            },
            sort: "-timestamp",
            page: {
              limit: 2000,
            },
          },
        };

        const resp = await instance.listLogs(params);
        const logs = resp.data;
        const logsCount: number = logs ? logs.length : 0;
        const stats = getTimeSeriesStats(logs ?? []);

        if (context.shouldGenerateChecks && investigation) {
          const investigationCheck = await investigationCheckModel.getOne({
            investigation: investigation,
            source: "datadog",
          });

          // create investigation check only if it does not exist
          if (!investigationCheck) {
            await investigationCheckModel.create({
              investigation: investigation,
              source: "datadog",
              action: {
                stats: stats,
                request:
                  "Count occurrences of incident keywords in Datadog logs",
                query: query,
                url: buildDatadogLogsUrl(query),
              },
              result: {
                summary:
                  "Datadog logs were checked to identify the occurrence of the issue in the last 24 hours.",
                explanation: `The data shows that there were ${logsCount || "no"} occurrences of the incident keywords ${incident_keywords.join(", ")} in the last 24 hours.`,
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }

        if (logsCount === 0) {
          return "No occurrences found in the last 24 hours.";
        }
        return `Found ${logsCount} occurrences in last 24 hours.`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return JSON.stringify(error);
      }
    },
    schema: z.object({
      incident_keywords: z
        .array(
          z
            .string()
            .describe(
              "A single word that pinpoints this incident, no generic terms. Very important, do **not** use words like error, fail, exception, warning, or any other broadly applicable term.",
            ),
        )
        .min(1)
        .describe(
          "An array of single words that uniquely identify this incident. Exclude any broadly used terms (e.g., error, failed, exception, warning); include only the most incident-specific keywords.",
        ),
    }),
  });
}
