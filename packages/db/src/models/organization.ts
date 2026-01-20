import mongoose from "mongoose";
import { OrganizationSchema } from "../schemas/organization";
import { BaseModel } from "./base";
import { IOrganization } from "../types";

export const Organization = mongoose.model<IOrganization>(
  "Organization",
  OrganizationSchema,
);

export class OrganizationModel extends BaseModel<IOrganization> {
  async getOrCreate(data?: Partial<IOrganization>) {
    const existing = await this.model.findOne();
    if (existing) {
      return existing;
    }

    return this.model.create(data || {});
  }
}

export const organizationModel = new OrganizationModel(Organization);
