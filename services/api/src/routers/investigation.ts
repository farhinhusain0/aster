import express, { Request, Response } from "express";
import {
  investigationModel,
  integrationModel,
  PagerDutyIntegration,
  VendorName,
  JiraServiceManagementIntegration,
  IOrganization,
} from "@aster/db";
import { checkAuth, getDBUser } from "../middlewares/auth";
import { getSlackUser } from "../middlewares/slack";
import { catchAsync } from "../utils/errors";
import { AppError } from "../errors";
import { JiraServiceManagementClient, PagerDutyClient } from "../clients";
import { secretManager } from "../common/secrets";
import { Types } from "mongoose";
import { getTeamsUser } from "../middlewares/teams";

const router = express.Router();

// For Slackbot service - requires special auth
router.post(
  "/slack",
  getSlackUser, // Use the Slack middleware instead of manual token check
  catchAsync(async (req: Request, res: Response) => {
    const {
      hypothesis,
      rootCause,
      recommendedFix,
      codeChangesSHA,
      confidenceLevel,
      pdIncidentId,
      investigationId,
    } = req.body;
    const organizationId = String(req.user!.organization._id);

    // Get PagerDuty integration
    let pagerdutyIntegration = (await integrationModel.getIntegrationByName(
      "PagerDuty",
      {
        organization: organizationId,
      },
    )) as PagerDutyIntegration;

    if (!pagerdutyIntegration) {
      throw AppError({
        message: `No PagerDuty integration for organization ${organizationId}`,
        statusCode: 404,
      });
    }

    // Populate credentials from secret manager
    pagerdutyIntegration = (
      await secretManager.populateCredentials([pagerdutyIntegration])
    )[0] as PagerDutyIntegration;

    const { access_token } = pagerdutyIntegration.credentials;
    const pdClient = new PagerDutyClient(access_token);

    const pdIncident = await pdClient.getIncident(pdIncidentId);

    const investigation = await investigationModel.getOneAndUpdate(
      { _id: investigationId },
      {
        hypothesis,
        rootCause,
        recommendedFix,
        confidenceLevel,
        codeChangesSHA,
        pdIncidentId,
        pdDetails: pdIncident.incident,
        status: "active",
      },
    );

    return res.status(201).json(investigation);
  }),
);

router.post(
  "/teams",
  getTeamsUser,
  catchAsync(async (req: Request, res: Response) => {
    const {
      investigationId,
      hypothesis,
      rootCause,
      confidenceLevel,
      codeChangesSHA,
      recommendedFix,
      vendorName,
      incidentId,
    } = req.body;

    const investigation = await investigationModel
      .getOneById(investigationId)
      .populate("organization");
    if (!investigation) {
      throw AppError({ message: "Investigation not found", statusCode: 404 });
    }

    const organization = investigation.organization as IOrganization;
    let jsmDetails = null;
    let pdDetails = null;
    let pdIncidentId = null;
    if (vendorName === VendorName.JiraServiceManagement) {
      const jsmIntegration = (await integrationModel.getIntegrationByName(
        VendorName.JiraServiceManagement,
        {
          organization: organization._id,
        },
      )) as JiraServiceManagementIntegration;

      if (!jsmIntegration) {
        throw AppError({
          message: "Jira Service Management integration not found",
          statusCode: 404,
        });
      }

      const populatedJsmIntegration = (
        await secretManager.populateCredentials([jsmIntegration])
      )[0] as JiraServiceManagementIntegration;
      const { apiKey } = populatedJsmIntegration.credentials;

      const jsmClient = new JiraServiceManagementClient(apiKey);
      jsmDetails = await jsmClient.getAlert(incidentId);
      if (jsmIntegration?.metadata?.siteUrl) {
        jsmDetails = {
          ...jsmDetails,
          // TODO: This is unstable, we should be able to get the htmlUrl from the Jira Service Management API
          asterAdded: {
            htmlUrl: `https://${jsmIntegration.metadata.siteUrl}/jira/ops/alerts/${incidentId}`,
          },
        };
      }
    } else if (vendorName === VendorName.PagerDuty) {
      pdIncidentId = incidentId;
      const pagerdutyIntegration = (await integrationModel.getIntegrationByName(
        VendorName.PagerDuty,
        {
          organization: organization._id,
        },
      )) as PagerDutyIntegration;

      if (!pagerdutyIntegration) {
        throw AppError({
          message: "PagerDuty integration not found",
          statusCode: 404,
        });
      }

      const populatedPagerdutyIntegration = (
        await secretManager.populateCredentials([pagerdutyIntegration])
      )[0] as PagerDutyIntegration;
      const { access_token } = populatedPagerdutyIntegration.credentials;

      const pdClient = new PagerDutyClient(access_token);
      const pdIncident = await pdClient.getIncident(incidentId);
      pdDetails = pdIncident.incident;
    }

    await investigationModel.getOneAndUpdate(
      { _id: investigationId },
      {
        status: "active",
        hypothesis,
        rootCause,
        confidenceLevel,
        codeChangesSHA,
        recommendedFix,
        jsmDetails,
        pdDetails,
        pdIncidentId,
      },
    );

    return res.status(200).json(investigation);
  }),
);

