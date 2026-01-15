import mongoose from "mongoose";
import { AuthTokenSchema } from "../schemas";
import { IAuthToken } from "../types";
import { BaseModel } from "./base";

export const AuthToken = mongoose.model<IAuthToken>("AuthToken", AuthTokenSchema);
export const authTokenModel = new BaseModel(AuthToken);