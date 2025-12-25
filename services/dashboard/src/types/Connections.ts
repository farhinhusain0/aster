/* eslint-disable @typescript-eslint/no-explicit-any */

export enum ConnectionName {
  Teams = "Teams",
  Github = "Github",
  Coralogix = "Coralogix",
  Opsgenie = "Opsgenie",
  Slack = "Slack",
  PagerDuty = "PagerDuty",
  DataDog = "DataDog",
  Sentry = "Sentry",
  Notion = "Notion",
  Confluence = "Confluence",
  Jira = "Jira",
  MongoDB = "MongoDB",
  Grafana = "Grafana",
  Jaeger = "Jaeger",
  Prometheus = "Prometheus",
  AlertManager = "Alert Manager",
  JiraServiceManagement = "Jira Service Management",
}

export enum ConnectionType {
  Integration = "Integration",
  Webhook = "Webhook",
}

export interface Vendor {
  _id: string;
  name: ConnectionName;
  displayName: string;
  description: string;
}

export interface ConnectionProps {
  orgId: string;
  formData?: any;
  setFormData: (value: any) => any;
  setRequestData: (value: any) => any;
  data?: any;
}

export enum Mode {
  View = "View",
  Connect = "Connect",
}

export interface Integration {
  _id: string;
  type: "basic" | "oauth";
  vendor: Vendor;
  organization: string;
  metadata: any;
  credentials: any;
  settings?: any;
  updatedAt: string;
  createdAt: string;
}

export interface ConnectRequest {
  url?: string;
  body?: any;
  config?: any;
}
