import { Request, Response } from "restify";
import {
  CardFactory,
  ConversationReference,
  MessageFactory,
  TurnContext,
} from "botbuilder";
import { integrationModel, TeamsIntegration } from "@aster/db";
import { ITeamsMessageResourceData } from "../types";
import { extractIdsFromResourceData } from "../utils/subscriptionNotification";
import { createGraphClientV2 } from "../client";
import { adapter } from "../adapter";
import { ALLOWED_TEAMS_BOT_NAMES } from "../constants/teams";
import { getMessageEndpoint } from "../utils/graphEndpoints";
import { getCompletion, updateIncident, updateInvestigation } from "../api";
import { getIncidentTextFromMessage } from "./teams";
import { getInvestigationCard } from "../TeamsComponents";
import { getJSMIncidentIdFromURL, getJSMURLFromText } from "../utils/jsm";
import { LangChainMessageRoles } from "@aster/utils";

export async function handleTeamsSubscriptionNotification(
  req: Request,
  res: Response,
): Promise<void> {
  if (req.query.validationToken) {
    res.send(200, req.query.validationToken);
  } else {
    // Sending acknowledgement to Teams to avoid retries
    console.log("\n\n\nSending acknowledgement to Teams to avoid retries");
    res.send(200);

    // Processing the message
    try {
      const resourceData: ITeamsMessageResourceData =
        req.body.value[0].resourceData;

      console.log("resourceData", resourceData);

      // Extract IDs from the resource data
      const extractedIds = extractIdsFromResourceData(resourceData);
      const { messageId, teamId, channelId } = extractedIds;
      const integration = (await integrationModel.getIntegrationByName(
        "Teams",
        {
          "metadata.aadGroupId": teamId,
        },
      )) as TeamsIntegration;

      if (!integration) {
        console.log(
          "Skipping message processing because we couldn't find the integration",
        );
        return;
      }

      let message;
      const tenantId = integration.metadata.tenantId;
      try {
        const graphClient = createGraphClientV2(tenantId);
        message = await graphClient
          .api(getMessageEndpoint(teamId, channelId, messageId))
          .get();
      } catch (error) {
        // This is expected to happen for messages that are replies to other messages
        // We don't want to process these messages
        console.log(
          "Skipping message processing because we couldn't fetch it from Graph API",
        );
        return;
      }

      // TODO: Not a good way to identify which bot's message we should process.
      if (
        message &&
        !ALLOWED_TEAMS_BOT_NAMES.includes(
          message?.from?.application?.displayName,
        )
      ) {
        console.log(
          "Skipping message processing because it's not from an allowed bot",
        );
        return;
      }

      // TODO: Not a good way to identify which which message we should process.
      if (message.attachments?.length === 0) {
        await handleIncidentUpdate(message, tenantId);
        console.log("Ignoring the message because it has no useful content");
        return;
      }
      console.log("Processing message:", message);

      const conversationReference = integration.metadata
        .conversationReference as ConversationReference;
      const initialReply = MessageFactory.text(
        `Starting initial investigation. It should take up to a minute.`,
      );
      initialReply.replyToId = messageId;

      const replyConversationReference = {
        ...conversationReference,
        conversation: {
          ...conversationReference.conversation,
          id: `${conversationReference.conversation.id};messageid=${messageId}`,
        },
      };

      await adapter.continueConversationAsync(
        process.env.MICROSOFT_APP_ID as string,
        replyConversationReference,
        async (context: TurnContext) => {
          await context.sendActivity(initialReply);

          const {
            text: command,
            vendorName,
            incidentId,
          } = getIncidentTextFromMessage(message);
          const response = await getCompletion({
            messages: [
              {
                role: LangChainMessageRoles.user,
                content:
                  command +
                  "\n\n Any code formatting should be done in a way that is compatible with Teams Adaptive Cards.",
              },
            ],
            tenantId,
            isInvestigation: true,
            secondaryInvestigationId: messageId,
          });

          console.log("\n=============Response=============\n");
          console.log(response, vendorName, incidentId);
          console.log("\n=============Response=============\n");

          const {
            hypothesis,
            rootCause,
            confidenceLevel,
            codeChangesDescription,
            codeChangeSHAs,
            recommendedFix,
          } = JSON.parse(response.output);

          await updateInvestigation({
            hypothesis,
            rootCause,
            confidenceLevel,
            codeChangesDescription,
            codeChangeSHAs,
            recommendedFix,
            investigationId: response.investigationId,
            incidentId,
            vendorName,
            email: "",
            tenantId,
          });

          await context.sendActivity({
            attachments: [
              CardFactory.adaptiveCard(
                getInvestigationCard({
                  hypothesis: hypothesis,
                  investigationId: response.investigationId,
                }),
              ),
            ],
          });
        },
      );
      return;
    } catch (error) {
      console.error("Error processing request:", error);
      return;
    }
  }
}

async function handleIncidentUpdate(message: any, tenantId: string) {
  try {
    const body = message.body;
    const content = body.content;
    const jsmUrl = getJSMURLFromText(content);
    const jsmIncidentId = getJSMIncidentIdFromURL(jsmUrl);
    if (!jsmIncidentId) {
      console.log(
        "Skipping incident update because we couldn't find the incident ID",
      );
      return;
    }
    console.log("Updating incident:", jsmIncidentId);
    await updateIncident(jsmIncidentId, tenantId);
    console.log("Incident updated:", jsmIncidentId);
  } catch (error) {
    console.error("Error handling incident update:", error);
    return;
  }
}
