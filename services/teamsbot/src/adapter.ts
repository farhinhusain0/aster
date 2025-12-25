import {
  CloudAdapter,
  ConfigurationBotFrameworkAuthentication,
  ConfigurationServiceClientCredentialFactory,
} from "botbuilder";

const config = {
  MicrosoftAppId: process.env.MICROSOFT_APP_ID,
  MicrosoftAppPassword: process.env.MICROSOFT_APP_PASSWORD,
  MicrosoftAppTenantId: process.env.MICROSOFT_APP_TENANT_ID,
  MicrosoftAppType: process.env.MICROSOFT_APP_TYPE,
};

const credentialFactory = new ConfigurationServiceClientCredentialFactory(
  config,
);
const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
  {},
  credentialFactory,
);
const adapter = new CloudAdapter(botFrameworkAuthentication);

adapter.onTurnError = async (context, error) => {
  console.error(`\n [onTurnError] unhandled error: ${error}`);
  await context.sendActivity("The bot encountered an error or bug.");
};

export { adapter };
