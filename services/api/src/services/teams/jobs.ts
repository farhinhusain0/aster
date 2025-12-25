import cron from "node-cron";
import { TeamsSubscriptionService } from "./subscriptions";

// Run every 10 minutes to check for expiring subscriptions
// The interval here is directly related to the check we do in the subscriptions.ts file
// We check for subscriptions that are about to expire within 20 minutes
// This provides a buffer for the 10-minute cron job interval
const subscriptionRenewalJob = cron.schedule("*/10 * * * *", async () => {
  console.log("\n\n\n[TeamsJobs] Running Teams subscription renewal job...");
  await TeamsSubscriptionService.renewExpiredSubscriptions();
});

export async function startTeamsJobs() {
  if (process.env.MICROSOFT_TEAMS_SUBSCRIPTION_RENEW_DISABLED !== "true") {
    // Run immediately on startup
    console.log("[TeamsJobs] Running Teams subscription renewal job immediately...");
    await TeamsSubscriptionService.renewExpiredSubscriptions();

    // Then start the scheduled job for subsequent runs
    subscriptionRenewalJob.start();
  }
  console.log("[TeamsJobs] Teams job started");
}

export function stopTeamsJobs() {
  subscriptionRenewalJob.stop();
  console.log("[TeamsJobs] Teams job stopped");
}
