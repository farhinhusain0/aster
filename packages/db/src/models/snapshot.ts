import mongoose from "mongoose";
import { SnapshotSchema } from "../schemas/snapshot";
import { ISnapshot } from "../types";
import { BaseModel } from "./base";

export const Snapshot = mongoose.model<ISnapshot>("Snapshot", SnapshotSchema);
export const snapshotModel = new BaseModel(Snapshot);
