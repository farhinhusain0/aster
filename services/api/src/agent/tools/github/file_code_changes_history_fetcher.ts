import { z } from "zod";
import { DynamicStructuredTool } from "langchain";
import type { GithubIntegration } from "@aster/db";
import { GithubClient } from "../../../clients";

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

export default async function (integration: GithubIntegration) {
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
