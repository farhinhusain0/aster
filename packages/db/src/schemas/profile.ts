import mongoose from "mongoose";
import { IProfile } from "../types";

const Schema = mongoose.Schema;

export const ProfileSchema = new Schema<IProfile>(
  {
    name: String,
    picture: String,
  },
  { timestamps: true },
);
