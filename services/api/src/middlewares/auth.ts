import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import { catchAsync } from "../utils/errors";
import jwt from "jsonwebtoken";
import { getUserFromRequest } from "../utils/auth";
import { authTokenModel } from "@aster/db";

declare module "express-serve-static-core" {
  interface Request {
    decodedUser?: { id: string; email: string }; // Decoded user from JWT
  }
}

export const checkAuth = async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const authToken = req.query.access_token as string;

    if (!authHeader && !authToken) {
      throw AppError({
        message: "User not authorized or token missing",
        statusCode: 401,
      });
    }

    if (
      authHeader &&
      (typeof authHeader !== "string" || !authHeader.startsWith("Bearer "))
    ) {
      throw AppError({
        message: "User not authorized or token missing",
        statusCode: 401,
      });
    }

    const token = authHeader ? authHeader.split(" ")[1] : authToken;
    const dbToken = await authTokenModel.getOne({ token });
    if (!dbToken) {
      throw AppError({
        message: "User not authorized!",
        statusCode: 401,
      });
    }

    jwt.verify(
      token,
      process.env.JWT_SIGNING_SECRET as string,
      (err, decoded) => {
        if (err) {
          throw AppError({
            message: "User not authorized!",
            statusCode: 401,
          });
        }

        req.decodedUser = decoded as { id: string; email: string };
        next();
      },
    );
  } catch (error) {
    next(error);
  }
};

export const getDBUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserFromRequest(req, [{ path: "plan" }]);

    req.user = user;
    next();
  },
);
