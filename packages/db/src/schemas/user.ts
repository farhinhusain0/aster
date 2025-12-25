import mongoose from "mongoose";
import { IUser, PasswordResetStatus } from "../types";

const Schema = mongoose.Schema;

export const UserSchema = new Schema<IUser>(
  {
    email: String,
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
    },
    status: { type: String, enum: ["activated", "invited"] },
    role: { type: String, enum: ["owner", "member"] },
    password: String,
    profile: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    passwordResetStatus: {
      type: String,
      enum: Object.values(PasswordResetStatus),
      default: null,
    },
    passwordResetRequestedAt: { type: Date, default: null },
    passwordResetCompletedAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true } },
);
