import { IOrganization } from "@/api/calls/organizations";

export interface PDDetails {
  title?: string;
  priority?: {
    name?: string;
  };
  status: 'triggered' | 'resolved';
}

export interface JSMDetails {
  message: string;
  status: 'open' | 'closed';
  acknowledged: boolean;
  priority: string;
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
}

export enum InvestigationConfidenceLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
}