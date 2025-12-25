import { AuthorizeResult } from "@slack/bolt";
import type { SlackIntegration } from "@aster/db";
import { integrationModel } from "@aster/db";
import { secretManager } from "./secrets";

// This function is responsible for fetching the relevant credentials
// from the database & secrets manager, and returning them to Slack.
// This is necessary for a multiple workspaces setup.
// https://slack.dev/bolt-js/concepts#authorization

export async function authorize({
  enterpriseId,
  teamId,
}: {
  enterpriseId?: string;
  teamId?: string;
}): Promise<AuthorizeResult> {
  console.log("[SlackBotRequestAuthorizer] Authorizing request...");
  console.log(
    "[SlackBotRequestAuthorizer] Received enterpriseId:",
    enterpriseId,
  );
  console.log("[SlackBotRequestAuthorizer] Received teamId:", teamId);

  const integration: SlackIntegration = (await integrationModel.getOne({
    "metadata.team.id": teamId,
  })) as SlackIntegration;
  const populatedIntegration = (
    (await secretManager.populateCredentials([
      integration,
    ])) as SlackIntegration[]
  )[0];

  const data = {
    botToken: populatedIntegration?.credentials?.access_token,
    botId: integration?.metadata.auth.bot_id,
    botUserId: integration?.metadata.auth.user_id,
    teamId: integration?.metadata.team.id,
  };

  // We are doing this so that user's token shouldn't expose in the logs
  const loggingData = {
    ...data,
    botToken: data.botToken?.slice(0, 20) + "...",
  }
  console.log("[SlackBotRequestAuthorizer] Authorizsing using the following data:", loggingData);

  return data;
}
