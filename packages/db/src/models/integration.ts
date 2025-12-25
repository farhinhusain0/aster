import mongoose, { FilterQuery } from "mongoose";
import { IntegrationSchema } from "../schemas/integration";
import { IIntegration, IVendor } from "../types";
import { BaseModel } from "./base";
import { vendorModel } from "./vendor";

export const Integration = mongoose.model<IIntegration>(
  "Integration",
  IntegrationSchema,
);

class IntegrationModel extends BaseModel<IIntegration> {
  async getIntegrationByName(
    vendorName: string,
    query: FilterQuery<IIntegration>,
  ) {
    const vendor = (await vendorModel.getOne({
      name: vendorName,
    })) as IVendor;
    const integration = await integrationModel.getOne({
      vendor: vendor._id,
      ...query,
    });
    return integration;
  }

  async getOneForOrganizationByTypeAndVendor(
    type: IIntegration["type"],
    organizationId: string,
    vendorName: string,
  ) {
    const vendor = await vendorModel.getOne({ name: vendorName });
    if (!vendor) {
      return null;
    }

    return this.getOne({
      type,
      organization: organizationId,
      vendor: vendor._id,
    });
  }
}

export const integrationModel = new IntegrationModel(Integration);
