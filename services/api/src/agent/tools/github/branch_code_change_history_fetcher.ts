import { z } from "zod";
import { DynamicStructuredTool } from "langchain";
import {
  IInvestigation,
  investigationCheckModel,
  investigationModel,
  type GithubIntegration,
} from "@aster/db";
import { GithubClient } from "../../../clients";
import { RunContext } from "../../types";

const schema = z.object({
  since: z
    .string()
    .describe(
      "The start timestamp for the search window in ISO 8601 format (e.g., '2025-10-28T00:00:00Z'). This defines the earliest point in time to fetch patches from.",
    ),
  until: z
    .string()
    .describe(
      "The end timestamp for the search window in ISO 8601 format (e.g., '2025-10-29T00:00:00Z'). This defines the latest point in time to fetch patches from.",
    ),
});

export default async function (
  integration: GithubIntegration,
  context: RunContext,
) {
  const { access_token } = integration.credentials;
  const { reposToSync } = integration.settings;

  const githubClient = GithubClient.fromToken(access_token);

  return new DynamicStructuredTool({
    name: "fetch_code_change_history",
    description: `Retrieves code changes (diffs) from repositories within a time range. Use this to correlate errors with recent deployments.
    IMPORTANT: You MUST carefully review ALL returned commits to distinguish between relevant changes (that could cause the incident) and irrelevant ones. Do not assume the most recent change is the cause.
    Requires 'since' and 'until' timestamps in ISO 8601 format (e.g., '2025-10-28T00:00:00Z').`,
    func: async ({ since, until }) => {
      const diffs: Record<string, any> = {};

      try {
        for (const repoData of reposToSync) {
          const { repoName, branchName } = repoData;
          const [owner, repo] = repoName.split("/");

          const diff = await githubClient.getMainBranchHeadDiff({
            owner,
            repo,
            since,
            until,
            branch: branchName,
          });

          diffs[repoName] = diff;
        }

        console.log("### diffs", JSON.stringify(diffs, null, 2));

        try {
          const investigation = (await investigationModel.getOneById(
            context.investigationId as string,
          )) as IInvestigation;

          if (!investigation) {
            throw new Error("Investigation not found");
          }

          const investigationCheck = await investigationCheckModel.getOne({
            source: "github",
            investigation: investigation,
          });

          if (investigationCheck) {
            console.log(
              "[TOOLS]->[GITHUB]->[fetch_code_change_history]: Updating existing investigation check",
            );
            investigationCheck.action = {
              ...investigationCheck.action,
              diffs,
            };
            investigationCheck.updatedAt = new Date();
            await investigationCheck.save();
          } else {
            console.log(
              "[TOOLS]->[GITHUB]->[fetch_code_change_history]: Creating new investigation check",
            );
            await investigationCheckModel.create({
              source: "github",
              investigation: investigation,
              action: {
                diffs,
              },
              result: {
                summary: "",
                explanation: "",
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        } catch (error: any) {
          console.error(
            `[TOOLS]->[GITHUB]->[fetch_code_change_history]: Error storing code change history in investigation check: ${error.message}`,
          );
        }

        return diffs;
      } catch (error: any) {
        if (error) {
          return error.response?.data;
        }
        return error.message;
      }
    },
    schema,
  });
}
