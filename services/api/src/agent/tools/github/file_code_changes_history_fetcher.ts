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
  repoFullName: z
    .string()
    .describe("The repo full name in the format of {org}/{repo}"),
  filePath: z.string().describe("The path to the file to get changes for"),
  limit: z
    .number()
    .describe(
      "The number of commits to return (recommended: 5-20 commits for file history)",
    ),
});

export default async function (
  integration: GithubIntegration,
  context: RunContext,
) {
  const { access_token } = integration.credentials;
  const { reposToSync } = integration.settings;

  const githubClient = GithubClient.fromToken(access_token);
  const repos = reposToSync.map((r) => r.repoName);

  return new DynamicStructuredTool({
    name: "file_code_changes_history_fetcher",
    description: `Fetches commit history and diffs for a specific file. Use this to investigate code changes.
    IMPORTANT: You MUST carefully review ALL returned commits to distinguish between relevant changes (that could cause the incident) and irrelevant ones (docs, formatting, etc.). Do not assume the most recent change is the cause.
    Specify:
    - repository ({owner}/{repo})
    - file path
    - limit (recommended: 5-20)
    
    Available repositories: ${repos.join(", ")}`,
    func: async ({ repoFullName, filePath, limit }) => {
      try {
        const repoData = reposToSync.find(
          (item) => item.repoName === repoFullName,
        );

        if (!repoData) {
          return JSON.stringify({
            commits: [],
            message: `Repository ${repoFullName} not found in the list of repositories to sync.`,
          });
        }

        const { repoName, branchName } = repoData;
        const [owner, repo] = repoName.split("/");

        const diff = await githubClient.getFileChangesDiff({
          owner,
          repo,
          filePath,
          limit,
          branch: branchName,
        });

        console.log("####### file codechange diff ########", diff);

        /**
         * Find if we have an existing investigation check for `github` source
         * if we do, update the existing investigation and store the new diffs
         * if we don't, create a new investigation check with the new diffs
         * in the action key of the investigation check
         */
        try {
          const investigation = (await investigationModel.getOneById(
            context.investigationId as string,
          )) as IInvestigation;

          if (!investigation) {
            throw new Error("Investigation not found");
          }

          /**
           * Match the same diffs structure as the branch_code_change_history_fetcher tool
           * this is because we want to store the diffs in the same structure
           * as the branch_code_change_history_fetcher tool for consistency
           */
          const diffs = { [repoName]: diff };

          const investigationCheck = await investigationCheckModel.getOne({
            source: "github",
            investigation: investigation,
          });

          if (investigationCheck) {
            console.log(
              "[TOOLS]->[GITHUB]->[file_code_changes_history_fetcher]: Updating existing investigation check",
            );
            investigationCheck.action = {
              ...investigationCheck.action,
              diffs,
            };
            investigationCheck.updatedAt = new Date();
            await investigationCheck.save();
          } else {
            console.log(
              "[TOOLS]->[GITHUB]->[file_code_changes_history_fetcher]: Creating new investigation check",
            );
            await investigationCheckModel.create({
              source: "github",
              investigation: investigation,
              action: {
                diffs,
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        } catch (error: any) {
          console.error(
            `[TOOLS]->[GITHUB]->[file_code_changes_history_fetcher]: Error storing code change history in investigation check: ${error.message}`,
          );
        }

        return JSON.stringify(diff, null, 2);
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
