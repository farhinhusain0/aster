import mongoose from "mongoose";
import { IOrganization } from "../types";

const Schema = mongoose.Schema;

export const OrganizationSchema = new Schema<IOrganization>(
  {
    name: String,
    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
    },
    domains: [{ type: String }],
    logo: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);
