import axios from "axios";
import { InvestigationConfidenceLevel } from "@aster/db";

interface CreateInvestigationParams {
  investigationId: string;
  hypothesis: string;
  rootCause: string;
  recommendedFix: string;
  confidenceLevel: InvestigationConfidenceLevel;
  codeChangeSHAs: string[];
  codeChangesDescription: string;
  pdIncidentId: string | undefined;
  email: string;
  team: string;
}

export async function createInvestigation({
  investigationId,
  hypothesis,
  rootCause,
  recommendedFix,
  confidenceLevel,
  codeChangeSHAs,
  codeChangesDescription,
  pdIncidentId,
  email,
  team,
}: CreateInvestigationParams) {
  console.log("calling createInvestigation API");

  const response = await axios.post(
    `${process.env.API_URL}/investigations/slack`,
    {
      investigationId,
      hypothesis,
      rootCause,
      recommendedFix,
      confidenceLevel,
      codeChangeSHAs,
      codeChangesDescription,
      pdIncidentId,
    },
    {
      headers: {
        "x-slack-app-token": process.env.SLACK_APP_TOKEN,
        "x-slack-email": email,
        "x-slack-team": team,
      },
    },
  );
  return response.data;
}
