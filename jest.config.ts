/**
 * Root Jest Configuration
 *
 * This configuration finds and registers all Jest projects in the workspace.
 * It is the entry point for running tests across the monorepo.
 */
import { getJestProjectsAsync } from "@nx/jest";

export default async () => ({
  projects: await getJestProjectsAsync(),
});
