import axios from "axios";

export async function getIntegration({
  teamId,
  enterpriseId,
}: {
  teamId?: string;
  enterpriseId?: string;
}) {
  const queryString = teamId
    ? `metadata.team.id=${teamId}`
    : `metadata.enterprise.id=${enterpriseId}`;
  const { data } = await axios.get(
    `${process.env.API_URL}/integrations/slack?${queryString}`,
    {
      headers: {
        "x-slack-app-token": process.env.SLACK_APP_TOKEN,
      },
    },
  );
  return data[0];
}
