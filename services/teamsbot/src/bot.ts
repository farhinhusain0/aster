import {
  Activity,
  ActivityHandler,
  CardFactory,
  MessageFactory,
  TurnContext,
} from "botbuilder";
import { getCompletion } from "./api";
import {
  getAuthenticatedWelcomeCard,
  getUnauthenticatedWelcomeCard,
} from "./TeamsComponents";
import { integrationModel, TeamsIntegration } from "@aster/db";
import {
  getIncidentTextFromMessage,
  getTeamsMessageById,
} from "./services/teams";
import { getConversationParentMessageId } from "./utils/teams";

class TeamsBot extends ActivityHandler {
  constructor() {
    super();
    this.onMessage(async (context, next) => {
      try {
        const isBotMentioned = await this.getBotMentionedStatus(
          context.activity,
        );
        if (!isBotMentioned) {
          console.log("Bot is not mentioned, skipping");
          await next();
          return;
        } else {
          let command = TurnContext.removeRecipientMention(context.activity);
          const isInvestigation = command.includes(
            "Start initial investigation",
          );

          if (isInvestigation) {
            const parentMessage = await getTeamsMessageById(
              getConversationParentMessageId(
                context.activity.conversation.id.toString(),
              ),
              context.activity.channelData.channel.id,
              context.activity.channelData.tenant.id,
            );
            const { text } = getIncidentTextFromMessage(parentMessage);
            command = text;
          }

          const response = await getCompletion({
            messages: [
              {
                role: "user",
                content: command,
              },
            ],
            tenantId: context.activity.channelData.tenant.id,
            isInvestigation,
          });

          console.log("\n=============Response=============\n");
          console.log(response);
          console.log("\n=============Response=============\n");

          await context.sendActivity(
            MessageFactory.text(response.output, response.output),
          );
        }
      } catch (error) {
        console.error("Error in onMessage:", error);
      }
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      console.log("=== Start: Members added ===");
      console.log("Members added", context.activity);
      console.log("=== End: Members added ===");
      await next();
    });
    this.onConversationUpdate(async (context, next) => {
      console.log("=== Start: Conversation update ===");
      console.log("Conversation update", context.activity);
      console.log("=== End: Conversation update ===");
      await next();
    });
    this.onInstallationUpdateAdd(async (context, next) => {
      console.log("=== Start: Installation update add ===");
      console.log("Installation update add", context.activity);
      console.log("=== End: Installation update add ===");

      // Check connection and send welcome message
      const integration = await integrationModel.getIntegrationByName("Teams", {
        "metadata.tenantId": context.activity.channelData.tenant.id,
      });

      if (integration) {
        console.log(`========= Integration found ==========\n`);
        console.log(integration);
        console.log(`========= Integration found ==========\n`);

        await context.sendActivity({
          attachments: [
            CardFactory.adaptiveCard(getAuthenticatedWelcomeCard()),
          ],
        });
      } else {
        await context.sendActivity({
          attachments: [
            CardFactory.adaptiveCard(
              getUnauthenticatedWelcomeCard({
                data: {
                  tenantId: context.activity.channelData.tenant.id,
                  aadGroupId: context.activity.channelData.team.aadGroupId,
                  teamId: context.activity.channelData.team.id,
                  fromId: context.activity.from.id,
                  fromAadObjectId: context.activity.from.aadObjectId,
                  channelId: context.activity.channelData.channel.id,
                  conversationReference: TurnContext.getConversationReference(
                    context.activity,
                  ),
                },
              }),
            ),
          ],
        });
      }

      await next();
    });
    this.onInstallationUpdateRemove(async (context, next) => {
      console.log("=== Start: Installation update remove ===");
      console.log("Installation update remove", context.activity);
      console.log("=== End: Installation update remove ===");

      await next();
    });
    this.onMembersRemoved(async (context, next) => {
      console.log("=== Start: Members removed ===");
      console.log("Members removed", context.activity);
      console.log("=== End: Members removed ===");
      await next();
    });
  }

  private getBotMentionedStatus = async (activity: Activity) => {
    const integration = (await integrationModel.getIntegrationByName("Teams", {
      "metadata.tenantId": activity.channelData.tenant.id,
    })) as TeamsIntegration;

    if (!integration) {
      return false;
    }

    const mention = activity.entities?.find(
      (entity: any) =>
        entity.type === "mention" &&
        entity?.mentioned?.id ===
          integration.metadata.conversationReference.bot.id,
    );

    return Boolean(mention);
  };
}

export { TeamsBot };
