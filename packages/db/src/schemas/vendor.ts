import mongoose from "mongoose";
import { IVendor } from "../types";

const Schema = mongoose.Schema;

export const VendorSchema = new Schema<IVendor>(
  {
    name: String,
    displayName: String,
    description: String,
    order: Number,
  },
  { timestamps: true },
);
