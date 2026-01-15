import {
  userModel,
  profileModel,
  organizationModel,
  planModel,
  planStateModel,
} from "@aster/db";
import { generatePasswordHash } from "./utils/token";

const QUICK_START_USER = {
  email: "linus@aster.so",
  password: "justforfun1991",
  name: "Linus Torvalds",
};

const QUICK_START_ORG = {
  name: "Aster",
  logo: "",
  domains: ["aster.so"],
};

/**
 * Seeds a demo user for quick-start mode.
 * This function is idempotent - it will not create duplicates if run multiple times.
 */
export async function seedQuickStartUser(): Promise<void> {
  console.log(""); // Empty line for separation

  // Check if user already exists
  const existingUser = await userModel.getOne({
    email: QUICK_START_USER.email,
  });
  if (existingUser) {
    console.log("[QuickStart] Demo user already exists, skipping seed.");
    console.log(`[QuickStart] Email: ${QUICK_START_USER.email}`);
    console.log(`[QuickStart] Password: ${QUICK_START_USER.password}`);
    return;
  }

  console.log("[QuickStart] Seeding demo user...");

  // 1. Get the free plan
  const plan = await planModel.getOne({ name: "free" });
  if (!plan) {
    console.error("[QuickStart] Free plan not found. Cannot seed user.");
    return;
  }

  // 2. Create organization
  const organization = await organizationModel.create({
    name: QUICK_START_ORG.name,
    plan: plan._id,
    logo: QUICK_START_ORG.logo,
    domains: QUICK_START_ORG.domains,
  });

  // 3. Initialize plan state
  await planStateModel.createInitialState(plan._id, organization._id);

  // 4. Create profile
  const profile = await profileModel.create({
    name: QUICK_START_USER.name,
  });

  // 5. Hash password
  const hashedPassword = await generatePasswordHash(QUICK_START_USER.password);

  // 6. Create user
  await userModel.create({
    email: QUICK_START_USER.email,
    password: hashedPassword,
    status: "activated",
    role: "owner",
    organization: organization,
    profile: profile,
    passwordResetCompletedAt: null,
    passwordResetRequestedAt: null,
    passwordResetStatus: null,
  });

  console.log("[QuickStart] Demo user seeded successfully!");
  console.log(`[QuickStart] Email: ${QUICK_START_USER.email}`);
  console.log(`[QuickStart] Password: ${QUICK_START_USER.password}`);
}
