import express, { Request, Response } from "express";
import {
  checkAuth,
  getDBUser as getDBUserMiddleware,
} from "../middlewares/auth";
import {
  userModel,
  PlanFieldCode,
  organizationModel,
  profileModel,
  PasswordResetStatus,
  planModel,
  planStateModel,
} from "@aster/db";
import type { IUser } from "@aster/db";
import { FilterQuery } from "mongoose";
import { catchAsync } from "../utils/errors";
import { AppError } from "../errors";
import { decrementPlanFieldState } from "../services/plans";
import type { EnrichedUser } from "../types/internal";
import { comparePassword } from "../utils/token";
import {
  generateEmailVerificationToken,
  generateToken,
  retrieveRegistrationTokenPayload,
  generatePasswordResetToken,
  retrievePasswordResetTokenPayload,
  generatePasswordHash,
} from "../utils/token";
import { initAvatarImageUploader } from "../services/image-uploader";
import { prepareLocallyUploadedImageUrl } from "../utils/uploads";
import { EmailClient } from "../clients";
import {
  getEmailVerificationEmail,
  getPasswordResetEmail,
} from "../utils/emails";
import { type RouterOptions } from "../types/router";

// Helper function to get users and their Ory (our authentication service) info
const getEnrichedUsers = async (filters: FilterQuery<IUser>) => {
  const users = await userModel.get(filters).populate("profile");

  const enrichedUsers = [] as EnrichedUser[];
  for (let i = 0; i < users.length; i++) {
    const { _id, status, role, email } = users[i];
    const profile = users[i]?.profile;

    // TODO: implement storing user's picture in s3 or azure blob storage
    const picture = prepareLocallyUploadedImageUrl(profile?.picture);
    const name = profile?.name || email;
    enrichedUsers.push({
      _id,
      status,
      email,
      name,
      picture,
      role,
    });
  }
  return enrichedUsers;
};

