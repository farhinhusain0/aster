import { Types } from "mongoose";

// Beta
export interface IBetaCode {
  _id: Types.ObjectId;
  code: string;
  status: "new" | "used";
}

// Plan
export enum PlanFieldCode {
  seats = "seats",
  alerts = "alerts",
  queries = "queries",
  indexingAttempts = "indexingAttempts",
  indexingDocuments = "indexingDocuments",
}

export enum ResetMode {
  manual = "manual",
  hourly = "hourly",
  daily = "daily",
  weekly = "weekly",
  monthly = "monthly",
  yearly = "yearly",
}

export enum PlanFieldKind {
  number = "number",
  boolean = "boolean",
  string = "string",
}

export interface IPlanField {
  _id: Types.ObjectId;
  name: string;
  code: PlanFieldCode;
  kind: PlanFieldKind;
  initialValue?: number | boolean | string;
  granularity: "user" | "organization";
  canExceedLimit?: boolean;
  resetMode?: ResetMode;
}

export interface ISnapshot {
  _id: Types.ObjectId;
  stats: Record<string, number>;
  organization: Types.ObjectId | IOrganization;
}

export type IJob = {
  _id: Types.ObjectId;
  organization: Types.ObjectId | IOrganization;
  type: "ingest-knowledge";
  status: "pending" | "created" | "failed";
  phase: string;
};

export interface IPlan {
  _id: Types.ObjectId;
  name: string;
  fields: (IPlanField | Types.ObjectId)[];
  values: Record<string, number | boolean | string>;
}

export interface OrgLevelFieldState {
  value: number;
}

export interface UserLevelFieldState {
  users: Record<string, number>;
}

export interface ComputedUserLevelFieldState
  extends Omit<UserLevelFieldState, "users"> {
  value: number;
  limit: number;
  isAllowed: boolean;
}
export interface ComputedOrgLevelFieldState extends OrgLevelFieldState {
  limit: number;
  isAllowed: boolean;
}

export type FieldsState = Record<
  string,
  UserLevelFieldState | OrgLevelFieldState
>;

export interface IPlanState {
  _id: Types.ObjectId;
  plan: Types.ObjectId | IPlan;
  organization: Types.ObjectId | IOrganization;
  state: FieldsState;
}

// Vendor
export interface IVendor {
  _id: Types.ObjectId;
  name: VendorName;
  displayName: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIndex {
  _id: Types.ObjectId;
  name: string;
  type: "chromadb";
  organization: Types.ObjectId | IOrganization;
  dataSources: VendorName[];
  state: {
    status: "pending" | "created" | "failed";
    integrations: {
      [key: string]: "in_progress" | "in_queue" | "completed" | "failed";
    };
  };
  stats: { [key: string]: number };
}

export enum PasswordResetStatus {
  requested = "requested",
  completed = "completed",
}

// User
export interface IUser {
  _id: Types.ObjectId;
  email: string;
  status: "activated" | "invited" | "deactivated";
  role: "owner" | "member";
  organization: IOrganization;
  password: string;
  profile: IProfile;

