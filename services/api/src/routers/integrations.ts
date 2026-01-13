import express, { Request, Response } from "express";
import {
  vendorModel,
  organizationModel,
  integrationModel,
  IIntegration,
  VendorName,
} from "@aster/db";
import { checkAuth, getDBUser } from "../middlewares/auth";
import { catchAsync } from "../utils/errors";
import { AppError } from "../errors";
import { secretManager } from "../common/secrets";
import axios from "axios";
import { TeamsSubscriptionService } from "../services/teams/subscriptions";
import http from "http";
import { getAccessToken } from "../services/teams/token";
import { SlackClient } from "../clients/slack/client";

const router = express.Router();

router.post(
  "/",
  checkAuth,
  getDBUser,
  catchAsync(async (req: Request, res: Response) => {
    const {
      vendor: vendorName,
      organization: organizationId,
      metadata,
      credentials,
      settings,
    } = req.body;

    const vendor = await vendorModel.getOne({ name: vendorName });
    const organization = await organizationModel.getOneById(organizationId);
    if (!vendor) {
      throw AppError({
        message:
          "Could not find a PagerDuty vendor. Make sure a vendor is defined.",
        statusCode: 404,
      });
    } else if (!organization) {
      throw AppError({
        message: "Could not find the given organization.",
        statusCode: 404,
      });
    }

    if (!req.user!.organization._id.equals(organizationId)) {
      throw AppError({
        message: "User is not a member of this organization",
        statusCode: 403,
      });
    }

    const extendedMetadata: Record<string, string | object> = {};
    let authType = "basic";
    switch (vendorName) {
      case "Notion": {
        const {
          data: {
            bot: { workspace_name },
          },
        } = await axios.get("https://api.notion.com/v1/users/me", {
          headers: {
            Authorization: `Bearer ${credentials.access_token}`,
            "Notion-Version": "2022-06-28",
          },
        });
        extendedMetadata.workspace_name = workspace_name;
        break;
      }
      case "Slack": {
        const client = new SlackClient(credentials.access_token);
        const teamInfo = await client.getTeamInfo();
        const authInfo = await client.getAuthInfo();

        if (!teamInfo || !authInfo) {
          throw AppError({
            message: "Failed to fetch team info or auth info",
            statusCode: 500,
          });
        }

        extendedMetadata.team = teamInfo;
        extendedMetadata.auth = authInfo;
        const url = authInfo.url;
        if (!url) {
          throw AppError({
            message: "Failed to fetch workspace url",
            statusCode: 500,
          });
        }
        extendedMetadata.workspace_url = url.endsWith("/")
          ? url.slice(0, -1)
          : url;
        break;
      }

      case "Teams": {
        try {
          // Get access token from Microsoft
          const response = await getAccessToken(credentials.code);
          credentials.access_token = response.access_token;
          credentials.refresh_token = response.refresh_token;
          delete credentials.code;
          authType = "oauth";

          // Create Microsoft Graph subscription using the service
          const subscriptionData =
            await TeamsSubscriptionService.createSubscription(
              credentials.access_token,
              organizationId,
              metadata.aadGroupId,
              metadata.channelId,
            );

          // Store subscription details in metadata
          extendedMetadata.subscription = {
            id: subscriptionData.id,
            resource: subscriptionData.resource,
            changeType: subscriptionData.changeType,
            notificationUrl: subscriptionData.notificationUrl,
            expirationDateTime: subscriptionData.expirationDateTime,
            clientState: subscriptionData.clientState,
          };
        } catch (error) {
          console.error("Error during Teams integration setup:", error);
          if (axios.isAxiosError(error) && error.response) {
            console.error("Response data:", error.response.data);
          }
          throw AppError({
            message: "Failed to setup Teams integration",
            statusCode: 500,
          });
        }
        break;
      }

      case "Sentry": {
        // Credentials from frontend: { organization_id, project_ids, personal_token }
        const { organizationId, projectIds } = settings;
        const { personalToken } = credentials;

        if (!organizationId || !projectIds || !personalToken) {
          throw AppError({
            message: "Missing required Sentry data",
            statusCode: 400,
          });
        }

        authType = "basic";
        break;
      }
    }

    const formattedCredentials =
      credentials && Object.keys(credentials).length
        ? await secretManager.createCredentials(
            organizationId,
            vendorName,
            credentials,
          )
        : {};

    const integration = await integrationModel.create({
      vendor,
      organization,
      type: authType as IIntegration["type"],
      metadata: { ...metadata, ...extendedMetadata },
      credentials: formattedCredentials as Record<string, string>,
      settings,
    });

    return res.status(200).json({ integration });
  }),
);

