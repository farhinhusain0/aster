import { IUser, userModel } from "@aster/db";
import { Request } from "express";
import { prepareLocallyUploadedImageUrl } from "./uploads";
import { AppError, ErrorCode } from "../errors";

export async function getUserFromRequest(
  req: Request,
  organizationPopulate: { path: string }[],
): Promise<IUser> {
  const userId = req.decodedUser!.id;
  const user = await userModel
    .getOne({ _id: userId })
    .select("-password")
    .populate({
      path: "organization",
      transform: (doc) => {
        if (doc && doc.logo) {
          doc.logo = prepareLocallyUploadedImageUrl(doc.logo);
        }
        return doc;
      },
      populate: organizationPopulate,
    })
    .populate({
      path: "profile",
      transform: (doc) => {
        if (doc && doc.picture) {
          doc.picture = prepareLocallyUploadedImageUrl(doc.picture);
        }
        return doc;
      },
    });

  if (!user) {
    throw AppError({
      message: "No internal user",
      statusCode: 401,
      internalCode: ErrorCode.NO_INTERNAL_USER,
    });
  }

  if (user.status === "deactivated") {
    throw AppError({
      message: "User is deactivated",
      statusCode: 403,
    });
  }

  return user;
}
