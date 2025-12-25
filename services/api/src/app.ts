import express, { Request, Response } from "express";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import {
  webhooksRouter,
  getChatRouter,
  getUserRouter,
  integrationsRouter,
  vendorsRouter,
  inviteRouter,
  organizationsRouter,
  indexRouter,
  getFeaturesRouter,
  jobsRouter,
  investigationRouter,
} from "./routers";
import { errorHandler, invalidPathHandler } from "./middlewares/errors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

interface AppOptions {
  extraRouters?: Array<{ path: string; router: express.Router }>;
  routerOverrides?: {
    [key: string]: express.Router;
  };
}

export function createApp(options: AppOptions = {}) {
  const app = express();

  app.use(morgan("common"));
  app.use(
    cors({
      credentials: true,
      origin: process.env.DASHBOARD_APP_URL,
    }),
  );
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: "1mb" }));
  // Serve static files from public directory
  app.use(express.static("public"));

  // Serve uploaded images from IMAGE_UPLOAD_DATA_DIRECTORY
  if (!process.env.IMAGE_UPLOAD_DATA_DIRECTORY) {
    throw new Error("IMAGE_UPLOAD_DATA_DIRECTORY is not set");
  }
  app.use(
    "/uploads",
    express.static(path.join(process.env.IMAGE_UPLOAD_DATA_DIRECTORY), {
      maxAge: "1d", // Cache files for 1 day
      setHeaders: (res) => {
        res.set("X-Content-Type-Options", "nosniff");
        res.set("Cache-Control", "public, max-age=86400");
      },
    }),
  );

  app.get("/", (req: Request, res: Response) => {
    return res.status(200).send("Aster API 😊");
  });

  if (options.extraRouters) {
    options.extraRouters.forEach((router) => {
      app.use(router.path, router.router);
    });
  }
  // Attach routers to app
  app.use("/users", options.routerOverrides?.["/users"] || getUserRouter());
  app.use("/webhooks", webhooksRouter);
  app.use("/chat", options.routerOverrides?.["/chat"] || getChatRouter());
  app.use("/integrations", integrationsRouter);
  app.use("/vendors", vendorsRouter);
  app.use("/invite", inviteRouter);
  app.use(
    "/organizations",
    options.routerOverrides?.["/organizations"] || organizationsRouter,
  );
  app.use("/index", indexRouter);
  app.use("/features", options.routerOverrides?.["/features"] || getFeaturesRouter());
  app.use("/jobs", jobsRouter);
  app.use("/investigations", investigationRouter);
  app.use("/test", async (req: Request, res: Response) => {
    return res.status(200).send("Hello World");
  });

  app.all("*", invalidPathHandler); // Handle 404

  // Global error handler
  app.use(errorHandler);

  return app;
}
