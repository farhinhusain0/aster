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
  createSeedUser,
  SEED_USER_PRESETS,
  createSeedOrganization,
  SEED_ORG_PRESETS,
  createSeedInvestigation,
  SEED_INVESTIGATION_PRESETS,
  createSeedInvestigationCheck,
  SEED_INVESTIGATION_CHECK_PRESETS,
  createSeedProfile,
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
  console.log(
    `[QuickStart] Password: ${SEED_USER_PRESETS.quickStartUser.password}`,
  );
}

async function seedUser(): Promise<IUser | undefined> {
  const existingUser = await userModel.getOneById(
    SEED_USER_PRESETS.quickStartUser._id,
  );
  if (existingUser) {
    console.log("[QuickStart] User already exists, skipping seed.");
    return existingUser;
  }

  const plan = await planModel.getOne({ name: "free" });
  if (!plan) {
    console.error("[QuickStart] Free plan not found. Cannot seed user.");
    return;
  }

  // Get or create organization
  const existingOrganization = await organizationModel.getOneById(
    SEED_ORG_PRESETS.quickStartOrg._id,
  );
  const organization =
    existingOrganization ||
    (await organizationModel.create(
      createSeedOrganization({
        _id: SEED_ORG_PRESETS.quickStartOrg._id,
        name: SEED_ORG_PRESETS.quickStartOrg.name,
        plan: plan._id,
        logo: SEED_ORG_PRESETS.quickStartOrg.logo,
        domains: [...SEED_ORG_PRESETS.quickStartOrg.domains],
      }),
    ));

  await planStateModel.createInitialState(plan._id, organization._id);

  // Get or create profile
  const existingProfile = await profileModel.getOneById(
    SEED_USER_PRESETS.quickStartUser.profile._id,
  );
  const profile =
    existingProfile ||
    (await profileModel.create(
      createSeedProfile(SEED_USER_PRESETS.quickStartUser.profile),
    ));

  const hashedPassword = await generatePasswordHash(
    SEED_USER_PRESETS.quickStartUser.password,
  );

  const userData = createSeedUser({
    _id: SEED_USER_PRESETS.quickStartUser._id,
    email: SEED_USER_PRESETS.quickStartUser.email,
    password: hashedPassword,
    organization: organization,
    profile: profile,
  });

  const user = await userModel.create(userData);

  return user;
}

async function seedInvestigation(
  organization: IOrganization,
): Promise<IInvestigation> {
  const existingInvestigation = await investigationModel.getOneById(
    SEED_INVESTIGATION_PRESETS.quickStartInvestigation._id,
  );
  if (existingInvestigation) {
    console.log("[QuickStart] Investigation already exists, skipping seed.");
    return existingInvestigation;
  }

  const investigationData = createSeedInvestigation({
    ...SEED_INVESTIGATION_PRESETS.quickStartInvestigation,
    organization: organization,
  });

  const investigation = await investigationModel.create(investigationData);
  return investigation;
}

async function seedGithubInvestigationCheck(
  investigation: IInvestigation,
): Promise<IInvestigationCheck> {
  const existingGithubInvestigationCheck =
    await investigationCheckModel.getOneById(
      SEED_INVESTIGATION_CHECK_PRESETS.githubCheck._id,
    );
  if (existingGithubInvestigationCheck) {
    console.log(
      "[QuickStart] Github investigation check already exists, skipping seed.",
    );
    return existingGithubInvestigationCheck;
  }

  const githubCheckData = createSeedInvestigationCheck({
    ...SEED_INVESTIGATION_CHECK_PRESETS.githubCheck,
    investigation: investigation,
  });

  const githubInvestigationCheck =
    await investigationCheckModel.create(githubCheckData);
  return githubInvestigationCheck;
}

async function seedGrafanaInvestigationCheck(
  investigation: IInvestigation,
): Promise<IInvestigationCheck> {
  const existingGrafanaInvestigationCheck =
    await investigationCheckModel.getOneById(
      SEED_INVESTIGATION_CHECK_PRESETS.grafanaCheck._id,
    );
  if (existingGrafanaInvestigationCheck) {
    console.log(
      "[QuickStart] Grafana investigation check already exists, skipping seed.",
    );
    return existingGrafanaInvestigationCheck;
  }

  const grafanaCheckData = createSeedInvestigationCheck({
    ...SEED_INVESTIGATION_CHECK_PRESETS.grafanaCheck,
    investigation: investigation,
  });

  const grafanaInvestigationCheck =
    await investigationCheckModel.create(grafanaCheckData);
  return grafanaInvestigationCheck;
}
