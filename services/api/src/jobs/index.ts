import { startPlanStateJobs, stopPlanStateJobs } from "../services/plans";
import { startTeamsJobs, stopTeamsJobs } from "../services/teams/jobs";

export function startAllJobs() {
  startPlanStateJobs();
  startTeamsJobs();
  console.log("[Jobs] All cron jobs started");
}

export function stopAllJobs() {
  stopPlanStateJobs();
  stopTeamsJobs();
  console.log("[Jobs] All cron jobs stopped");
}
