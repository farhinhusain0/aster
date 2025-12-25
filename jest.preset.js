/**
 * Shared Jest Preset
 *
 * This file contains the base Jest configuration used by all projects in the workspace.
 * It extends the default Nx Jest preset.
 */
const nxPreset = require("@nx/jest/preset").default;

module.exports = { ...nxPreset };
