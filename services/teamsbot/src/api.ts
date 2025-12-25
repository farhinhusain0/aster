import axios from "axios";
import { ChatMessage } from "./types";

interface CompletionParams {
  messages: ChatMessage[];
  email?: string;
  tenantId: string;
  isInvestigation: boolean;
}

export async function getCompletion({
  messages,
  email,
  tenantId,
  isInvestigation,
}: CompletionParams) {
  const response = await axios.post(
    `${process.env.API_URL}/chat/completions/teams`,
    {
      messages,
      metadata: {},
      isInvestigation,
    },
    {
      headers: {
        "x-teams-app-password": process.env.MICROSOFT_APP_PASSWORD,
        "x-teams-app-id": process.env.MICROSOFT_APP_ID,
        "x-teams-email": email,
        "x-teams-tenant": tenantId,
      },
    },
  );

  return response.data;
}

interface UpdateInvestigationParams {
  hypothesis: string;
  investigationId: string;
  email?: string;
  tenantId: string;
  vendorName: string;
  incidentId: string;
}

export async function updateInvestigation({
  hypothesis,
  investigationId,
  email = "",
  tenantId,
  vendorName,
  incidentId,
}: UpdateInvestigationParams) {
  const response = await axios.post(`${process.env.API_URL}/investigations/teams`, {
    hypothesis,
    investigationId,
    vendorName,
    incidentId,
  }, {
    headers: {
      "x-teams-app-password": process.env.MICROSOFT_APP_PASSWORD,
      "x-teams-app-id": process.env.MICROSOFT_APP_ID,
      "x-teams-email": email,
      "x-teams-tenant": tenantId,
    },
  });
  return response.data;
}

export async function updateIncident(incidentId: string, tenantId: string) {
  const response = await axios.post(`${process.env.API_URL}/investigations/teams/update-incident`, {
    incidentId,
  }, {
    headers: {
      "x-teams-app-password": process.env.MICROSOFT_APP_PASSWORD,
      "x-teams-app-id": process.env.MICROSOFT_APP_ID,
      "x-teams-tenant": tenantId,
    },
  });
  return response.data;
}