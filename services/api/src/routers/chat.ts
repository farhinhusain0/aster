import express, { Request, Response } from "express";
import Langfuse from "langfuse";
import { getSlackUser } from "../middlewares/slack";
import { AppError } from "../errors";
import { catchAsync } from "../utils/errors";
import { isLangfuseEnabled } from "../utils/ee";
import {
  checkAuth,
  getDBUser as getDBUserMiddleware,
} from "../middlewares/auth";
import { getTeamsUser } from "../middlewares/teams";
import { ChatCompletions as DefaultChatCompletions } from "../utils/chat";
import { type RouterOptions } from "../types/router";

interface ChatRouterOptions extends RouterOptions {
  ChatCompletions?: typeof DefaultChatCompletions;
}

export function getChatRouter(options: ChatRouterOptions = {}) {
  const {
    ChatCompletions = DefaultChatCompletions,
    getDBUser = getDBUserMiddleware,
  } = options;

  if (!ChatCompletions) {
    throw new Error("ChatCompletions is required");
  }

  const router = express.Router();

  /** This endpoint is called by our Slack application
   * It provides the app token as the authentication means, instead of Ory session token
   * TODO: figure out if we can generate a token from the slack app on the fly.
   */
  router.post(
    "/completions/slack",
    getSlackUser,
    catchAsync(async (req: Request, res: Response) => {
      const completions = await new ChatCompletions(req).getCompletions();
      return res.status(200).json(completions);
    }),
  );

  router.post(
    "/completions/teams",
    getTeamsUser,
    catchAsync(async (req: Request, res: Response) => {
      const completions = await new ChatCompletions(req).getCompletions();
      return res.status(200).json(completions);
    }),
  );

  router.post(
    "/completions/general",
    checkAuth,
    getDBUser,
    catchAsync(async (req: Request, res: Response) => {
      const completions = await new ChatCompletions(req).getCompletions();
      return res.status(200).json(completions);
    }),
  );

  router.post(
    "/feedback",
    catchAsync(async (req: Request, res: Response) => {
      if (!isLangfuseEnabled()) {
        return res.status(500).json({ message: "Langfuse is not enabled" });
      }

      const { traceId, observationId, value, text } = req.body;
      if (isLangfuseEnabled()) {
        if (!traceId || !observationId || !value) {
          throw AppError({
            message:
              "Bad request. Need to supply traceId, observationId and value",
            statusCode: 400,
          });
        }
        const langfuse = new Langfuse({
          secretKey: process.env.LANGFUSE_SECRET_KEY as string,
          publicKey: process.env.LANGFUSE_PUBLIC_KEY as string,
          baseUrl: process.env.LANGFUSE_HOST as string,
        });
        await langfuse.score({
          name: "user-feedback",
          traceId,
          observationId,
          value: value > 0 ? 1 : 0,
        });
      }
      return res.status(200).json({ message: "Feedback has been received" });
    }),
  );

  return router;
}
