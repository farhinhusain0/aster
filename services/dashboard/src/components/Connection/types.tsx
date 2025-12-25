/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConnectionName } from "../../types/Connections";

export interface IntegrationPayload {
  vendor: ConnectionName;
  organization: string;
  metadata: any;
  credentials: any;
  settings?: any;
}

export interface FieldConfiguration {
  key: string;
  label: string;
  placeholder?: string;
  subtitle?: string;
  type: "credentials" | "metadata" | "settings";
  input?: {
    type: "select" | "text" | "secret" | "dynamic-text";
    options?: string[];
    shape?: {
      key: string;
      label: string;
      placeholder?: string;
    }[];
  };
}
