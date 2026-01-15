import mongoose from "mongoose";

export async function runMigration(up, down) {
  // Get the command from command line arguments (up or down)
  const command = process.argv[2] || "up";

  if (!["up", "down"].includes(command)) {
    console.error("Usage: node script.js [up|down]");
    console.error("  up   - Run the migration (default)");
    console.error("  down - Rollback the migration");
    process.exit(1);
  }

  console.log(`Running migration command: ${command}`);

  console.log("Connecting to DB...", process.env.MONGO_URI);
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB!");

  const db = mongoose.connection.db;
  if (command === "up") {
    await up(db);
  } else if (command === "down") {
    await down(db);
  }

  console.log("Disconnecting from DB...");
  await mongoose.disconnect();
  console.log("Disconnected from DB!");
}
