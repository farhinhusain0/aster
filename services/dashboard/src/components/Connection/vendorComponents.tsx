import { ConnectionName } from "@/types/Connections";

import {
  basicIntegrations,
  oauthIntegrations,
} from "@/components/Connection/integrations";
import { isEnterprise } from "@/utils/ee";
import { MICROSOFT_TEAMS_APP_ID } from "@/constants";

export const connectVendor = {
  // Enterprise-changing (OAuth) integrations
  [ConnectionName.Teams]: oauthIntegrations.ConnectTeamsIntegration,
  [ConnectionName.Github]: !isEnterprise()
    ? basicIntegrations.ConnectGithubIntegration
    : oauthIntegrations.ConnectGithubIntegration,
  [ConnectionName.JiraServiceManagement]:
    basicIntegrations.ConnectJiraServiceManagementIntegration,
  [ConnectionName.Slack]: !isEnterprise()
    ? basicIntegrations.ConnectSlackIntegration
    : oauthIntegrations.ConnectSlackIntegration,
  [ConnectionName.PagerDuty]: !isEnterprise()
    ? basicIntegrations.ConnectPagerDutyIntegration
    : oauthIntegrations.ConnectPagerDutyIntegration,
  [ConnectionName.Opsgenie]: basicIntegrations.ConnectOpsgenieIntegration,
  [ConnectionName.Notion]: !isEnterprise()
    ? basicIntegrations.ConnectNotionIntegration
    : oauthIntegrations.ConnectNotionIntegration,
  [ConnectionName.Confluence]: !isEnterprise()
    ? basicIntegrations.ConnectConfluenceIntegration
    : oauthIntegrations.ConnectConfluenceIntegration,
  [ConnectionName.Jira]: !isEnterprise()
    ? basicIntegrations.ConnectJiraIntegration
    : oauthIntegrations.ConnectJiraIntegration,
  [ConnectionName.MongoDB]: basicIntegrations.ConnectMongoDBIntegration,
  [ConnectionName.Prometheus]: basicIntegrations.ConnectPrometheusIntegration,
  [ConnectionName.AlertManager]:
    basicIntegrations.ConnectAlertManagerIntegration,

  // Basic (non-OAuth) integrations
  [ConnectionName.Coralogix]: basicIntegrations.ConnectCoralogixIntegration,
  [ConnectionName.Grafana]: basicIntegrations.ConnectGrafanaIntegration,
  [ConnectionName.Jaeger]: basicIntegrations.ConnectJaegerIntegration,
  [ConnectionName.DataDog]: basicIntegrations.ConnectDataDogIntegration,
  [ConnectionName.Sentry]: basicIntegrations.ConnectSentryIntegration,
};

