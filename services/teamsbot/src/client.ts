import { ConfidentialClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
import axios from "axios";
import "isomorphic-fetch";

export const createGraphClient = async (tenantId: string) => {
  const msalConfig = {
    auth: {
      clientId: process.env.MICROSOFT_APP_ID as string,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientSecret: process.env.MICROSOFT_APP_PASSWORD as string,
    },
  };

  const cca = new ConfidentialClientApplication(msalConfig);

  const tokenResponse: any = await cca.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  });

  const graphClient = Client.init({
    authProvider: (done) => {
      done(null, tokenResponse.accessToken);
    },
  });

  return graphClient;
};

async function getTeamsBotAccessToken(tenantId: string) {
  try {
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams();
    params.append("client_id", process.env.MICROSOFT_APP_ID as string);
    params.append(
      "client_secret",
      process.env.MICROSOFT_APP_PASSWORD as string,
    );
    params.append("scope", "https://graph.microsoft.com/.default");
    params.append("grant_type", "client_credentials");

    const response = await axios.post(tokenUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data.access_token;
  } catch (error: any) {
    console.error(
      "Error getting access token:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

export function createGraphClientV2(tenantId: string) {
  try {
    // Initialize Graph client with client credentials
    const clientCredentialProvider = {
      getAccessToken: async () => {
        return await getTeamsBotAccessToken(tenantId);
      },
    };

    return Client.initWithMiddleware({
      authProvider: clientCredentialProvider,
    });
  } catch (error: any) {
    console.error("Failed to initialize Graph client:", error);
    throw error;
  }
}
