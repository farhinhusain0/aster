import mongoose from "mongoose";
import { InvestigationCheckSchema } from "../schemas/investigationCheck";
import { IInvestigationCheck } from "../types";
import { BaseModel } from "./base";

export const InvestigationCheck = mongoose.model<IInvestigationCheck>(
  "InvestigationCheck",
  InvestigationCheckSchema,
);
export const investigationCheckModel = new BaseModel(InvestigationCheck);
