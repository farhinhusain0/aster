import {
  userModel,
  profileModel,
  organizationModel,
  planStateModel,
  investigationModel,
  investigationCheckModel,
  integrationModel,
  authTokenModel,
} from "@aster/db";
import {
  SEED_ORG_PRESETS,
} from "./factories";

/**
 * Removes all quick-start seed data from the database.
 * This function is idempotent - it will not error if data has already been removed.
 *
 * Deletion order respects foreign key relationships:
 * - Integrations (references organization)
 * - Investigation and checks (references organization)
 * - User (references organization and profile)
 * - Plan state (references organization)
 * - Organization
 */
export async function removeQuickStartData(): Promise<void> {
  console.log(""); // Empty line for separation
  console.log("[QuickStart] Starting removal of quick-start seed data...");

  await removeIntegrations();
  await removeInvestigation();
  await removeUser();
  await removePlanState();
  await removeOrganization();

  console.log("[QuickStart] Successfully removed all quick-start seed data!");
}

async function removeIntegrations(): Promise<void> {
  try {
    const deleted = await integrationModel.delete({
      organization: SEED_ORG_PRESETS.quickStartOrg._id,
    });

    if (deleted) {
      console.log(
        `[QuickStart] Removed integrations for organization (ID: ${SEED_ORG_PRESETS.quickStartOrg._id})`,
      );
    } else {
      console.log(
        `[QuickStart] Integrations not found for organization (ID: ${SEED_ORG_PRESETS.quickStartOrg._id}), skipping`,
      );
    }
  } catch (error) {
    console.error(`[QuickStart] Error removing integrations:`, error);
  }
}

async function removeInvestigation(): Promise<void> {
  try {
    const investigations = await investigationModel.get({
      organization: SEED_ORG_PRESETS.quickStartOrg._id,
    });

    const investigationIds = investigations.map(
      (investigation) => investigation._id,
    );
    if (investigationIds.length > 0) {
      await investigationCheckModel.delete({
        investigation: { $in: investigationIds },
      });
    }

    const deleted = await investigationModel.delete({
      organization: SEED_ORG_PRESETS.quickStartOrg._id,
    });
    if (deleted) {
      console.log(
        `[QuickStart] Removed investigation for organization (ID: ${SEED_ORG_PRESETS.quickStartOrg._id})`,
      );
    }
  } catch (error) {
    console.error(`[QuickStart] Error removing investigation:`, error);
  }
}

async function removeUser(): Promise<void> {
  try {
    const users = await userModel.get({
      organization: SEED_ORG_PRESETS.quickStartOrg._id,
    });

    const userIds = users.map((user) => user._id);
    if (userIds.length > 0) {
      await authTokenModel.delete({
        user: { $in: userIds },
      });
      await profileModel.delete({
        user: { $in: userIds },
      });
    }

    const deleted = await userModel.delete({
      organization: SEED_ORG_PRESETS.quickStartOrg._id,
    });
    if (deleted) {
      console.log(
        `[QuickStart] Removed user for organization (ID: ${SEED_ORG_PRESETS.quickStartOrg._id})`,
      );
    } else {
      console.log(
        `[QuickStart] User not found for organization (ID: ${SEED_ORG_PRESETS.quickStartOrg._id}), skipping`,
      );
    }
  } catch (error) {
    console.error(`[QuickStart] Error removing user:`, error);
  }
}

async function removePlanState(): Promise<void> {
  try {
    const organizationId = SEED_ORG_PRESETS.quickStartOrg._id;
    const deleted = await planStateModel.delete({
      organization: organizationId,
    });
    if (deleted) {
      console.log(
        `[QuickStart] Removed plan state for organization (ID: ${organizationId})`,
      );
    } else {
      console.log(
        `[QuickStart] Plan state not found for organization (ID: ${organizationId}), skipping`,
      );
    }
  } catch (error) {
    console.error(`[QuickStart] Error removing plan state:`, error);
  }
}

async function removeOrganization(): Promise<void> {
  try {
    const organizationId = SEED_ORG_PRESETS.quickStartOrg._id;
    const deleted = await organizationModel.deleteOneById(organizationId);
    if (deleted) {
      console.log(`[QuickStart] Removed organization (ID: ${organizationId})`);
    } else {
      console.log(
        `[QuickStart] Organization not found (ID: ${organizationId}), skipping`,
      );
    }
  } catch (error) {
    console.error(`[QuickStart] Error removing organization:`, error);
  }
}
