export interface SentryEventUserGeo {
  [key: string]: string;
}

export interface SentryEventUser {
  id: string | null;
  email: string | null;
  username: string | null;
  ip_address: string | null;
  name: string | null;
  geo: SentryEventUserGeo | null;
  data: Record<string, unknown> | null;
}

export interface SentryEventTag {
  key: string;
  value: string;
  query?: string;
}

export interface SentryEventRelease {
  id: number;
  commitCount: number;
  data: Record<string, unknown>;
  dateCreated: string;
  dateReleased: string | null;
  deployCount: number;
  ref: string | null;
  lastCommit: Record<string, unknown> | null;
  lastDeploy: {
    dateStarted: string | null;
    url: string | null;
    id: string;
    environment: string;
    dateFinished: string;
    name: string;
  } | null;
  status: string;
  url: string | null;
  userAgent: string | null;
  version: string | null;
  versionInfo: {
    description: string;
    package: string | null;
    version: Record<string, unknown>;
    buildHash: string | null;
  } | null;
}

export interface SentryEventUserReportUser {
  id: string;
  username: string | null;
  email: string | null;
  name: string | null;
  ipAddress: string | null;
  avatarUrl: string | null;
}

export interface SentryEventUserReportEvent {
  id: string;
  eventID: string;
}

export interface SentryEventUserReport {
  id: string;
  eventID: string;
  name: string | null;
  email: string | null;
  comments: string;
  dateCreated: string;
  user: SentryEventUserReportUser | null;
  event: SentryEventUserReportEvent;
}

export interface SentryEvent {
  id: string;
  groupID: string | null;
  eventID: string;
  projectID: string;
  message: string | null;
  title: string;
  location: string | null;
  user: SentryEventUser | null;
  tags: SentryEventTag[];
  platform: string;
  dateReceived: string | null;
  contexts: Record<string, unknown> | null;
  size: number | null;
  entries: unknown[];
  dist: string | null;
  sdk: Record<string, string>;
  context: Record<string, unknown> | null;
  packages: Record<string, unknown>;
  type: string;
  metadata: unknown;
  errors: unknown[];
  occurrence: unknown;
  _meta: Record<string, unknown>;
  crashFile: string | null;
  culprit: string | null;
  dateCreated: string;
  fingerprints: string[];
  groupingConfig: unknown;
  startTimestamp: string;
  endTimestamp: string;
  measurements: unknown;
  breakdowns: unknown;
  release: SentryEventRelease | null;
  userReport: SentryEventUserReport | null;
  sdkUpdates: Record<string, unknown>[];
  resolvedWith: string[];
  nextEventID: string | null;
  previousEventID: string | null;
}

export type SentryGetIssueEventsResponse = SentryEvent[];
