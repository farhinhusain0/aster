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

  private get headers() {
    return { "X-GitHub-Api-Version": "2022-11-28" } as const;
  }

  async getOrgs() {
    const { data } = await this.octokit.request("GET /user/orgs", {
      headers: this.headers,
    });

    return data;
  }

  async getRepos(org: string) {
    const { data } = await this.octokit.request(`GET /orgs/${org}/repos`, {
      org: "ORG",
      headers: this.headers,
    });

    return data;
  }

  async getPullRequests({ owner, repo }: { owner: string; repo: string }) {
    const { data } = await this.octokit.request(
      `GET /repos/${owner}/${repo}/pulls?state=closed`,
      {
        owner: "OWNER",
        repo: "REPO",
        headers: this.headers,
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
        headers: this.headers,
      },
    );

    return data;
  }

  private extractAuthor(commit: {
    author: { login?: string; email?: string | null } | null;
    commit: { author: { name?: string; email?: string | null } | null };
  }) {
    const githubUser = commit.author;
    const commitAuthor = commit.commit.author || {};
    return {
      username: githubUser?.login ?? commitAuthor.name ?? "unknown",
      email: commitAuthor.email ?? githubUser?.email ?? "",
    };
  }

  private parseCommitMessage(fullMessage: string) {
    const lines = fullMessage.split("\n");
    return {
      message: lines[0] || "",
      description: lines.slice(1).join("\n").trim() || null,
    };
  }

  private extractFileChanges(
    files: Array<{
      patch?: string;
      filename: string;
      previous_filename?: string;
      status?: string;
    }>,
    filterPath?: string,
  ) {
    const result: Array<{
      filename: string;
      previous_filename: string | null;
      status: string | undefined;
      patch: string | null;
    }> = [];

    for (const file of files) {
      if (
        filterPath &&
        file.filename !== filterPath &&
        file.previous_filename !== filterPath
      )
        continue;

      const { patch, filename, previous_filename, status } = file;
      if (status === "renamed") {
        result.push({
          filename,
          previous_filename: previous_filename ?? null,
          status,
          patch: null,
        });
      } else if (patch) {
        result.push({
          filename,
          previous_filename: previous_filename || null,
          status,
          patch,
        });
      }
    }

    return result;
  }

  /**
   * Fetches full commit details for each commit and returns a normalized
   * array of commit data with author, message, and file changes.
   * When filterPath is provided, only file changes matching that path are included.
   */
  private async enrichCommits(
    owner: string,
    repo: string,
    commits: Array<{
      sha: string;
      author: { login?: string; email?: string | null } | null;
      commit: {
        author: { name?: string; email?: string | null; date?: string } | null;
      };
    }>,
    filterPath?: string,
  ) {
    const commitsData = [];

    for (const commit of commits) {
      const { data: commitDetails } = await this.octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: commit.sha,
      });

      const author = this.extractAuthor(commit);
      const { message, description } = this.parseCommitMessage(
        commitDetails.commit.message || "",
      );
      const files = this.extractFileChanges(
        commitDetails.files || [],
        filterPath,
      );

      commitsData.push({
        sha: commit.sha,
        author,
        date: commit.commit.author?.date ?? "",
        message,
        description,
        files,
      });
    }

    return commitsData;
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
    const productionBranch = await this.getBranch({ owner, repo, branch });

    if (!productionBranch) {
      console.error("Could not find production branch");
      return { commits: [], message: "Could not find production branch" };
    }

    const { data: commits } = await this.octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: productionBranch.data.name,
      since,
      until,
      per_page: 100,
    });

    if (!commits.length) {
      return {
        commits: [],
        message: "No commits found in the given time range.",
      };
    }

    return { commits: await this.enrichCommits(owner, repo, commits) };
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
    if (filePath.startsWith("/")) {
      filePath = filePath.slice(1);
    }

    const { data: commits } = await this.octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: branch,
      path: filePath,
      per_page: limit,
    });

    if (!commits.length) {
      return {
        commits: [],
        message: "No commits found for the given file.",
      };
    }

    return {
      commits: await this.enrichCommits(owner, repo, commits, filePath),
    };
  }
}