router.post(
  "/teams/update-incident",
  getTeamsUser,
  catchAsync(async (req: Request, res: Response) => {
    const { incidentId } = req.body;

    // Right now we assume if the incident is from Teams, then it is a Jira Service Management incident
    const investigation = await investigationModel.getOne({
      "jsmDetails.id": incidentId,
    });

    if (!investigation) {
      throw AppError({ message: "Investigation not found", statusCode: 404 });
    }

    const jsmIntegration = (await integrationModel.getIntegrationByName(
      VendorName.JiraServiceManagement,
      {
        organization: investigation.organization._id,
      },
    )) as JiraServiceManagementIntegration;
    if (!jsmIntegration) {
      throw AppError({
        message: "Jira Service Management integration not found",
        statusCode: 404,
      });
    }

    const populatedJsmIntegration = (
      await secretManager.populateCredentials([jsmIntegration])
    )[0] as JiraServiceManagementIntegration;
    const { apiKey } = populatedJsmIntegration.credentials;
    const jsmClient = new JiraServiceManagementClient(apiKey);

    const newJSMDetails = await jsmClient.getAlert(incidentId);
    console.log("newJSMDetails", newJSMDetails);

    await investigationModel.getOneAndUpdate(
      { _id: investigation._id },
      { jsmDetails: newJSMDetails },
    );

    return res.status(200).json({ message: "Incident updated" });
  }),
);

// For dashboard service - requires regular auth
router.use(checkAuth);
router.use(getDBUser);

// Get all investigations for organization
router.get(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    // Get limit and offset from query params, with defaults and max
    const rawLimit = parseInt(req.query.limit as string, 10);
    const rawOffset = parseInt(req.query.offset as string, 10);

    // Sensible defaults and limits
    const limit = Math.max(1, Math.min(isNaN(rawLimit) ? 20 : rawLimit, 100));
    const offset = Math.max(0, isNaN(rawOffset) ? 0 : rawOffset);

    // Get total count for pagination
    const total = await investigationModel.countDocuments({
      organization: req.user!.organization._id,
      status: "active",
    });

    const investigations = await investigationModel.aggregate([
      {
        $match: {
          organization: req.user!.organization._id,
          status: "active",
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: offset,
      },
      {
        $limit: limit,
      },
    ]);

    return res.status(200).json({
      investigations,
      total,
      limit,
      offset,
    });
  }),
);

// Get single investigation
router.get(
  "/:id",
  catchAsync(async (req: Request, res: Response) => {
    const investigationFilter = await investigationModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(req.params.id),
        },
      },
      {
        $lookup: {
          from: "investigationchecks", // The collection name for InvestigationCheck
          localField: "_id",
          foreignField: "investigation",
          as: "checks",
          pipeline: [
            {
              $sort: {
                createdAt: 1,
              },
            },
          ],
        },
      },
      {
        $limit: 1,
      },
    ]);
    const investigation = investigationFilter[0];

    if (!investigation) {
      throw AppError({
        message: "Investigation not found",
        statusCode: 404,
      });
    }

    if (!investigation.organization._id.equals(req.user!.organization._id)) {
      throw AppError({
        message: "Not authorized to access this investigation",
        statusCode: 403,
      });
    }

    return res.status(200).json(investigation);
  }),
);

export { router };
