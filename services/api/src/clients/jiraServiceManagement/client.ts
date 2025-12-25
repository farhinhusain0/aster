import { OpsgenieClient } from "../opsgenie";

export class JiraServiceManagementClient {
  private readonly apiKey: string;
  /**
   * Jira Service Management is nothing but Opsgenie.
   * So we use the Opsgenie client to get the alerts.
   */
  private readonly client: OpsgenieClient;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new OpsgenieClient(apiKey, "us");
  }

  getAlert = async (alertId: string) => {
    const response = await this.client.getAlert(alertId);
    return response.data;
  };
}
