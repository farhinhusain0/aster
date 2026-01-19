import { IUser, IProfile, IOrganization } from "@aster/db";
import mongoose from "mongoose";

/**
 * Configuration for creating a seed user.
 * This interface allows flexibility in what can be configured
 * while the factory ensures all required IUser fields are present.
 */
export interface SeedUserConfig {
  _id?: mongoose.Types.ObjectId;
  email: string;
  password: string;
  organization: IOrganization;
  profile: IProfile;
  status?: "activated" | "invited";
  role?: "owner" | "member";
}

/**
 * Creates a type-safe user object for seeding.
 * 
 * The return type IUser ensures that ALL required fields from the IUser interface
 * are present. If the IUser schema changes to add new required fields, TypeScript
 * will error here, forcing us to update the seed data.
 * 
 * @param config - Configuration for the user seed data
 * @returns Complete IUser object ready for database insertion
 */
export function createSeedUser(config: SeedUserConfig): Omit<IUser, "createdAt" | "updatedAt"> {
  return {
    _id: config._id || new mongoose.Types.ObjectId(),
    email: config.email,
    password: config.password,
    status: config.status || "activated",
    role: config.role || "owner",
    organization: config.organization,
    profile: config.profile,
    passwordResetStatus: null,
    passwordResetRequestedAt: null,
    passwordResetCompletedAt: null,
  };
}

/**
 * Configuration for creating a seed profile.
 * This interface allows flexibility in what can be configured
 * while the factory ensures all required IProfile fields are present.
 */
export interface SeedProfileConfig {
  _id?: mongoose.Types.ObjectId;
  name: string;
}

/**
 * Creates a type-safe profile object for seeding.
 *
 * The return type ensures that ALL required fields from the IProfile interface
 * are present. If the IProfile schema changes to add new required fields, TypeScript
 * will error here, forcing us to update the seed data.
 *
 * @param config - Configuration for the profile seed data
 * @returns Complete IProfile object ready for database insertion
 */
export function createSeedProfile(config: SeedProfileConfig): Omit<IProfile, "createdAt" | "updatedAt"> {
  return {
    _id: config._id || new mongoose.Types.ObjectId(),
    name: config.name,
    picture: "",
  };
}

/**
 * Preset configurations for common test users.
 * These can be used across different seed files for consistency.
 */
export const SEED_USER_PRESETS = {
  quickStartUser: {
    _id: new mongoose.Types.ObjectId("000000000000000000000001"),
    email: "linus@aster.so",
    password: "@justForFun1991",
    profile: {
      _id: new mongoose.Types.ObjectId("000000000000000000000001"),
      name: "Linus Torvalds",
    }
  },
} as const;
