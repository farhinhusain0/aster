import mongoose from "mongoose";
import { IInvestigationCheck } from "../types";

const Schema = mongoose.Schema;

export const InvestigationCheckSchema = new Schema<IInvestigationCheck>(
  {
    investigation: {
      type: Schema.Types.ObjectId,
      ref: "Investigation",
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    action: {
      type: Schema.Types.Mixed,
      required: true,
    },
    result: {
      type: Schema.Types.Mixed,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    updatedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);
