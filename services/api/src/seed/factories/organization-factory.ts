import { IOrganization, IPlan } from "@aster/db";
import mongoose from "mongoose";

/**
 * Configuration for creating a seed organization.
 * This interface allows flexibility in what can be configured
 * while the factory ensures all required IOrganization fields are present.
 */
export interface SeedOrganizationConfig {
  _id: mongoose.Types.ObjectId;
  name: string;
  plan: IPlan | mongoose.Types.ObjectId;
  domains: string[];
}

/**
 * Creates a type-safe organization object for seeding.
 * 
 * The return type ensures that ALL required fields from the IOrganization interface
 * are present. If the IOrganization schema changes to add new required fields, TypeScript
 * will error here, forcing us to update the seed data.
 * 
 * @param config - Configuration for the organization seed data
 * @returns Complete IOrganization object ready for database insertion
 */
export function createSeedOrganization(config: SeedOrganizationConfig): Omit<IOrganization, "createdAt" | "updatedAt"> {
  return {
    _id: config._id,
    name: config.name,
    plan: config.plan,
    domains: config.domains,
    logo: "",
  };
}

/**
 * Preset configurations for common test organizations.
 * These can be used across different seed files for consistency.
 */
export const SEED_ORG_PRESETS = {
  quickStartOrg: {
    _id: new mongoose.Types.ObjectId("000000000000000000000001"),
    name: "Aster",
    domains: ["aster.so"],
  },
};
