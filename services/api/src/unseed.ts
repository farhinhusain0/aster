import { connectAndInitDb } from "@aster/db/init";
import { removeQuickStartData } from "./seed";

unseed();

async function unseed() {
  const mongoUri = process.env.MONGO_URI as string;

  // Connect to DB
  await connectAndInitDb(mongoUri, "api");

  // Remove quick-start seed data
  await removeQuickStartData();

  console.log("[Unseed] Process complete. Exiting...");
  process.exit(0);
}
