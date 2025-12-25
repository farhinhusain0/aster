import { Octokit, App } from "octokit";
// octokit documentation:
// https://docs.github.com/en/rest/orgs/orgs?apiVersion=2022-11-28#list-organizations-for-the-authenticated-user

export class GithubClient {
  octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  static fromToken(token: string) {
    const octokit = new Octokit({
      auth: token,
    });
    return new this(octokit);
  }

  static async fromInstallation(
    appId: string,
    privateKey: string,
    installationId: number,
  ) {
    const app = new App({
      appId,
      privateKey,
    });
    const octokit = await app.getInstallationOctokit(installationId);

    return new this(octokit);
  }

  async getOrgs() {
    const { data } = await this.octokit.request("GET /user/orgs", {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return data;
  }

  async getRepos(org: string) {
    const { data } = await this.octokit.request(`GET /orgs/${org}/repos`, {
      org: "ORG",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return data;
  }

  async getPullRequests({ owner, repo }: { owner: string; repo: string }) {
    const { data } = await this.octokit.request(
      `GET /repos/${owner}/${repo}/pulls?state=closed`,
      {
        owner: "OWNER",
        repo: "REPO",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    return data;
  }

  async getBranch({
    owner,
    repo,
    branch,
  }: {
    owner: string;
    repo: string;
    branch: string;
  }) {
    const result = await this.octokit.rest.repos.getBranch({
      owner: owner,
      repo: repo,
      branch: branch,
    });

    return result;
  }

  async getRepoReadme({ owner, repo }: { owner: string; repo: string }) {
    const { data } = await this.octokit.request(
      `GET /repos/${owner}/${repo}/readme`,
      {
        owner: "OWNER",
        repo: "REPO",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    return data;
  }

  /**
   * Get code changes (diffs) for all commits on the main branch within a time range.
   * Returns a combined diff summary with author, commit, and file patch information.
   */
  async getMainBranchHeadDiff({
    owner,
    repo,
    since,
    until,
    branch,
  }: {
    owner: string;
    repo: string;
    since: string; // ISO8601 date string
    until: string; // ISO8601 date string
    branch: string;
  }) {
    const productionBranch = await this.getBranch({
      owner,
      repo,
      branch,
    });

    if (!productionBranch) {
      console.error("Could not find production branch");
      return { commits: [], message: "Could not find production branch" };
    }

    const branchName = productionBranch.data.name;

    // Fetch commits on the branch in the given time range
    const { data: commits } = await this.octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: branchName,
      since,
      until,
      per_page: 100, // Adjust if you want more/less, pagination not handled here
    });

    if (!commits.length) {
      return {
        commits: [],
        message: "No commits found in the given time range.",
      };
    }

    const commitsData = [];

    for (const commit of commits) {
      const commitSha = commit.sha;
      const githubUser = commit.author;
      const commitAuthor = commit.commit.author || {};

      // Get commit details (to get file changes and patch)
      const { data: commitDetails } = await this.octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: commitSha,
      });

      const email = commitAuthor.email ?? githubUser?.email ?? "";
      const username = githubUser?.login ?? commitAuthor.name ?? "unknown";

      // Extract commit message and description
      const fullMessage = commitDetails.commit.message || "";
      const messageLines = fullMessage.split("\n");
      const commitMessage = messageLines[0] || "";
      const commitDescription = messageLines.slice(1).join("\n").trim() || null;

      const files = [];

      // Add file-level diffs for this commit
      if (Array.isArray(commitDetails.files)) {
        for (const file of commitDetails.files) {
          const { patch, filename, previous_filename, status } = file;
          if (status === "renamed") {
            files.push({
              filename,
              previous_filename,
              status,
              patch: null,
            });
          } else if (patch) {
            files.push({
              filename,
              previous_filename: previous_filename || null,
              status,
              patch,
            });
          }
        }
      }

      commitsData.push({
        sha: commitSha,
        author: {
          username,
          email,
        },
        date: commitAuthor.date ?? "",
        message: commitMessage,
        description: commitDescription,
        files,
      });
    }

    return { commits: commitsData };
  }

  async getIssueComments({
    owner,
    repo,
    issue_number,
  }: {
    owner: string;
    repo: string;
    issue_number: number;
  }) {
    const { data } = await this.octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number,
    });
    return data;
  }
  async createNewIssueComment({
    owner,
    repo,
    issue_number,
    body,
  }: {
    owner: string;
    repo: string;
    issue_number: number;
    body: string;
  }) {
    const { data } = await this.octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number,
      body,
    });
    return data;
  }

  async getFileChangesDiff({
    owner,
    repo,
    filePath,
    branch,
    limit = 1,
  }: {
    owner: string;
    repo: string;
    filePath: string;
    branch: string;
    limit: number;
  }) {
    // Remove leading slash if present from filePath
    if (filePath.startsWith("/")) {
      filePath = filePath.slice(1);
    }

    // Get the last `limit` commits that modified this file
    const { data: commits } = await this.octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: branch,
      path: filePath,
      per_page: limit,
    });

    const results: Array<{
      sha: string;
      author: string | null;
      date: string;
      diff: string;
    }> = [];

    for (const commit of commits) {
      const {
        sha,
        commit: { author },
        author: githubUser,
      } = commit;

      // Get the commit details, including changed files and their patches
      const { data: commitData } = await this.octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: sha,
      });

      // Find the entry for this file in the changed files and extract the patch
      const fileInfo = commitData.files?.find(
        (f) => f.filename === filePath || f.previous_filename === filePath,
      );

      results.push({
        sha,
        author: githubUser?.login ?? author?.name ?? null,
        date: author?.date ?? "",
        diff: fileInfo?.patch || "[no changes or binary file]",
      });
    }

    return results;
  }
}
