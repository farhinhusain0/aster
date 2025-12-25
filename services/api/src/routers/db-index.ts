import express, { Request, Response } from "express";
import axios from "axios";
import { checkAuth, getDBUser } from "../middlewares/auth";
import { catchAsync } from "../utils/errors";
import { AppError } from "../errors";
import { indexModel, integrationModel, snapshotModel } from "@aster/db";
import { atlassianAuth } from "../services/oauth";
import type { AtlassianIntegration, IIntegration } from "@aster/db";
import { zip } from "../utils/arrays";
import { getTimestamp } from "../utils/dates";
import { VectorStoresManager } from "../agent/rag";

const ATLASSIAN_DATA_SOURCES = ["Confluence", "Jira"];

const router = express.Router();
router.use(checkAuth);
router.use(getDBUser);
// TODO: remove once we finish with beta testing ang do public!

router.get(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    if (req.user!.role !== "owner") {
      throw AppError({
        message: "Only owners can access indexes",
        statusCode: 403,
      });
    }

    const index = await indexModel.getOne({
      organization: req.user!.organization._id,
    });

    return res.status(200).json(index);
  }),
);

router.post(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    if (req.user!.role !== "owner") {
      throw AppError({
        message: "Only owners are allowed to create indexes",
        statusCode: 403,
      });
    }

    const organizationId = String(req.user!.organization._id);

    // TODO: use a proper messaging solution instead of plain API request
    console.log("Extractiong request body");
    let { dataSources } = req.body;
    if (!dataSources) {
      throw AppError({ message: "No data sources provided", statusCode: 400 });
    }

    if (dataSources.length === 0) return res.status(200).json({ job: null });

    console.log("Datasource mapping..");
    const integrations = await Promise.all(
      dataSources.map(async (source: string) => {
        const integration = await integrationModel.getIntegrationByName(
          source,
          {
            organization: req.user!.organization._id,
          },
        );
        if (!integration) {
          throw AppError({
            message: `No such integration "${source}"`,
            statusCode: 404,
          });
        }
        return integration;
      }),
    );

    console.log("Promise.all -> zip");
    // TODO: right now we hard-code the OAuth refresh token mechanism in several places in the code,
    // and we make it specific to PagerDuty and Atlassian. We should make it more generic.
    await Promise.all(
      zip(dataSources, integrations)
        .filter(
          ([source, integration]) =>
            ATLASSIAN_DATA_SOURCES.includes(source as string) &&
            (integration as AtlassianIntegration).type == "oauth",
        )
        .map(async ([, integration]) => {
          const { expires_in } = (integration as AtlassianIntegration).metadata;
          const issueDate = (integration as AtlassianIntegration).updatedAt;
          const expirationDate = new Date(
            getTimestamp({
              offset: issueDate,
              amount: -Number(expires_in),
              scale: "seconds",
            }),
          );
          if (expirationDate < issueDate) {
            await atlassianAuth.refreshToken(
              (integration as IIntegration)._id.toString(),
            );
          }
        }),
    );

    // TODO: use a proper messaging solution instead of plain API request
    const serviceUrl = process.env.DATA_PROCESSOR_URL as string;
    console.log(`${serviceUrl}/build-snapshot -> creating snapshot`);
    console.log(`creating snapshot with orgId: ${organizationId} datasources:`);
    console.log(dataSources);
    const { data: job } = await axios.post(`${serviceUrl}/build-snapshot`, {
      organizationId,
      dataSources,
    });

    console.log("returning response with 202");
    return res.status(202).json({ job });
  }),
);

router.delete(
  "/:id",
  catchAsync(async (req: Request, res: Response) => {
    if (req.user!.role !== "owner") {
      throw AppError({
        message: "Only owners can delete indexes",
        statusCode: 403,
      });
    }

    const { id } = req.params;
    const index = await indexModel.getOneById(id);
    if (!index) {
      throw AppError({ message: "No such embeddings db", statusCode: 404 });
    } else if (!req.user!.organization._id.equals(index.organization._id)) {
      throw AppError({
        message: "User is not a member of this organization",
        statusCode: 403,
      });
    }

    try {
      // Delete Vector DB index
      const vectorStore = new VectorStoresManager().getStore(
        index.name,
        index.type,
      );
      await vectorStore.deleteIndex();
    } catch (err) {
      console.log("Failed to delete vector index", err);
    }

    // Delete internal index
    await indexModel.deleteOneById(id);
    await snapshotModel.delete({ organization: req.user!.organization._id });

    return res.status(200).json({ message: "Successfully deleted index" });
  }),
);

export { router };
