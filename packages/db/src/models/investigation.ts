import mongoose from "mongoose";
import { InvestigationSchema } from "../schemas/investigation";
import { IInvestigation } from "../types";
import { BaseModel } from "./base";

export const Investigation = mongoose.model<IInvestigation>(
  "Investigation",
  InvestigationSchema,
);
export const investigationModel = new BaseModel(Investigation);
