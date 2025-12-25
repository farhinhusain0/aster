import mongoose from "mongoose";
import { WebhookSchema } from "../schemas/webhook";
import { IWebhook } from "../types";
import { BaseModel } from "./base";

export const Webhook = mongoose.model<IWebhook>("Webhook", WebhookSchema);
export const webhookModel = new BaseModel(Webhook);