export const integrationHint = {
  [ConnectionName.Slack]: {
    unauthenticated: (
      <span>
        To connect Slack, retrieve your bot user OAuth token from your Slack
        API's OAuth & Permissions page and paste it here. For detailed
        instructions, refer to the{" "}
        <a
          className="text-brand-secondary"
          target="_blank"
          href="https://api.slack.com/tutorials/tracks/getting-a-token"
        >
          Slack API documentation
        </a>
        .
      </span>
    ),
    alertHeader: "Disconnect Slack?",
    alertDescription:
      "Removing this integration will disconnect Slack from your organization in Aster. This action won't affect your Slack workspace but will stop all incident notifications and updates from Aster.",
  },
  [ConnectionName.PagerDuty]: {
    unauthenticated: (
      <span>
        To proceed, retrieve your PagerDuty API access key from your PagerDuty
        Dashboard Integrations API Access Keys. For detailed instructions, refer
        to the{" "}
        <a
          className="text-brand-secondary"
          target="_blank"
          href="https://support.pagerduty.com/docs/api-access-keys#generate-a-general-access-rest-api-key"
        >
          PagerDuty API documentation
        </a>
        .
      </span>
    ),
    alertHeader: "Disconnect PagerDuty?",
    alertDescription:
      "Removing this integration will disconnect PagerDuty from your organization in Aster. This action won't affect your PagerDuty workspace but will stop all incident notifications and updates from Aster.",
  },
  [ConnectionName.Github]: {
    unauthenticated: (
      <span>
        To connect GitHub, generate a personal access token(classic) from your
        GitHub account. For detailed instructions, refer to the{" "}
        <a
          className="text-brand-secondary"
          target="_blank"
          href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic"
        >
          GitHub documentation
        </a>
        .
      </span>
    ),
    alertHeader: "Disconnect GitHub?",
    alertDescription:
      "Removing this integration will disconnect GitHub from your organization in Aster. This action won’t affect your GitHub workspace but will stop all incident notifications and updates from Aster.",
  },
  [ConnectionName.Grafana]: {
    unauthenticated: (
      <span>
        To connect Grafana, retrieve your service account token and instance URL
        from Grafana. For more detailed instructions, refer to the{" "}
        <a
          className="text-brand-secondary"
          target="_blank"
          href="https://grafana.com/docs/grafana/latest/developers/http_api/"
        >
          Grafana documentation
        </a>
        .
      </span>
    ),
    alertHeader: "Disconnect Grafana?",
    alertDescription:
      "Removing this integration will disconnect Grafana from your organization in Aster. This action won't affect your Grafana workspace but will stop all incident notifications and updates from Aster.",
  },
  [ConnectionName.Opsgenie]: {
    unauthenticated: (
      <span>
        To connect Opsgenie, create an API integration in Opsgenie and retrieve
        the API key. For detailed instructions, refer to{" "}
        <a
          className="text-brand-secondary"
          target="_blank"
          href="https://support.atlassian.com/opsgenie/docs/create-a-default-api-integration/"
        >
          Opsgenie Support
        </a>
        .
      </span>
    ),
    alertHeader: "Disconnect Opsgenie?",
    alertDescription:
      "Removing this integration will disconnect Opsgenie from your organization in Aster. This action won't affect your Opsgenie workspace but will stop all incident notifications and updates from Aster.",
  },
  [ConnectionName.Coralogix]: {
    unauthenticated: (
      <span>
        To proceed, retrieve your API keys from Data Flow{">"}API Keys and your
        domain URL from Settings{">"}Preferences.
      </span>
    ),
    alertHeader: "Disconnect Coralogix?",
    alertDescription:
      "Removing this integration will disconnect Coralogix from your organization in Aster. This action won't affect your Coralogix workspace but will stop all incident notifications and updates from Aster.",
  },
  [ConnectionName.DataDog]: {
    unauthenticated: (
      <span>
        To connect Datadog, retrieve your API keys from DataDog. For more
        detailed instructions, visit the{" "}
        <a
          className="text-brand-secondary"
          target="_blank"
          href="https://docs.datadoghq.com/account_management/api-app-keys/"
        >
          DataDog documentation
        </a>
        .
      </span>
    ),
    alertHeader: "Disconnect DataDog?",
    alertDescription:
      "Removing this integration will disconnect DataDog from your organization in Aster. This action won't affect your DataDog workspace but will stop all incident notifications and updates from Aster.",
  },
  [ConnectionName.Sentry]: {
    unauthenticated: (
      <span>
        To connect Sentry, create a personal token with read permissions for the
        Organization, Project, and Issue $ Event. For detailed instructions,
        refer to the{" "}
        <a
          className="text-brand-secondary"
          target="_blank"
          href="https://docs.sentry.io/account/auth-tokens/"
        >
          Slack documentation
        </a>
        .
      </span>
    ),
    alertHeader: "Disconnect Sentry?",
    alertDescription:
      "Removing this integration will disconnect Sentry from your organization in Aster. This action won't affect your Sentry workspace but will stop all incident notifications and updates from Aster.",
  },
  [ConnectionName.Notion]: {
    unauthenticated: (
      <span>
        To proceed, retrieve your API key from the Notion integrations page. For
        detailed instructions, refer to{" "}
        <a
          className="text-brand-secondary"
          target="_blank"
          href="https://developers.notion.com/docs/authorization#internal-integration-auth-flow-set-up"
        >
          Notion API Guides
        </a>
        .
      </span>
    ),
    alertHeader: "Disconnect Notion?",
    alertDescription:
      "Removing this integration will disconnect Notion from your organization in Aster. This action won't affect your Notion workspace but will stop all incident notifications and updates from Aster.",
  },
  [ConnectionName.Confluence]: {
    unauthenticated: (
      <span>
        To connect Confluence, generate an API token and insert your Atlassian
        user email and site URL. For detailed instructions, refer to{" "}
        <a
          className="text-brand-secondary"
          target="_blank"
          href="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/"
        >
          Atlassian support
        </a>
        .
      </span>
    ),
    alertHeader: "Disconnect Confluence?",
    alertDescription:
      "Removing this integration will disconnect Confluence from your organization in Aster. This action won't affect your Confluence workspace but will stop all incident notifications and updates from Aster.",
  },
  [ConnectionName.Jira]: {
    unauthenticated: (
      <span>
        To connect Jira, generate an API token and insert your Atlassian user
        email and site URL. For detailed instructions, refer to{" "}
        <a
          className="text-brand-secondary"
          target="_blank"
          href="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/"
        >
          Atlassian support
        </a>
        .
      </span>
    ),
    alertHeader: "Disconnect Jira?",
    alertDescription:
      "Removing this integration will disconnect Jira from your organization in Aster. This action won't affect your Jira workspace but will stop all incident notifications and updates from Aster.",
  },
  [ConnectionName.Jaeger]: {
    unauthenticated: (
      <span>
        To connect Jaegar, provide the API URL of your Jaegar instance.
      </span>
    ),
    alertHeader: "Disconnect Jaeger?",
    alertDescription:
      "Removing this integration will disconnect Jaeger from your organization in Aster. This action won't affect your Jaeger workspace but will stop all incident notifications and updates from Aster.",
  },
  [ConnectionName.Teams]: {
    unauthenticated: (
      <span>
        To connect Teams, install the{" "}
        <a
          className="text-brand-secondary"
          target="_blank"
          href={`https://teams.microsoft.com/l/app/${MICROSOFT_TEAMS_APP_ID}?source=share-app-dialog`}
        >
          Aster Teams bot
        </a>{" "}
        in your team channel.
      </span>
    ),
    alertHeader: "Disconnect Teams?",
    alertDescription:
      "Removing this integration will disconnect Teams from your organization in Aster. This action won't affect your Teams workspace but will stop all incident notifications and updates from Aster.",
  },
  [ConnectionName.JiraServiceManagement]: {
    unauthenticated: (
      <span>
        To connect Jira Service Management, create an API integration and insert the API key. For detailed instructions, refer
        to{" "}
        <a
          className="text-brand-secondary"
          target="_blank"
          href="https://support.atlassian.com/jira-service-management-cloud/docs/set-up-an-api-integration/"
        >
          Atlassian support
        </a>
        .
      </span>
    ),
    alertHeader: "Disconnect Jira Service Management?",
    alertDescription:
      "Removing this integration will disconnect Jira Service Management from your organization in Aster. This action won't affect your Jira Service Management workspace but will stop all incident notifications and updates from Aster.",
  },
};
