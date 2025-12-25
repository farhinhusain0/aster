import mongoose from "mongoose";
import { PlanFieldSchema } from "../schemas/planField";
import { IPlanField } from "../types";
import { BaseModel } from "./base";

export const PlanField = mongoose.model<IPlanField>(
  "PlanField",
  PlanFieldSchema,
  "plan_fields",
);
export const planFieldModel = new BaseModel(PlanField);