router.put(
  "/:id",
  checkAuth,
  getDBUser,
  catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const integration = await integrationModel.getOneById(id);
    if (!integration) {
      throw AppError({ message: "No such integration", statusCode: 404 });
    }

    if (!req.user!.organization._id.equals(integration.organization._id)) {
      throw AppError({
        message: "User is not a member of this organization",
        statusCode: 403,
      });
    } else if (req.user!.role !== "owner") {
      throw AppError({
        message: "User is not allowed to perform this action",
        statusCode: 403,
      });
    }

    return res.status(200).json({ integration });
  }),
);

router.get(
  "/",
  checkAuth,
  getDBUser,
  catchAsync(async (req: Request, res: Response) => {
    const query = {
      ...req.query,
      organization: req.user!.organization._id,
    };
    const integrations = await integrationModel.get(query).populate("vendor");

    const populated = await secretManager.populateCredentials(
      integrations as IIntegration[],
    );

    return res.status(200).json(populated);
  }),
);

router.get(
  "/slack",
  catchAsync(async (req: Request, res: Response) => {
    const actualAppToken = req.headers["x-slack-app-token"];
    const expectedAppToken = process.env.SLACK_APP_TOKEN as string;
    if (actualAppToken !== expectedAppToken) {
      throw AppError({ message: "Unauthorized", statusCode: 403 });
    }

    const integrations = await integrationModel
      .get(req.query)
      .populate("vendor");

    const populated = await secretManager.populateCredentials(
      integrations as IIntegration[],
    );

    return res.status(200).json(populated);
  }),
);

router.delete(
  "/:id",
  checkAuth,
  getDBUser,
  catchAsync(async (req: Request, res: Response) => {
    if (req.user!.role !== "owner") {
      throw AppError({
        message: "Only owners can delete integrations",
        statusCode: 403,
      });
    }

    const integration = (await integrationModel
      .getOne({
        organization: req.user!.organization._id,
        _id: req.params.id,
      })
      .populate("vendor")) as any;

    if (!integration) {
      throw AppError({ message: "No such integration", statusCode: 404 });
    } else if (
      !req.user!.organization._id.equals(integration.organization._id)
    ) {
      throw AppError({
        message: "User is not a member of this organization",
        statusCode: 403,
      });
    }

    // Clean up Teams subscription if exists
    if (
      integration.vendor.name === "Teams" &&
      integration.metadata?.subscription
    ) {
      try {
        const populatedIntegration = await secretManager.populateCredentials([
          integration,
        ]);
        const teamsIntegration = populatedIntegration[0] as any;

        await TeamsSubscriptionService.deleteSubscription(
          teamsIntegration.credentials.access_token,
          integration.metadata.subscription.id,
        );
        console.log(
          `Deleted Teams subscription ${integration.metadata.subscription.id}`,
        );
      } catch (error) {
        console.error("Failed to delete Teams subscription:", error);
        // Continue with integration deletion even if subscription cleanup fails
      }
    }

    await secretManager.deleteCredentials([integration]);

    await integrationModel.deleteOneById(req.params.id);

    return res.status(200).send("Deleted successfully");
  }),
);

router.get(
  "/:id/sync",
  checkAuth,
  getDBUser,
  catchAsync(async (req: Request, res: Response) => {
    const integration = await integrationModel.getOneById(req.params.id);
    if (!integration) {
      throw AppError({ message: "No such integration", statusCode: 404 });
    } else if (
      !req.user!.organization._id.equals(integration.organization._id)
    ) {
      throw AppError({
        message: "User is not a member of this organization",
        statusCode: 403,
      });
    }
    return res.status(200).json(integration);
  }),
);

export { router };
