import { default as branchCodeChangeHistoryFetcher } from "./branch_code_change_history_fetcher";
import { default as fileCodeChangesHistoryFetcher } from "./file_code_changes_history_fetcher";

export const toolLoaders = [branchCodeChangeHistoryFetcher, fileCodeChangesHistoryFetcher];
