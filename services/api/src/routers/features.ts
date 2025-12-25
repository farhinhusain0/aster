import express, { Request, Response } from "express";
import { checkAuth, getDBUser } from "../middlewares/auth";
import { catchAsync } from "../utils/errors";

export function getFeatures() {
  const smtpConnectionUrl = process.env.SMTP_CONNECTION_URL as string;
  return {
    isInviteMembersEnabled: !!smtpConnectionUrl,
  };
}

export function getFeaturesRouter() {
  const router = express.Router();
  router.use(checkAuth);
  router.use(getDBUser);

  router.get(
    "/",
    catchAsync(async (req: Request, res: Response) => {
      return res.status(200).json(getFeatures());
    }),
  );

  return router;
}
