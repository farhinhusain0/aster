import mongoose from "mongoose";
import { OrganizationSchema } from "../schemas/organization";
import { BaseModel } from "./base";
import { IOrganization } from "../types";

export const Organization = mongoose.model<IOrganization>(
  "Organization",
  OrganizationSchema,
);

export const organizationModel = new BaseModel(Organization);
