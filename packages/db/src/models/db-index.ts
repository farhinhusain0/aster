import mongoose from "mongoose";
import { IndexSchema } from "../schemas/db-index";
import { IIndex } from "../types";
import { BaseModel } from "./base";

export const Index = mongoose.model<IIndex>("Index", IndexSchema, "index");
export const indexModel = new BaseModel(Index);
