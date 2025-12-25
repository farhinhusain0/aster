import * as restify from "restify";
import { adapter } from "./adapter";

import { TurnContext } from "botbuilder";
import { TeamsBot } from "./bot";
import { connectAndInitDb } from "@aster/db/init";
import { handleTeamsSubscriptionNotification } from "./services/webhook";

const mongoUri = process.env.MONGO_URI as string;

const server = restify.createServer();
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.listen(process.env.MICROSOFT_TEAMS_BOT_PORT || 3006, async () => {
  await connectAndInitDb(mongoUri, "teamsbot");
  console.log(`\n[App] ⚡️ Teams bot listening on port ${server.url}`);
});

const bot = new TeamsBot();

server.get("/", async (req, res) => {
  res.send("Hello World! This is a Teams bot.");
});

server.opts("/api/messages", async (req, res) => {
  res.send(200);
});

server.post("/api/messages", async (req, res) => {
  try {
    await adapter.process(req, res, async (context: TurnContext) => {
      await bot.run(context);
    });
  } catch (error) {
    console.error("\n[App] Error processing request:", error);
  }
});

server.post("/api/webhook/message", handleTeamsSubscriptionNotification);
