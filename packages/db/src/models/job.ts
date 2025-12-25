import mongoose from "mongoose";
import { JobSchema } from "../schemas/job";
import { IJob } from "../types";
import { BaseModel } from "./base";

export const Job = mongoose.model<IJob>("Job", JobSchema);
export const jobModel = new BaseModel(Job);
