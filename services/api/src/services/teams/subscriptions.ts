import axios from "axios";
import { integrationModel, TeamsIntegration, vendorModel } from "@aster/db";
import {
  GRAPH_API_BASE,
  MICROSOFT_TEAMSBOT_URL,
  SUBSCRIPTION_DURATION_HOURS,
  getTeamsMessageSubscriptionResource,
  getTeamsSubscriptionClientState,
} from "./base";
import { refreshExpiredToken } from "./token";

export class TeamsSubscriptionService {
  private static readonly GRAPH_API_BASE = GRAPH_API_BASE;
  private static readonly SUBSCRIPTION_DURATION_HOURS =
    SUBSCRIPTION_DURATION_HOURS;

  /**
   * Create a new Microsoft Graph subscription
   */
  static async createSubscription(
    accessToken: string,
    organizationId: string,
    aadGroupId: string,
    channelId: string,
  ) {
    const resource = getTeamsMessageSubscriptionResource(aadGroupId, channelId);
    const expirationDateTime = new Date(
      Date.now() + this.SUBSCRIPTION_DURATION_HOURS * 60 * 60 * 1000,
    ).toISOString();

    const subscriptionData = {
      changeType: "created",
      notificationUrl: `${MICROSOFT_TEAMSBOT_URL}/api/webhook/message`,
      resource,
      expirationDateTime,
      clientState: getTeamsSubscriptionClientState(organizationId),
    };

    const response = await axios.post(
      `${this.GRAPH_API_BASE}/subscriptions`,
      subscriptionData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  }

  /**
   * Renew an existing Microsoft Graph subscription
   */
  static async renewSubscription(accessToken: string, subscriptionId: string) {
    const expirationDateTime = new Date(
      Date.now() + this.SUBSCRIPTION_DURATION_HOURS * 60 * 60 * 1000,
    ).toISOString();

    const response = await axios.patch(
      `${this.GRAPH_API_BASE}/subscriptions/${subscriptionId}`,
      {
        expirationDateTime,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  }

  /**
   * Delete a Microsoft Graph subscription
   */
  static async deleteSubscription(accessToken: string, subscriptionId: string) {
    await axios.delete(
      `${this.GRAPH_API_BASE}/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  }

  /**
   * Get subscription details
   */
  static async getSubscription(accessToken: string, subscriptionId: string) {
    const response = await axios.get(
      `${this.GRAPH_API_BASE}/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data;
  }

  /**
   * Check if subscription is about to expire (within 20 minutes)
   * This provides a buffer for the 10-minute cron job interval
   */
  static isSubscriptionExpiringSoon(expirationDateTime: string): boolean {
    const expirationTime = new Date(expirationDateTime).getTime();
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    const twentyMinutesInMs = 20 * 60 * 1000; // 20 minutes buffer

    return timeUntilExpiration <= twentyMinutesInMs;
  }

  /**
   * Renew subscriptions for Teams integrations that are about to expire
   */
  static async renewExpiredSubscriptions(): Promise<void> {
    try {
      console.log("Checking for Teams subscriptions that need renewal...");

      // First get the Teams vendor
      const teamsVendor = await vendorModel.getOne({ name: "Teams" });
      if (!teamsVendor) {
        console.log("Teams vendor not found");
        return;
      }

      // Get all Teams integrations
      const teamsIntegrations = (await integrationModel
        .get({ vendor: teamsVendor._id })
        .populate("vendor")) as TeamsIntegration[];

      if (!teamsIntegrations || teamsIntegrations.length === 0) {
        console.log("No Teams integrations found");
        return;
      }

      for (const integration of teamsIntegrations) {
        if (!integration.metadata?.subscription) {
          console.log(
            `Teams integration ${integration._id} has no subscription metadata`,
          );
          continue;
        }

        const { subscription, aadGroupId, channelId } = integration.metadata;

        if (this.isSubscriptionExpiringSoon(subscription.expirationDateTime)) {
          console.log(
            `Subscription ${subscription.id} for integration ${integration._id} is about to expire. Refreshing token...`,
          );

          // Subscription is about to expire which means we need to refresh the access token
          const newCredentials = await refreshExpiredToken(integration);

          if (!newCredentials) {
            console.error(
              `Failed to refresh expired token for integration ${integration._id}`,
            );
            continue;
          }

          console.log(
            `Renewing subscription ${subscription.id} for integration ${integration._id}`,
          );

          try {
            const renewedSubscription = await this.renewSubscription(
              newCredentials.accessToken,
              subscription.id,
            );

            // Update the integration metadata with new expiration time
            await integrationModel.getOneAndUpdateByFilter(
              { _id: integration._id },
              {
                $set: {
                  "metadata.subscription.expirationDateTime":
                    renewedSubscription.expirationDateTime,
                },
              },
            );

            console.log(
              `Successfully renewed subscription ${subscription.id}. New expiration: ${renewedSubscription.expirationDateTime}`,
            );
          } catch (error: any) {
            console.error(
              `Failed to renew subscription ${subscription.id} for integration ${integration._id}:`,
              error?.response?.data,
            );

            // If renewal fails, try to create a new subscription
            try {
              console.log("Attempting to create new subscription...");

              const newSubscription = await this.createSubscription(
                newCredentials.accessToken,
                integration.organization.toString(),
                aadGroupId,
                channelId,
              );

              // Update the integration metadata with new subscription
              await integrationModel.getOneAndUpdateByFilter(
                { _id: integration._id },
                {
                  $set: {
                    "metadata.subscription": {
                      id: newSubscription.id,
                      resource: newSubscription.resource,
                      changeType: newSubscription.changeType,
                      notificationUrl: newSubscription.notificationUrl,
                      expirationDateTime: newSubscription.expirationDateTime,
                      clientState: newSubscription.clientState,
                    },
                  },
                },
              );

              console.log(
                `Created new subscription ${newSubscription.id} for integration ${integration._id}`,
              );
            } catch (createError: any) {
              console.error(
                `Failed to create new subscription for integration ${integration._id}:`,
                createError?.response?.data,
              );
            }
          }
        } else {
          const timeUntilExpiration =
            new Date(subscription.expirationDateTime).getTime() - Date.now();
          const minutesUntilExpiration = Math.floor(
            timeUntilExpiration / (60 * 1000),
          );
          console.log(
            `Subscription ${subscription.id} expires in ${minutesUntilExpiration} minutes - no renewal needed yet`,
          );
        }
      }
    } catch (error) {
      console.error("Error in renewExpiredSubscriptions:", error);
    }
  }
}