export function getUserRouter(options: RouterOptions = {}) {
  const { getDBUser = getDBUserMiddleware } = options;

  const router = express.Router();

  router.post(
    "/register",
    catchAsync(async (req: Request, res: Response) => {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        throw AppError({
          message: "All fields are mandatory!",
          statusCode: 400,
        });
      }

      let user = await userModel.getOne({ email });
      if (user && user.status !== "invited") {
        throw AppError({
          message: "User already exists",
          statusCode: 400,
        });
      }

      const token = generateEmailVerificationToken(email, password, name);

      //  TOOD: The email client should be resposible for verifiying
      // if the SMTP env variable is not set, we should not send the email
      const smtpConnectionUrl = process.env.SMTP_CONNECTION_URL as string;
      if (smtpConnectionUrl && token) {
        const subject = "[Action required] Verify your email address";
        const html = getEmailVerificationEmail(token);
        const client = new EmailClient(smtpConnectionUrl);
        await client.sendEmail({ to: email, subject, html });
      }

      else if (!smtpConnectionUrl && token){
        const redirectUrl = `${process.env.DASHBOARD_APP_URL}/callback/signup?token=${token}`

        return res.status(200).json({ success: true, redirectUrl })
      }
      
      else {
        throw AppError({
          message: "Failed to send email verification email",
          statusCode: 500,
        });
      }

      return res.status(200).json({ success: true });
    }),
  );

  router.post(
    "/verify-registration",
    catchAsync(async (req: Request, res: Response) => {
      const { token } = req.body;
      const payload = retrieveRegistrationTokenPayload(token);
      const { email, password, name } = payload as {
        email: string;
        password: string;
        name: string;
      };

      const doesUserExist = await userModel.getOne({ email });
      if (doesUserExist) {
        throw AppError({
          message: "Invalid token",
          statusCode: 400,
        });
      }

      const domain = email.split("@")[1];
      const plan = await planModel.getOne({ name: "free" });
      const organization = await organizationModel.getOrCreate({
        name: domain,
        plan: plan!._id,
        logo: "",
      });

      const existingUserCount = await userModel.getCount({
        organization: organization._id,
        status: "activated",
      });

      // profile create with capitalized names
      const profile = await profileModel.create({
        name,
      });

      //Hash password
      const hashedPassword = await generatePasswordHash(password);
      const role = existingUserCount === 0 ? "owner" : "member";
      const user = await userModel.create({
        email,
        status: "activated",
        password: hashedPassword,
        organization: organization,
        role,
        profile: profile,
        passwordResetCompletedAt: null,
        passwordResetRequestedAt: null,
        passwordResetStatus: null,
      });

      const accessToken = generateToken(user);
      return res.status(200).json({ token: accessToken });
    }),
  );

  router.post(
    "/login",
    catchAsync(async (req: Request, res: Response) => {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400);
        throw AppError({
          message: "All fields are mandatory!",
          statusCode: 400,
        });
      }
      const user = await userModel.getOne({ email });

      if (!user) {
        res.status(401);
        throw AppError({
          message: "User does not exist, please sign up",
          statusCode: 401,
        });
      }

      //compare password with hashedpassword
      if (user && (await comparePassword(password, user.password))) {
        const accessToken = generateToken(user);
        res.status(200).json({ token: accessToken });
      } else {
        res.status(401);
        throw AppError({
          message: "Invalid credentials",
          statusCode: 401,
        });
      }
    }),
  );

  router.post(
    "/forgot-password",
    catchAsync(async (req: Request, res: Response) => {
      const { email } = req.body;
      const user = await userModel.getOne({ email });
      if (!user) {
        throw AppError({ message: "User not found", statusCode: 404 });
      }

      const token = generatePasswordResetToken(email);
      const smtpConnectionUrl = process.env.SMTP_CONNECTION_URL as string;
      if (smtpConnectionUrl && token) {
        const subject = "Reset your password";
        const html = getPasswordResetEmail(token);
        const client = new EmailClient(smtpConnectionUrl);
        await client.sendEmail({ to: email, subject, html });

        await userModel.getOneAndUpdateByFilter(
          { email },
          {
            $set: {
              passwordResetStatus: PasswordResetStatus.requested,
              passwordResetRequestedAt: new Date(),
            },
          },
          { new: true },
        );
      } else {
        throw AppError({
          message: "Failed to send password reset email",
          statusCode: 500,
        });
      }

      return res.status(200).json({ message: "Password reset email sent" });
    }),
  );

  router.post(
    "/reset-password",
    catchAsync(async (req: Request, res: Response) => {
      const { token, newPassword } = req.body;
      try {
        const payload = retrievePasswordResetTokenPayload(token);

        const { email } = payload as { email: string };
        const user = await userModel.getOne({ email });
        if (!user) {
          throw AppError({ message: "User not found", statusCode: 404 });
        }

        if (user.passwordResetStatus !== PasswordResetStatus.requested) {
          throw AppError({ message: "Invalid token", statusCode: 400 });
        }

        await userModel.getOneAndUpdateByFilter(
          { email },
          {
            $set: {
              password: await generatePasswordHash(newPassword),
              passwordResetStatus: PasswordResetStatus.completed,
              passwordResetCompletedAt: new Date(),
            },
          },
          { new: true },
        );

        const accessToken = generateToken(user);

        return res.status(200).json({ token: accessToken });
      } catch (error) {
        throw AppError({ message: "Token expired", statusCode: 400 });
      }
    }),
  );

  router.use(checkAuth);

  router.get(
    "/",
    catchAsync(async (req: Request, res: Response) => {
      // TODO: prevent users from viewing other org users
      const { id, organizationId } = req.query;
      const filters: FilterQuery<IUser> = {};
      if (id) {
        filters["_id"] = id as string;
      }
      if (organizationId) {
        filters["organization"] = organizationId;
      }

      const users = await getEnrichedUsers(filters);
      return res.status(200).json({ users });
    }),
  );

  router.get("/me", getDBUser, async (req: Request, res: Response) => {
    return res.status(200).json(req.user);
  });

  router.post(
    "/change-password",
    getDBUser,
    catchAsync(async (req: Request, res: Response) => {
      const { currentPassword, newPassword } = req.body;
      const user = await userModel.getOneById(req.user!._id);

      if (!user) {
        throw AppError({ message: "User not found", statusCode: 404 });
      }

      if (await comparePassword(currentPassword, user.password)) {
        user.password = await generatePasswordHash(newPassword);
        await user.save();

        return res
          .status(200)
          .json({ message: "Password changed successfully" });
      }
      throw AppError({ message: "Invalid current password", statusCode: 400 });
    }),
  );

  const profileImageUploader = initAvatarImageUploader("profile");
  router.put(
    "/:id",
    getDBUser,
    profileImageUploader.uploadMiddleware("picture"),
    catchAsync(async (req: Request, res: Response) => {
      const { ...data } = req.body;
      const { id } = req.params;

      if (!id) {
        throw AppError({
          message: "Payload must contain an ID",
          statusCode: 400,
        });
      } else if (!Object.keys(data).length && !req.file) {
        throw AppError({
          message: "Payload must not be empty",
          statusCode: 400,
        });
      } else if (
        req.user!._id.toString() !== id &&
        req.user!.role !== "owner"
      ) {
        throw AppError({
          message: "You are not authorized to update this user",
          statusCode: 403,
        });
      }

      let imageUploadSucceeded = false;
      // Handle profile image upload if present
      if (req.file) {
        try {
          const uploadResult = await profileImageUploader.uploadImage(req);
          if (uploadResult.success) {
            data.picture = uploadResult.metadata?.storagePath;
            imageUploadSucceeded = true;
          } else {
            throw AppError({
              message: "Failed to upload profile image",
              statusCode: 400,
            });
          }
        } catch (error) {
          throw AppError({
            message: "Error uploading profile image",
            statusCode: 500,
          });
        }
      }

      await profileModel.getOneByIdAndUpdate(req.user!.profile._id, data);

      if (imageUploadSucceeded) {
        try {
          const pictureName = req.user!.profile.picture?.split("/").pop();
          await profileImageUploader.deleteImage(pictureName);
        } catch (error) {
          console.error("Failed to delete profile image:", error);
        }
      }

      const user = await userModel
        .getOneByIdAndUpdate(id, data)
        .populate("organization");

      if (!user) {
        throw AppError({ message: "User was not found", statusCode: 404 });
      }
      return res.status(200).json(user);
    }),
  );

  router.put(
    "/:id/accept-invite",
    catchAsync(async (req: Request, res: Response) => {
      const { id } = req.params;

      if (!id) {
        throw AppError({
          message: "Payload must contain an ID",
          statusCode: 400,
        });
      }

      const user = await userModel
        .getOneByIdAndUpdate(id, { status: "activated" })
        .populate("organization");

      if (!user) {
        throw AppError({ message: "User was not found", statusCode: 404 });
      }

      return res.status(200).json(user);
    }),
  );

  router.delete(
    "/:id",
    getDBUser,
    catchAsync(async (req: Request, res: Response) => {
      const { id } = req.params;

      const user = await userModel.getOneById(id);
      if (!user) {
        throw AppError({ message: "User was not found", statusCode: 404 });
      } else if (!req.user!.organization._id.equals(user.organization._id)) {
        throw AppError({
          message: "Users not in the same organization",
          statusCode: 403,
        });
      } else if (req.user!.role !== "owner") {
        throw AppError({
          message: "Only owners can delete other users",
          statusCode: 403,
        });
      }

      await userModel.deleteOneById(id);
      const profile_id = user?.profile?._id;
      if (profile_id) {
        await profileModel.deleteOneById(profile_id);
      }

      try {
        // Decrease the seats count in the plan state
        await decrementPlanFieldState({
          organizationId: String(user.organization._id),
          fieldCode: PlanFieldCode.seats,
        });
      } catch (error) {
        console.error("Failed to decrement plan field state:", error);
        // We don't throw an error here, as we want to proceed with user deletion
      }

      return res.status(200).json({ deleted: true });
    }),
  );

  return router;
}
