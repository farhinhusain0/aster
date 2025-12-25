import { type RequestHandler } from "express";

export interface RouterOptions {
  getDBUser?: RequestHandler;
}
