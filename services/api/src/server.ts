import { connectAndInitDb } from "@aster/db/init";
import { startAllJobs, stopAllJobs } from "./jobs";
import { createApp } from "./app";

init();

async function init() {
  const port = process.env.PORT || 3000;
  const mongoUri = process.env.MONGO_URI as string;

  // Connect to DB
  await connectAndInitDb(mongoUri, "api");

  // Start all cron jobs
  console.log("\n[Server] Stopping all the jobs before starting new ones");
  stopAllJobs();
  console.log("\n[Server] Starting all the jobs");
  startAllJobs();

  try {
    createApp().listen(port, () => {
      console.log(`\n[Server] Server is listening on Port ${port}\n\n`);
    });
  } catch (error) {
    console.log("[Server] An error occurred: ", error);
    console.error(`[Server] An error occurred: ${JSON.stringify(error)}`);
    process.exit(1);
  }
}
