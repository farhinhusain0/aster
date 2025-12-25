export interface SentryIssueEventUserGeo {
  [key: string]: string;
}

export interface SentryIssueEventUser {
  id: string | null;
  email: string | null;
  username: string | null;
  ip_address: string | null;
  name: string | null;
  geo: SentryIssueEventUserGeo | null;
  data: Record<string, unknown> | null;
}

export interface SentryIssueEventTag {
  key: string;
  value: string;
  query?: string;
}

export interface SentryIssueEvent {
  id: string;
  "event.type": string;
  groupID: string | null;
  eventID: string;
  projectID: string;
  message: string;
  title: string;
  location: string | null;
  culprit: string | null;
  user: SentryIssueEventUser | null;
  tags: SentryIssueEventTag[];
  platform: string | null;
  dateCreated: string;
  crashFile: string | null;
  metadata: Record<string, unknown> | null;
}

export type SentryGetIssueEventResponse = SentryIssueEvent[];
