import { WebClient } from "@slack/web-api";
import { delay } from "../../utils/promises";
import { MessageAttachment, MessageMetadata } from "@slack/types";

export class SlackClient {
  private readonly token: string;
  private readonly client: WebClient;

  constructor(token: string) {
    this.token = token;
    this.client = new WebClient(token);
  }

  getChannelHistoryGracefully = async (channelId: string) => {
    try {
      return await this.getChannelHistory(channelId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.data?.error === "not_in_channel") {
        await this.joinChannel(channelId);
        return await this.getChannelHistory(channelId);
      }
      throw error;
    }
  };

  getChannelHistory = async (channelId: string) => {
    try {
      const result = await this.client.conversations.history({
        channel: channelId,
        limit: 5,
      });

      return result.messages;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  joinChannel = async (channelId: string) => {
    try {
      await this.client.conversations.join({
        channel: channelId,
      });
    } catch (error) {
      console.error("Error joining channel:", error);
      throw error;
    }
  };

  postMessage = async ({
    channelId,
    text,
    attachments,
    metadata,
  }: {
    channelId: string;
    text?: string;
    attachments?: MessageAttachment[];
    metadata?: MessageMetadata;
  }) => {
    try {
      return await this.client.chat.postMessage({
        channel: channelId,
        text,
        attachments: attachments ?? [],
        reply_broadcast: false,
        metadata,
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      throw error;
    }
  };

  postReply = async ({
    channelId,
    ts,
    text,
    metadata,
  }: {
    channelId: string;
    ts: string;
    text: string;
    metadata?: MessageMetadata;
  }) => {
    try {
      return await this.client.chat.postMessage({
        channel: channelId,
        text,
        thread_ts: ts,
        reply_broadcast: false,
        metadata,
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      throw error;
    }
  };

  addReaction = async (channel: string, timestamp: string, name: string) => {
    try {
      return await this.client.reactions.add({
        channel,
        timestamp,
        name,
      });
    } catch (error) {
      console.error("Error adding reply:", error);
      throw error;
    }
  };

  /* This function can be used to add reactions to messages in Slack 
  It was previously used to add feedback reactions to the agent's answers:
  
  const { ok, channel, ts } = response;
  if (ok) {
    await addFeedbackReactions(access_token, channel!, ts!);
  }
  **/
  addFeedbackReactions = async (channel: string, timestamp: string) => {
    try {
      await Promise.all([
        this.addReaction(channel, timestamp, "thumbsup"),
        this.addReaction(channel, timestamp, "thumbsdown"),
      ]);
    } catch (error) {
      console.error("Error adding reply:", error);
      throw error;
    }
  };

  waitAndFetchMessage = async (
    channel_id: string,
    content: string,
    ms = 1000,
  ) => {
    let messages;
    let ogMessage;

    while (!ogMessage) {
      messages = await this.getChannelHistoryGracefully(channel_id);
      ogMessage = messages?.find((message: any) =>
        JSON.stringify(message).includes(content),
      );
      if (!ogMessage) {
        await delay(ms);
      }
    }
    return ogMessage;
  };

  /**
   * Fetches bot authorization details including bot_id, user_id, and team_id
   * This is useful for setting up the authorization data needed by the Slack Bolt app
   */
  getAuthInfo = async () => {
    try {
      const result = await this.client.auth.test();

      if (!result.ok) {
        throw new Error(`Slack auth.test failed: ${result.error}`);
      }

      // We are fixing `The operand of a 'delete' operator must be optional.ts(2790)` here using `as any`
      delete (result as any).ok;
      delete result.response_metadata;

      console.log("[SlackAuthInfo] Result:", result);
      return result;
    } catch (error) {
      console.error("Error fetching auth info:", error);
      throw error;
    }
  };

  /**
   * Fetches detailed team/workspace information
   */
  getTeamInfo = async () => {
    try {
      const result = await this.client.team.info();

      if (!result.ok) {
        throw new Error(`Slack team.info failed: ${result.error}`);
      }

      console.log("[SlackTeamInfo] Result:", result);
      return result.team;
    } catch (error) {
      console.error("Error fetching team info:", error);
      throw error;
    }
  };
}
