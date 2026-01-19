import {
  userModel,
  profileModel,
  organizationModel,
  planModel,
  planStateModel,
  investigationModel,
  investigationCheckModel,
  IUser,
  IOrganization,
  IInvestigation,
  IInvestigationCheck,
} from "@aster/db";
import { generatePasswordHash } from "../utils/token";
import {
  getGithubCheckData,
  getGrafanaCheckData,
  getInvestigationData,
} from "./investigation-data";
import mongoose from "mongoose";
import {
  createSeedUser,
  SEED_USER_PRESETS,
  createSeedOrganization,
  SEED_ORG_PRESETS,
} from "./factories";

/**
 * Seeds a demo user for quick-start mode.
 * This function is idempotent - it will not create duplicates if run multiple times.
 */
export async function seedQuickStartData(): Promise<void> {
  console.log(""); // Empty line for separation

  const user = await seedUser();
  if (!user) {
    console.error(
      "[QuickStart] Failed to seed user. Cannot seed investigation.",
    );
    return;
  }
  const organization = user.organization;

  const investigation = await seedInvestigation(organization);
  if (!investigation) {
    console.error(
      "[QuickStart] Failed to seed investigation. Cannot seed investigation checks.",
    );
    return;
  }

  const githubInvestigationCheck =
    await seedGithubInvestigationCheck(investigation);
  if (!githubInvestigationCheck) {
    console.error(
      "[QuickStart] Failed to seed github investigation check. Cannot seed investigation checks.",
    );
    return;
  }

  const grafanaInvestigationCheck =
    await seedGrafanaInvestigationCheck(investigation);
  if (!grafanaInvestigationCheck) {
    console.error(
      "[QuickStart] Failed to seed grafana investigation check. Cannot seed investigation checks.",
    );
    return;
  }

  console.log("[QuickStart] Seeded quick-start data successfully!");
  console.log(`[QuickStart] Email: ${user.email}`);
  console.log(`[QuickStart] Password: ${SEED_USER_PRESETS.quickStartUser.password}`);
}

async function seedUser(): Promise<IUser | undefined> {
  const existingUser = await userModel.getOneById(SEED_USER_PRESETS.quickStartUser._id);
  if (existingUser) {
    console.log("[QuickStart] User already exists, skipping seed.");
    return existingUser;
  }

  // 1. Get the free plan
  const plan = await planModel.getOne({ name: "free" });
  if (!plan) {
    console.error("[QuickStart] Free plan not found. Cannot seed user.");
    return;
  }

  // 2. Create organization using type-safe factory
  const organizationData = createSeedOrganization({
    _id: SEED_ORG_PRESETS.quickStartOrg._id,
    name: SEED_ORG_PRESETS.quickStartOrg.name,
    plan: plan._id,
    logo: SEED_ORG_PRESETS.quickStartOrg.logo,
    domains: [...SEED_ORG_PRESETS.quickStartOrg.domains],
  });

  const organization = await organizationModel.create(organizationData);

  // 3. Initialize plan state
  await planStateModel.createInitialState(plan._id, organization._id);

  // 4. Create profile
  const profile = await profileModel.create({
    name: SEED_USER_PRESETS.quickStartUser.name,
  });

  // 5. Hash password
  const hashedPassword = await generatePasswordHash(SEED_USER_PRESETS.quickStartUser.password);

  // 6. Create user using type-safe factory
  const userData = createSeedUser({
    _id: SEED_USER_PRESETS.quickStartUser._id,
    email: SEED_USER_PRESETS.quickStartUser.email,
    password: hashedPassword,
    name: SEED_USER_PRESETS.quickStartUser.name,
    organization: organization,
    profile: profile,
    status: "activated",
    role: "owner",
  });

  const user = await userModel.create(userData);

  return user;
}

async function seedInvestigation(
  organization: IOrganization,
): Promise<IInvestigation> {
  const investigationData = getInvestigationData();

  const existingInvestigation = await investigationModel.getOneById(
    investigationData._id,
  );
  if (existingInvestigation) {
    console.log("[QuickStart] Investigation already exists, skipping seed.");
    return existingInvestigation;
  }

  // 7. Create investigation
  const investigation = await investigationModel.create({
    organization: organization,
    status: "active",
    ...investigationData,
  });

  return investigation;
}

async function seedGithubInvestigationCheck(
  investigation: IInvestigation,
): Promise<IInvestigationCheck> {
  const githubCheckData = getGithubCheckData();

  const existingGithubInvestigationCheck =
    await investigationCheckModel.getOneById(githubCheckData._id);
  if (existingGithubInvestigationCheck) {
    console.log(
      "[QuickStart] Github investigation check already exists, skipping seed.",
    );
    return existingGithubInvestigationCheck;
  }

  const githubInvestigationCheck = await investigationCheckModel.create({
    investigation: investigation,
    source: "github",
    ...githubCheckData,
  });
  return githubInvestigationCheck;
}

async function seedGrafanaInvestigationCheck(
  investigation: IInvestigation,
): Promise<IInvestigationCheck> {
  const grafanaCheckData = getGrafanaCheckData();

  const existingGrafanaInvestigationCheck =
    await investigationCheckModel.getOneById(grafanaCheckData._id);
  if (existingGrafanaInvestigationCheck) {
    console.log(
      "[QuickStart] Grafana investigation check already exists, skipping seed.",
    );
    return existingGrafanaInvestigationCheck;
  }

  const grafanaInvestigationCheck = await investigationCheckModel.create({
    investigation: investigation,
    source: "grafana",
    ...grafanaCheckData,
  });
  return grafanaInvestigationCheck;
}
