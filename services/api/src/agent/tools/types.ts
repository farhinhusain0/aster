import { IIntegration } from "@aster/db";
import { DynamicStructuredTool, DynamicTool } from "langchain";
import { RunContext } from "../types";

export type Tool = DynamicStructuredTool | DynamicTool;

export type ToolLoader<T extends IIntegration> = (
  integration: T,
  context: RunContext,
) => Promise<Tool>;
