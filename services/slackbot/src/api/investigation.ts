import axios from "axios";
import { InvestigationConfidenceLevel } from "@aster/db";

export async function createInvestigation({
  investigationId,
  hypothesis,
  rootCause,
  recommendedFix,
  confidenceLevel,
  codeChangesSHA,
  pdIncidentId,
  email,
  team,
}: {
  investigationId: string;
  hypothesis: string;
  rootCause: string;
  recommendedFix: string;
  confidenceLevel: InvestigationConfidenceLevel;
  codeChangesSHA: string;
  pdIncidentId: string | undefined;
  email: string;
  team: string;
}) {
  console.log("calling createInvestigation API");

  const response = await axios.post(
    `${process.env.API_URL}/investigations/slack`,
    {
      investigationId,
      hypothesis,
      rootCause,
      recommendedFix,
      confidenceLevel,
      codeChangesSHA,
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
