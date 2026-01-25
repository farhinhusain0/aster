import { IUser, userModel } from "@aster/db";
import { Request } from "express";
import { prepareLocallyUploadedImageUrl } from "./uploads";
import { AppError, ErrorCode } from "../errors";

/**
 * Creates a transform function that prepares image URLs for a given field
 */
function createImageUrlTransform(fieldName: string) {
  return (doc: any) => {
    if (doc?.[fieldName]) {
      doc[fieldName] = prepareLocallyUploadedImageUrl(doc[fieldName]);
    }
    return doc;
  };
}

export async function getUserFromRequest(
  req: Request,
  populate: { path: string }[] = [],
  organizationPopulate: { path: string }[] = [],
): Promise<IUser> {
  const userId = req.decodedUser!.id;
  const user = await userModel
    .getOne({ _id: userId })
    .select("-password")
    .populate({
      path: "organization",
      transform: createImageUrlTransform("logo"),
      populate: [{ path: "plan" }, ...organizationPopulate],
    })
    .populate({
      path: "profile",
      transform: createImageUrlTransform("picture"),
    })
    .populate(populate);

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
