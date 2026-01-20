import mongoose from "mongoose";
import { IAuthToken } from "../types";

const Schema = mongoose.Schema;

export const AuthTokenSchema = new Schema<IAuthToken>(
  {
    token: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);