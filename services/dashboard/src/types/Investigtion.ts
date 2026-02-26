import { IOrganization } from "@/api/calls/organizations";

export interface PDDetails {
  title?: string;
  priority?: {
    name?: string;
  };
  status: "triggered" | "resolved";
}

export interface JSMDetails {
  message: string;
  status: "open" | "closed";
  acknowledged: boolean;
  priority: string;
}

export interface ICheckFile {
  filename: string;
  url: string;
  text?: string;
}

export interface ICodeChangeDiffFile {
  filename: string;
  patch: string;
}

export interface ICodeChangeDiff {
  commits: Array<{
    author: {
      username: string;
      email: string;
    };
    files: Array<ICodeChangeDiffFile>;
    date: string;
    description: string;
    message: string;
    sha: string;
  }>;
}

export interface ISentryIssue {
  permalink: string;
  count: number;
  userCount: number;
}

export interface ISentryStats {
  timeSeries: Array<{
    yAxis: string;
    values: Array<{
      value: number;
      timestamp: string;
    }>;
  }>;
}

export interface IGrafanaLogsStats {
  values: Array<[number, string]>;
}

export interface IDatadogLogsStats {
  timestamp: string;
  value: number;
};

export interface IInvestigationCheck {
  _id: string;
  source: string;
  result: {
    summary: string;
    explanation?: string;
  };
  action?: {
    query?: string;
    url?: string;
    files?: Array<ICheckFile>;
    diffs?: Record<string, ICodeChangeDiff>;
    issue?: ISentryIssue;
    issue_title?: string;
    stats?: ISentryStats | IGrafanaLogsStats | IDatadogLogsStats[];
    latest_event?: object;
    codeChangeSHAs?: string[];
    codeChangesDescription?: string;
  };
}

export interface IInvestigation {
  _id: string;
  hypothesis: string;
  organization: IOrganization;
  status: "init" | "active" | "resolved" | "dismissed";
  pdIncidentId?: string | null;
  pdDetails?: PDDetails | null;
  createdAt: Date;
  updatedAt: Date;
  jsmDetails?: JSMDetails | null;
  checks: Array<IInvestigationCheck>;
  rootCause: string;
  recommendedFix: string;
  confidenceLevel: InvestigationConfidenceLevel;
  codeChangesSHA: string;
}

export enum InvestigationConfidenceLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export enum InvestigationCheckSource {
  Github = "github",
  Grafana = "grafana",
  Datadog = "datadog",
  Sentry = "sentry",
}

export interface SentryFrame {
  filename: string;
  absPath: string;
  function: string | null;
  context: Array<[number, string]>;
  lineNo: number;
  colNo: number;
  inApp: boolean;
}

export interface SentryExceptionValue {
  type: string;
  value: string;
  stacktrace: {
    frames: SentryFrame[];
  } | null;
}

export interface SentryEntry {
  type: string;
  data: {
    values?: SentryExceptionValue[];
  };
}

export interface SentryLatestEvent {
  entries: SentryEntry[];
  title: string;
}

export interface ParsedFrame {
  filename: string;
  code: string;
  startLine: number;
  errorLine?: number;
}
