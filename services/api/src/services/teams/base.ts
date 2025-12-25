export const GRAPH_API_BASE: string = "https://graph.microsoft.com/v1.0";
export const MICROSOFT_LOGIN_BASE: string =
  "https://login.microsoftonline.com/organizations/oauth2/v2.0";
export const MICROSOFT_APP_ID: string = process.env.MICROSOFT_APP_ID as string;
export const MICROSOFT_TEAMSBOT_URL: string = process.env
  .MICROSOFT_TEAMSBOT_URL as string;
export const MICROSOFT_APP_PASSWORD: string = process.env
  .MICROSOFT_APP_PASSWORD as string;
export const MICROSOFT_APP_REDIRECT_URI: string = process.env
  .MICROSOFT_APP_REDIRECT_URI as string;
export const MICROSOFT_APP_SCOPE: string = process.env
  .MICROSOFT_APP_SCOPE as string;
export const MICROSOFT_LOGIN_GRANT_TYPE: string = "authorization_code";
export const SUBSCRIPTION_CHANGE_TYPE: string = "created";
export const SUBSCRIPTION_DURATION_HOURS: number = 1; // Microsoft Graph allows max 1 hour for message subscriptions

const TEAMS_SUBSCRIPTION_CLIENT_STATE_SEPARATOR: string = "_____";

export function getTeamsMessageSubscriptionResource(
  aadGroupId: string,
  channelId: string,
) {
  return `/teams/${aadGroupId}/channels/${channelId}/messages`;
}

export function getTeamsSubscriptionClientState(organizationId: string) {
  return `${organizationId}${TEAMS_SUBSCRIPTION_CLIENT_STATE_SEPARATOR}${Date.now()}`;
}

export function parseTeamsSubscriptionClientState(clientState: string) {
  const [organizationId, timestamp] = clientState.split(
    TEAMS_SUBSCRIPTION_CLIENT_STATE_SEPARATOR,
  );
  return { organizationId, timestamp };
}