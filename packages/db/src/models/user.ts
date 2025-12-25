import mongoose from "mongoose";
import { UserSchema } from "../schemas/user";
import { IUser } from "../types";
import { BaseModel } from "./base";

export const User = mongoose.model<IUser>("User", UserSchema);
export const userModel = new BaseModel(User);
