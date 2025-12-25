import mongoose from "mongoose";

/**
 * Connect to MongoDB and initialize schemas/models.
 *
 * @param mongoUri - MongoDB connection URI
 * @param service - Optional service identifier for conditional seeding
 */
export async function connectAndInitDb(
  mongoUri: string,
  service?: "slackbot" | "teamsbot" | "api",
): Promise<void> {
  console.log(
    `\n[DBPackage]🔌 Connecting to DB. URL: ${mongoUri} for service: ${service}`,
  );
  await mongoose.connect(mongoUri);
  console.log(`[DBPackage]🔌 Connected to DB! for service: ${service}`);

  if (service === "api") {
    console.log("[DBPackage]🌱 Seeding vendors and plans for API service...");
    const { seedVendors } = require("./models/vendor");
    const { seedPlans } = require("./models/plan");
    await Promise.all([seedVendors(), seedPlans()]);
    console.log("[DBPackage]🌱 Seeded vendors and plans for API service!");
  }
}

/**
 * Disconnect from MongoDB.
 */
export async function disconnectFromDb(): Promise<void> {
  await mongoose.disconnect();
  console.log("[DBPackage]🔌 Disconnected from DB!");
}
