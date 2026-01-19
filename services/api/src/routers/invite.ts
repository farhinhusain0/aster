import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { checkAuth, getDBUser } from "../middlewares/auth";
import { EmailClient, OpsgenieClient, PagerDutyClient } from "../clients";
import { userModel, integrationModel } from "@aster/db";
import type {
  IIntegration,
  IOrganization,
  OpsgenieIntegration,
  PagerDutyIntegration,
} from "@aster/db";
import { catchAsync } from "../utils/errors";
import { isSMTPEnabled } from "../utils/ee";
import { AppError } from "../errors";
import { refreshPagerDutyToken } from "../services/oauth";
import { secretManager } from "../common/secrets";

const router = express.Router();
router.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isSMTPEnabled()) {
      throw AppError({
        message: "SMTP is not enabled",
        statusCode: 400,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});
router.use(checkAuth);
router.use(getDBUser);

router.get(
  "/import",
  catchAsync(async (req: Request, res: Response) => {
    if (req.user!.role !== "owner") {
      throw AppError({
        message: "Only owners can invite members",
        statusCode: 403,
      });
    }

    const { source } = req.query;
    const allowedSources = ["PagerDuty", "Opsgenie"];

    if (!allowedSources.includes(source as string)) {
      throw AppError({
        message: `Source is invalid. Allowed sources: ${allowedSources.join(", ")}`,
        statusCode: 400,
      });
    }

    let integration = (await integrationModel.getIntegrationByName(
      source as string,
      {
        organization: req.user!.organization._id,
      },
    )) as IIntegration;
    if (!integration) {
      throw AppError({
        message: `Your organization do not have an integration with ${source}`,
        statusCode: 404,
      });
    }

    switch (source) {
      case "Opsgenie": {
        integration = (
          await secretManager.populateCredentials([integration])
        )[0] as IIntegration;
        const { region } = (integration as OpsgenieIntegration).metadata;
        const { apiKey } = (integration as OpsgenieIntegration).credentials;
        const opsgenieClient = new OpsgenieClient(apiKey, region);

        const usersData = await opsgenieClient.getUsers();
        if (!usersData) {
          throw AppError({
            message: `Could not fetch users from ${source}`,
            statusCode: 500,
          });
        }
        return res.status(200).json({ users: usersData.data });
      }
      case "PagerDuty": {
        // TODO: need to extract refresh tokens to a centralized place.
        await refreshPagerDutyToken(integration._id.toString());
        integration = (
          await secretManager.populateCredentials([integration])
        )[0] as IIntegration;
        const { access_token } = (integration as PagerDutyIntegration)
          .credentials;
        const pagerdutyClient = new PagerDutyClient(access_token);
        const users = await pagerdutyClient.getUsers();
        if (!users) {
          throw AppError({
            message: `Could not fetch users from ${source}`,
            statusCode: 500,
          });
        }
        return res.status(200).json({ users });
      }
      default: {
        throw AppError({
          message: `Source ${source} is not supported`,
          statusCode: 400,
        });
      }
    }
  }),
);

router.post(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    if (req.user!.role !== "owner") {
      throw AppError({
        message: "Only owners can invite members",
        statusCode: 403,
      });
    }

    const emails = req.body.emails as string[];

    const emailRegex =
      /^(?!.*\.\.)(?!\.)(?!.*\.$)(?!.*\.\-)(?!.*\-\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    const invalidEmails = emails.filter(
      (email: string) => !emailRegex.test(email)
    );
    if (invalidEmails.length > 0) {
      throw AppError({
        message: `The following emails do not match your organization's domain: ${invalidEmails.join(
          ", ",
        )}`,
        statusCode: 400,
      });
    }

    const sendInvitation = async (
      email: string,
      organization: IOrganization,
    ): Promise<{ email: string; signup_link: string }> => {
      const signup_link = "https://app.aster.so/signup/";
      // Create an internal user
      const internalUser = await userModel.create({
        status: "invited",
        role: "member",
        organization,
        email,
      });

      // Send Email
      const smtpConnectionUrl = process.env.SMTP_CONNECTION_URL as string;
      if (smtpConnectionUrl) {
        const subject = "Invitation to Aster";
        const html = `You have been invited to Aster.
    Please click the following link to join: <a href=${signup_link}>Click here</a>.
    Once you are registered, you can sign in to https://app.aster.so or start using the Slack bot!`;
        const client = new EmailClient(smtpConnectionUrl);
        await client.sendEmail({ to: email, subject, html });
      }

      return { email, signup_link };
    };

    const invitations = await Promise.all(
      emails.map((email: string) =>
        sendInvitation(email, req.user!.organization),
      ),
    );

    return res.status(200).json({ sent: true, invitations });
  }),
);

export { router };
