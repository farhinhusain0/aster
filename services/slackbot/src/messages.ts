import { App } from "@slack/bolt";
import { Block, GenericMessageEvent } from "@slack/types";
import { addFeedbackReactions, addReaction, getMyId } from "./utils/slack";
import { BotNames } from "./constants";
import { extractEventId, parseMessage } from "./lib";
import { getCompletion, errorMap } from "./api/chat";
import { createInvestigation } from "./api/investigation";

const PAGERDUTY_APP_ID = "A1FKYAUUX";
const AUTO_INVESTIGATION_MESSAGE =
  "Starting initial investigation. It should take up to a minute.";
// Regex to handle Slack markdown links and case insensitive IDs
const PAGERDUTY_INCIDENT_REGEX =
  /<.*?pagerduty\.com\/incidents\/([a-zA-Z0-9]+)(?:\?|#|>|$)/i;
const HYPOTHESIS_REGEX = /### Hypothesis on Root Cause([\s\S]*?)(?=###|$)/i;

export function attachMessages(app: App) {
  app.message(async ({ message: msg, say, client }) => {
    // There is a known issue with Bolt.js message params in TypeScript.
    // https://github.com/slackapi/bolt-js/issues/904
    // The solution in the meantime is to cast the message to Casting to GenericMessageEvent
    console.log("Received message!");
    const message = msg as GenericMessageEvent;

    const botUserId = await getMyId(client);
    console.log("Got id:");
    const botMentionString = `<@${botUserId}>`;

    let shouldAutoInvestigate = false;
    let pdIncidentId: string | undefined;
    // Check if the bot is mentioned in the message or a user has sent a direct message
    if (
      message?.bot_profile?.app_id === PAGERDUTY_APP_ID &&
      !message.thread_ts
    ) {
      console.log("########### logging message ##########");
      console.log(message);
      console.log("########### message end ##########");
      if (message.text?.startsWith("*Resolved* ")) {
        console.log(`Resolved message, skipping: ${message.text}`);
        return;
      }
      // Extract incident ID from the URL in the message
      const match = message.text?.match(PAGERDUTY_INCIDENT_REGEX);
      pdIncidentId = match?.[1];
      console.log("Found PagerDuty incident ID:", pdIncidentId);
      await say({
        text: AUTO_INVESTIGATION_MESSAGE,
        thread_ts: message.thread_ts || message.ts, // Use the thread timestamp if available
      });
      shouldAutoInvestigate = true;
    } else if (!message.text) {
      return;
    } else if (
      message.channel_type !== "im" &&
      !message.text.includes(botMentionString)
    ) {
      return;
    } else if (message.user === botUserId) {
      return;
    }

    // Add eyes reaction
    await addReaction(client, message.channel, message.ts, "eyes");

    try {
      let messages;
      const metadata = {} as { eventId: string };
      if (message.thread_ts) {
        const historyResponse = await client.conversations.replies({
          channel: message.channel,
          ts: message.thread_ts,
          inclusive: true,
        });
        if (!historyResponse.messages) {
          console.log("No messages found");
          throw new Error("No messages found");
        }
        const firstMessage = historyResponse.messages[0];
        if (
          firstMessage.bot_profile &&
          BotNames.includes(firstMessage.bot_profile.name!)
        ) {
          const eventId = extractEventId(firstMessage);
          metadata.eventId = eventId;
        }
        messages = await Promise.all(
          historyResponse.messages.map((msg) =>
            parseMessage(msg, botUserId!, client.token!),
          ),
        );
      } else {
        // We use Promise.all here since we want to build an array with a single value.
        messages = await Promise.all([
          parseMessage(message, botUserId!, client.token!),
        ]);
      }

      const { team } = message;
      if (!team) {
        throw new Error("team not found");
      }

      let email = "";
      if (message.thread_ts) {
        const user = await client.users.profile.get({ user: message.user });
        if (!user.profile?.email) {
          throw new Error("User profile not found");
        }

        email = user.profile.email;
      }

      const { output, traceId, observationId, investigationId } =
        await getCompletion({
          messages,
          email,
          team,
          metadata,
          isInvestigation: shouldAutoInvestigate,
        });

      let investigationExtraBlocks = [] as Object[];
      if (shouldAutoInvestigate) {
        console.log("passing params:");
        console.log("pdIncidentId", pdIncidentId);
        console.log("email", email);
        console.log("team", team);

        console.log("initial ivestigation");
        console.log(output);
        console.log("initial ivestigation end");
        const hypothesis = output.match(HYPOTHESIS_REGEX)?.[1]?.trim();
        console.log("########### hypothesis ##########");
        console.log(hypothesis);
        console.log("########### hypothesis end ##########");

        const resp = await createInvestigation({
          investigationId,
          hypothesis: output,
          pdIncidentId,
          email,
          team,
        });

        investigationExtraBlocks = [
          {
            type: "divider",
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View in Aster",
                },
                value: "click_me_123",
                action_id: "view_in_aster",
                style: "primary",
                url: `${process.env.DASHBOARD_APP_URL}/investigations/${investigationId}`,
              },
            ],
          },
          // add a hint text box
          {
            type: "context",
            elements: [
              {
                type: "plain_text",
                text: "Use @Aster to ask follow-up questions",
              },
            ],
          },
        ];
      }

      const message_metadata = {
        event_type: "answer_created",
        event_payload: {
          trace_id: traceId,
          observation_id: observationId,
        },
      };

      const response = await say({
        text: output,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: output,
            },
          },
          ...(investigationExtraBlocks as Block[]),
        ],
        thread_ts: message.thread_ts || message.ts, // Use the thread timestamp if available
        metadata: message_metadata,
      });
      const { ok, channel, ts } = response;
      if (ok && channel && ts) {
        await addFeedbackReactions(client, channel, ts);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error processing message:", error);
      const errorCode = error.response?.data?.code as keyof typeof errorMap;
      const messageText =
        errorMap[errorCode] ||
        "I'm really sorry but there's an unexpected problem and I'm currently unavailable";
      client.chat
        .postEphemeral({
          channel: message.channel,
          user: message.user,
          text: messageText,
          thread_ts: message.thread_ts,
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });
}
