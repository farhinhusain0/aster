import axios from "axios";

export async function createInvestigation({
  investigationId,
  hypothesis,
  pdIncidentId,
  email,
  team,
}: {
  investigationId: string;
  hypothesis: string;
  pdIncidentId: string | undefined;
  email: string;
  team: string;
}) {
  console.log("calling createInvestigation API");

  const response = await axios.post(
    `${process.env.API_URL}/investigations/slack`,
    { investigationId, hypothesis, pdIncidentId },
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
