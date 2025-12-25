import mongoose from "mongoose";
import { ProfileSchema } from "../schemas/profile";
import { IProfile } from "../types";
import { BaseModel } from "./base";

export const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);
export const profileModel = new BaseModel(Profile);
