import mongoose from "mongoose";
import { IInvestigation } from "../types";

const Schema = mongoose.Schema;

export const InvestigationSchema = new Schema<IInvestigation>(
  {
    hypothesis: {
      type: String,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    pdIncidentId: {
      type: String,
    },
    pdDetails: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["init", "active", "resolved", "dismissed"],
      default: "active",
    },
    jsmDetails: {
      type: Schema.Types.Mixed,
      default: {},
    },
    secondaryInvestigationId: {
      type: String,
    },
  },
  { timestamps: true },
);