  passwordResetStatus: PasswordResetStatus | null;
  passwordResetRequestedAt: Date | null;
  passwordResetCompletedAt: Date | null;
}

export interface IProfile {
  _id: Types.ObjectId;
  name: string;
  picture: string;
}

export interface IAuthToken {
  _id: Types.ObjectId;
  token: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user: IUser;
}

// Organization
export interface IOrganization {
  _id: Types.ObjectId;
  name: string;
  plan: IPlan | Types.ObjectId;
  domains: string[];
  logo: string;
}

// Integration
export interface BaseConnection {
  _id: Types.ObjectId;
  vendor: IVendor;
  organization: IOrganization;
  settings?: Record<string, unknown>;
  type: "basic" | "oauth";
  createdAt: Date;
  updatedAt: Date;
}

export interface SlackIntegration extends BaseConnection {
  credentials: {
    access_token: string;
  };
  metadata: {
    team: {
      id: string;
      name: string;
      url: string;
      domain: string;
      email_domain: string;
      icon: {
        image_default: boolean;
        image_34: string;
        image_44: string;
        image_68: string;
        image_88: string;
        image_102: string;
        image_132: string;
      };
      avatar_base_url: string;
      is_verified: boolean;
      lob_sales_home_enabled: boolean;
      is_sfdc_auto_slack: boolean;
    };
    auth: {
      url: string;
      team: string;
      user: string;
      team_id: string;
      user_id: string;
      bot_id: string;
      is_enterprise_install: boolean;
    };
    workspace_url: string;
  };
}

export interface PagerDutyIntegration extends BaseConnection {
  credentials: {
    id_token: string;
    access_token: string;
    refresh_token: string;
  };
  metadata: {
    client_info: string;
    token_type: string;
    scope: string;
    expires_in: number;
  };
  settings: {
    slackChannelId: string;
  };
}

export interface OpsgenieIntegration extends BaseConnection {
  credentials: {
    apiKey: string;
  };
  metadata: {
    region: "us" | "eu";
  };
  settings: {
    slackChannelId: string;
  };
}

export interface SentryIntegration extends BaseConnection {
  credentials: {
    personalToken: string;
  };
  settings: {
    organizationId: string; // Sentry Organization ID
    projectIds: string[]; // List of Sentry Project IDs
  };
}

export interface CoralogixIntegration extends BaseConnection {
  credentials: {
    logsKey: string; // Logs Query Key in Coralogix
    artKey: string; // Alerts, Rules and Tags Key
    auditKey: string; // Audit API Key
  };
  metadata: {
    region: "EU1" | "AP1" | "US1" | "EU2" | "AP2" | "US2";
    domainURL: string;
  };
  settings: {
    tools?: {
      readLogs?: CoralogixReadLogsToolSettings;
    };
  };
}

export interface DataDogIntegration extends BaseConnection {
  credentials: {
    apiKey: string;
    appKey: string;
  };
  metadata: {
    region?: "eu" | "us";
  };
}

export interface GrafanaIntegration extends BaseConnection {
  credentials: {
    token: string;
  };
  metadata: {
    instanceURL: string;
  };
}

export interface GithubIntegration extends BaseConnection {
  credentials: {
    access_token: string;
  };
  settings: {
    reposToSync: { repoName: string; branchName: string }[];
  };
}

export interface NotionIntegration extends BaseConnection {
  credentials: {
    access_token: string;
  };
  metadata: {
    bot_id: string;
    duplicated_template_id: string;
    owner: string;
    workspace_icon: string;
    workspace_id: string;
    workspace_name: string;
  };
}

export interface AtlassianIntegration extends BaseConnection {
  credentials: {
    email?: string;
    access_token: string;
    refresh_token: string;
  };
  metadata: {
    site_url?: string;
    expires_in: string;
    scope: string;
  };
}

export interface MongoDBIntegration extends BaseConnection {
  credentials: {
    dbUrl: string;
  };
}

export interface JaegerIntegration extends BaseConnection {
  // Jaegar don't have credentials (yet) so we keep an empty dict
  credentials: Record<string, string>;
  metadata: {
    instanceUrl: string;
  };
}

export interface PrometheusIntegration extends BaseConnection {
  // Prometheus supports basic auth. More information: https://prometheus.io/docs/guides/basic-auth/
  credentials: {
    username: string;
    password: string;
  };
  metadata: {
    instanceUrl: string;
  };
}

export interface TeamsIntegration extends BaseConnection {
  credentials: {
    access_token: string;
    refresh_token: string;
  };
  metadata: {
    tenantId: string;
    teamId: string;
    aadGroupId: string;
    channelId: string;
    fromId: string;
    fromAadObjectId: string;
    conversationReference: {
      activityId: string;
      user: {
        id: string;
        aadObjectId: string;
      };
      bot: {
        id: string;
        name: string;
      };
      conversation: {
        isGroup: boolean;
        conversationType: string;
        name: string;
        id: string;
        tenantId: string;
      };
      channelId: string;
      locale: string;
      serviceUrl: string;
    };
    subscription?: {
      id: string;
      resource: string;
      changeType: string;
      notificationUrl: string;
      expirationDateTime: string;
      clientState: string;
    };
  };
}

export interface JiraServiceManagementIntegration extends BaseConnection {
  credentials: {
    apiKey: string;
  };
  metadata: {
    siteUrl: string;
  };
}

export type IIntegration =
  | SlackIntegration
  | PagerDutyIntegration
  | OpsgenieIntegration
  | CoralogixIntegration
  | DataDogIntegration
  | GrafanaIntegration
  | GithubIntegration
  | NotionIntegration
  | AtlassianIntegration
  | MongoDBIntegration
  | JaegerIntegration
  | PrometheusIntegration
  | TeamsIntegration
  | SentryIntegration
  | JiraServiceManagementIntegration;

export interface IWebhook extends BaseConnection {
  secret: string;
}

// Tool Settings
export interface CoralogixReadLogsToolSettings {
  allowedFields: string[];
}

export enum VendorName {
  Github = "Github",
  Coralogix = "Coralogix",
  Opsgenie = "Opsgenie",
  Slack = "Slack",
  PagerDuty = "PagerDuty",
  DataDog = "DataDog",
  MongoDB = "MongoDB",
  Grafana = "Grafana",
  Notion = "Notion",
  Atlassian = "Atlassian",
  Jaeger = "Jaeger",
  Prometheus = "Prometheus",
  AlertManager = "Alert Manager",
  Teams = "Teams",
  Sentry = "Sentry",
  JiraServiceManagement = "Jira Service Management",
}

export interface IInvestigation {
  _id: Types.ObjectId;
  hypothesis: string;
  organization: IOrganization;
  status: "init" | "active" | "resolved" | "dismissed";
  pdIncidentId?: string | null;
  pdDetails?: Object | null;
  createdAt: Date;
  updatedAt: Date;
  jsmDetails?: Object | null;
  secondaryInvestigationId?: string;
}

export interface IInvestigationCheck {
  _id: Types.ObjectId;
  investigation: IInvestigation;
  source: "github" | "grafana" | "datadog" | "sentry";
  action: Object;
  result: Object;
  createdAt: Date;
  updatedAt: Date;
}
