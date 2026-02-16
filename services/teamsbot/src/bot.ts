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
import { integrationModel, TeamsIntegration, VendorName } from "@aster/db";
import { LangChainMessageRoles } from "@aster/utils";
import { createGraphClientV2 } from "./client";
import {
  getMessageEndpoint,
  getMessageRepliesEndpoint,
} from "./utils/graphEndpoints";
import { getConversationParentMessageId } from "./utils/teams";
import { convert } from "html-to-text";
import { convertAdaptiveCardContentToText } from "./services/teams";

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
          const response = await getCompletion({
            messages: await this.parseMessagesForAster(context),
            tenantId: context.activity.channelData.tenant.id,
            isInvestigation: false,
            secondaryInvestigationId: getConversationParentMessageId(
              context.activity.conversation.id,
            ),
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
    const integration = (await integrationModel.getIntegrationByName(
      VendorName.Teams,
      {
        "metadata.tenantId": activity.channelData.tenant.id,
      },
    )) as TeamsIntegration;

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

  private parseMessagesForAster = async (context: TurnContext) => {
    // Get all messages (main message + replies) from the activity
    const allMessages = await this.getAllMessagesFromActivity(context);

    // Convert messages to the format expected by Aster
    const messages = allMessages.map((message) => {
      // Determine if the message is from a bot (assistant) or user
      // Messages from bots have from.application, messages from users have from.user
      const isFromBot = !!message.from?.application;

      let content = "";
      if (message.attachments?.[0]?.content) {
        content = convertAdaptiveCardContentToText(
          message.attachments?.[0]?.content,
        );
      } else {
        content = convert(message.body?.content || message.body?.text || "");
      }

      return {
        role: isFromBot
          ? LangChainMessageRoles.assistant
          : LangChainMessageRoles.user,
        content,
      };
    });

    return messages;
  };

  private getAllMessagesFromActivity = async (context: TurnContext) => {
    try {
      const activity = context.activity;
      const tenantId = activity.channelData?.tenant?.id;
      const integration = await integrationModel.getIntegrationByName(
        VendorName.Teams,
        {
          "metadata.tenantId": tenantId,
        },
      );

      const { metadata } = integration as TeamsIntegration;
      const { aadGroupId, channelId } = metadata;

      if (!tenantId || !aadGroupId || !channelId) {
        console.error("Missing required IDs from activity:", {
          tenantId,
          aadGroupId,
          channelId,
        });
        return [];
      }

      const conversationId = activity.conversation?.id ?? "";
      const messageId = getConversationParentMessageId(conversationId);

      if (!messageId) {
        console.error("No message ID found in activity");
        return [];
      }

      // Create Graph client and fetch message with replies
      const graphClient = createGraphClientV2(tenantId);
      const message = await graphClient
        .api(getMessageEndpoint(aadGroupId, channelId, messageId))
        .get();

      const replies = await graphClient
        .api(getMessageRepliesEndpoint(aadGroupId, channelId, messageId))
        .get();

      // Collect all messages: main message + all replies
      const allMessages = [];

      // Add the main message
      if (message) {
        allMessages.push(message);
      }

      // Add all replies if they exist
      if (replies && Array.isArray(replies.value)) {
        allMessages.push(...replies.value);
      }

      // Sort messages by creation time to maintain chronological order
      allMessages.sort((a, b) => {
        const timeA = new Date(a.createdDateTime || 0).getTime();
        const timeB = new Date(b.createdDateTime || 0).getTime();
        return timeA - timeB;
      });

      return allMessages;
    } catch (error) {
      console.error("Error fetching messages from activity:", error);
      // Return empty array on error, fallback to just the current command
      return [];
    }
  };
}

export { TeamsBot };
