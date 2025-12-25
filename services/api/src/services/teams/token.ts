import { secretManager } from "../../common/secrets";
import {
  MICROSOFT_APP_ID,
  MICROSOFT_APP_PASSWORD,
  MICROSOFT_APP_REDIRECT_URI,
  MICROSOFT_APP_SCOPE,
  MICROSOFT_LOGIN_BASE,
  MICROSOFT_LOGIN_GRANT_TYPE,
} from "./base";
import { integrationModel, TeamsIntegration } from "@aster/db";
import axios from "axios";

export async function getAccessToken(code: string) {
  const urlSearchParams = new URLSearchParams({
    code: code,
    grant_type: MICROSOFT_LOGIN_GRANT_TYPE,
    client_id: MICROSOFT_APP_ID,
    client_secret: MICROSOFT_APP_PASSWORD,
    redirect_uri: MICROSOFT_APP_REDIRECT_URI,
    scope: MICROSOFT_APP_SCOPE,
  });

  console.log(
    "Acquiring access token for code",
    code,
    "with params",
    urlSearchParams.toString(),
  );

  const response = await axios.post(
    `${MICROSOFT_LOGIN_BASE}/token`,
    urlSearchParams.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
}

export async function refreshExpiredToken(integration: TeamsIntegration) {
  console.log(
    "Refreshing expired token for integration",
    integration._id.toString(),
  );
  const populatedIntegrations = (await secretManager.populateCredentials([
    integration,
  ])) as TeamsIntegration[];

  const populatedIntegration = populatedIntegrations[0];

  const { refresh_token } = populatedIntegration.credentials;
  if (!refresh_token) {
    console.log("Teams integration has no refresh token");
    return;
  }

  const urlSearchParams = new URLSearchParams({
    client_id: MICROSOFT_APP_ID,
    client_secret: MICROSOFT_APP_PASSWORD,
    refresh_token: refresh_token,
    grant_type: "refresh_token",
    scope: MICROSOFT_APP_SCOPE,
  });

  const response = await axios.post(
    `${MICROSOFT_LOGIN_BASE}/token`,
    urlSearchParams.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  const { access_token: newAccessToken, refresh_token: newRefreshToken } =
    response.data;

  console.log(
    "Deleting old credentials for integration",
    integration._id.toString(),
  );
  await secretManager.deleteCredentials([integration]);

  console.log(
    "Creating new credentials for integration",
    integration._id.toString(),
  );
  const formattedCredentials = await secretManager.createCredentials(
    integration.organization._id.toString(),
    "Teams",
    { access_token: newAccessToken, refresh_token: newRefreshToken },
  );

  console.log(
    "Updating integration with new credentials",
    integration._id.toString(),
  );
  await integrationModel.getOneAndUpdateByFilter(
    { _id: integration._id },
    {
      credentials: formattedCredentials,
    },
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
