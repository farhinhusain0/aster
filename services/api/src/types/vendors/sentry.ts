export interface SentryProject {
  id: string;
  name: string;
  slug: string;
  platform: string;
}

export interface SentryIssue {
  id: string;
  title: string;
  culprit: string;
  logger: string | null;
  level: string;
  status: "resolved" | "unresolved" | "ignored";
  statusDetails: object;
  isPublic: boolean;
  isSubscribed: boolean;
  isBookmarked: boolean;
  hasSeen: boolean;
  userCount: number;
  count: string;
  firstSeen: string;
  lastSeen: string;
  numComments: number;
  project: {
    id: string;
    name: string;
    slug: string;
  };
  assignedTo: object | null;
  annotations: string[];
  metadata: SentryIssueMetadata;
  stats: {
    "24h": number[][];
  };
  shortId: string;
  shareId: string | null;
  permalink: string;
  subscriptionDetails: object | null;
  type: string;
}

export type SentryIssueMetadata =
  | {
      filename: string;
      type: string;
      value: string;
    }
  | {
      title: string;
    };

export type SentryGetIssuesResponse = SentryIssue[];
