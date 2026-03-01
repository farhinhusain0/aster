import axios, { AxiosInstance } from "axios";


export class SentryClient {
  /**
   * Fetch a single event for a specific Sentry issue.
   * @param issueId The Sentry issue ID.
   * @param eventId The event ID.
   * @returns The event object for the issue.
   */
  getIssueEvent = async (issueId: string, eventId: string) => {
    try {
      const response = await this.axios.get(`/issues/${issueId}/events/${eventId}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Sentry issue event:", error);
      throw error;
    }
  };
  /**
   * Fetch events for a specific Sentry issue.
   * @param issueId The Sentry issue ID (not group ID).
   * @returns Array of events for the issue.
   */
  getIssueEvents = async (issueId: string) => {
    try {
      const response = await this.axios.get(`/issues/${issueId}/events/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Sentry issue events:", error);
      throw error;
    }
  };
  private readonly token: string;
  private readonly orgSlug: string;
  private readonly axios: AxiosInstance;

  constructor(token: string, orgSlug: string) {
    this.token = token;
    this.orgSlug = orgSlug;
    this.axios = axios.create({
      baseURL: `https://sentry.io/api/0/organizations/${orgSlug}`,
    });
    this.axios.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${this.token}`;
      return config;
    });
  }

  /**
   * Fetch issues for the organization.
   * @param params Query params: project (array or string), statsPeriod, sort, limit, etc.
   * Defaults: statsPeriod="24h", sort="date", limit=100
   */
  getIssues = async (params: {
    project: string[] | string;
    statsPeriod?: string;
    sort?: string;
    limit?: number;
  }) => {
    try {
      // Sentry expects multiple project params as repeated keys
      const searchParams = new URLSearchParams();
      if (Array.isArray(params.project)) {
        params.project.forEach((p) => searchParams.append("project", p));
      } else {
        searchParams.append("project", params.project);
      }
      // Set default values if not provided
      const statsPeriod = params.statsPeriod ?? "24h";
      const sort = params.sort ?? "date";
      const limit = params.limit ?? 100;
      searchParams.append("statsPeriod", statsPeriod);
      searchParams.append("sort", sort);
      searchParams.append("limit", limit.toString());

      console.log('#### Requesting:', `/issues/?${searchParams.toString()}`);
      console.log("#### headers:", this.axios.defaults.headers);
      const response = await this.axios.get(`/issues/?${searchParams.toString()}`);
      
      return response.data;
    } catch (error) {
      console.error("Error fetching Sentry issues:", error);
      throw error;
    }
  };

  /**
   * Fetch the timeseries data for a specific Sentry issue.
   * 
   * Documentation: https://docs.sentry.io/api/explore/query-explore-events-in-timeseries-format/
   * 
   * @param {object} options - The options for the request.
   * @param {string} options.issueId - The Sentry issue ID.
   * @param {string} options.statsPeriod - The stats period.
   * @returns The timeseries data for the issue.
   */
  getIssueEventsTimeseries = async ({
    issueId,
    statsPeriod = "24h",
  }: {
    issueId: string;
    statsPeriod?: string;
  }) => {
    try {
      const response = await this.axios.get(
        /**
         * You can get all `query` properties and it's convention [here](https://docs.sentry.io/concepts/search/searchable-properties/) if needed.
         */
        `/events-timeseries/?query=issue.id:${issueId}&statsPeriod=${statsPeriod}&yAxis=count()&yAxis=count_unique(user)`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching Sentry issue stats:", error);
      throw error;
    }
  };
}
