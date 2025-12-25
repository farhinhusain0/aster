import mongoose from "mongoose";
import { BetaCodeSchema } from "../schemas/beta-code";
import { IBetaCode } from "../types";
import { BaseModel } from "./base";

export const BetaCode = mongoose.model<IBetaCode>("BetaCode", BetaCodeSchema);
export const betaCodeModel = new BaseModel(BetaCode);
