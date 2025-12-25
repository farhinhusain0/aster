import express, { Request, Response } from "express";
import {
  organizationModel,
  userModel,
  planModel,
  integrationModel,
  webhookModel,
  indexModel,
  planStateModel,
} from "@aster/db";
import { checkAuth, getDBUser } from "../middlewares/auth";
import { catchAsync } from "../utils/errors";
import { AppError } from "../errors";
import { initAvatarImageUploader } from "../services/image-uploader";
import { prepareLocallyUploadedImageUrl } from "../utils/uploads";

const router = express.Router();

router.use(checkAuth);
router.use(getDBUser);

router.post(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    const { name } = req.body;

    if (req.user!.organization) {
      throw AppError({
        message: "You already belong to an organization",
        statusCode: 400,
      });
    }

    const plan = await planModel.getOne({ name: "free" });
    const organization = await organizationModel.create({
      name,
      plan: plan!._id,
      logo: "",
    });
    await planStateModel.createInitialState(plan!._id, organization._id);

    await userModel.getOneAndUpdate(
      { _id: req.user!._id },
      {
        organization: organization,
        role: "owner",
      },
    );

    return res.status(200).json(organization);
  }),
);

router.get(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    const organization = req.user!.organization;

    return res.status(200).json(organization);
  }),
);

const organizationLogoUploader = initAvatarImageUploader("organization");
router.put(
  "/:id",
  organizationLogoUploader.uploadMiddleware("logo"),
  catchAsync(async (req: Request, res: Response) => {
    if (req.params.id !== req.user!.organization._id.toString()) {
      throw AppError({
        message: "You are not authorized to update this organization",
        statusCode: 403,
      });
    } else if (req.user!.role !== "owner") {
      throw AppError({
        message: "Only owners can update organization data",
        statusCode: 403,
      });
    }

    let imageUploadSucceeded = false;
    if (req.file) {
      try {
        const uploadResult = await organizationLogoUploader.uploadImage(req);
        if (uploadResult.success) {
          req.body.organization.logo = uploadResult.metadata?.storagePath;
          imageUploadSucceeded = true;
        } else {
          console.error("Failed to upload organization logo:", uploadResult);
          throw AppError({
            message: "Failed to upload organization logo",
            statusCode: 400,
          });
        }
      } catch (error) {
        console.error("Failed to upload organization logo:", error);
        throw AppError({
          message: "Failed to upload organization logo",
          statusCode: 500,
        });
      }
    }

    const { id } = req.params;
    const { organization } = req.body;
    await organizationModel.getOneByIdAndUpdate(id, organization);

    if (imageUploadSucceeded) {
      try {
        const logoName = req.user!.organization.logo?.split("/").pop();
        await organizationLogoUploader.deleteImage(logoName);
      } catch (error) {
        console.error("Failed to delete organization logo:", error);
      }
    }

    const updatedOrganization = await organizationModel.getOneById(id);
    updatedOrganization!.logo = prepareLocallyUploadedImageUrl(
      updatedOrganization!.logo,
    );

    return res.status(200).json(updatedOrganization);
  }),
);

router.delete(
  "/:id",
  catchAsync(async (req: Request, res: Response) => {
    if (req.user!.role !== "owner") {
      throw AppError({
        message: "Only owners can delete organizations",
        statusCode: 403,
      });
    }
    const { id } = req.params;

    // First, delete all related data to that organization
    await Promise.all([
      integrationModel.delete({ organization: id }),
      webhookModel.delete({ organization: id }),
      indexModel.delete({ organization: id }),
      planStateModel.delete({ organization: id }),
    ]);

    // Make all users orphans
    const users = await userModel.get({ organization: id });
    for (const user of users) {
      await userModel.getOneAndUpdate(
        { _id: user._id },
        { organization: undefined },
      );
    }

    // Finally, delete the organization
    const updated = await organizationModel.deleteOneById(id);

    return res.status(200).json(updated);
  }),
);

export { router };
