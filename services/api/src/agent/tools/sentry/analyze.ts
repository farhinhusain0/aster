import { SentryClient } from "../../../clients/sentry";
import type { SentryIntegration } from "@aster/db";
import { investigationModel, investigationCheckModel } from "@aster/db";
import type { RunContext } from "../../types";
import { DynamicStructuredTool } from "langchain";
import { z } from "zod";
import { calculateLCSLength } from "../../../utils/strings";
// import { checksSummaryPrompt, dataExplanationPrompt } from "../../prompts";
// import { chatModel } from "../../model";

const SIMILARITY_THRESHOLD = 0.5;

/**
 * Finds the best Sentry issue match for a given notification header.
 * Accepts any array of objects with a title and id property.
 */
function findBestSentryMatch<T extends { title: string; id: string }>(
  header: string,
  issues: Array<T>,
): T | null {
  console.log("#### Inside findBestSentryMatch finding best Sentry match ####");
  console.log(`#### Total issues to compare: ${issues.length} ####`);
  console.log(`#### Header to match: "${header}" ####`);
  if (!header || !issues || issues.length === 0) {
    console.log("#### No header or issues provided ####");
    return null;
  }

  const normalizedHeader = header.toLowerCase().trim();

  console.log(`#### Finding best match for: "${header}" ####`);

  // --- STEP 1: The Fast Path (Exact Substring Match) ---
  const potentialMatches = issues.filter((issue) =>
    normalizedHeader.includes(issue.title.toLowerCase().trim()),
  );

  if (potentialMatches.length > 0) {
    // If multiple issues are a substring, the longest title is the most specific match.
    console.log(
      `#### Found ${potentialMatches.length} potential substring matches. ####`,
    );
    return potentialMatches.reduce((longest, current) =>
      current.title.length > longest.title.length ? current : longest,
    );
  }

  console.log(
    "#### No substring match found. Falling back to similarity scoring. ####",
  );

  // --- STEP 2: The Fallback Path (LCS Similarity for Truncated Headers) ---

  let bestMatchByScore: { issue: T; score: number } | null = null;

  for (const issue of issues) {
    const normalizedTitle = issue.title.toLowerCase().trim();
    if (normalizedTitle.length === 0) continue;

    const lcsLength = calculateLCSLength(normalizedHeader, normalizedTitle);
    const score = lcsLength / normalizedTitle.length;

    if (score > (bestMatchByScore?.score ?? 0)) {
      bestMatchByScore = { issue, score };
    }
  }

  console.log(
    `#### Best similarity score: ${bestMatchByScore?.score.toFixed(3)} ####`,
  );

  if (bestMatchByScore && bestMatchByScore.score >= SIMILARITY_THRESHOLD) {
    return bestMatchByScore.issue;
  }

  return null;
}

const TOOL_DESCRIPTION = `This tool provides relevant Sentry issues and events data to help in root cause hypotheses generation and user impact assessment. 
To use this tool, provide the title of the Sentry issue you want to analyze. The tool will return detailed information about the issue and recent events associated with it.`;

/**
 * Sentry analysis tool: generates root cause hypotheses, user impact, and supports follow-up Q&A.
 */
export default async function (
  integration: SentryIntegration,
  context: RunContext,
) {
  const investigation = await investigationModel.getOneById(
    context.investigationId as string,
  );

  // Initialize Sentry client
  const { personalToken } = integration.credentials;
  const { organizationId } = integration.settings;
  const sentry = new SentryClient(personalToken, organizationId);

  return new DynamicStructuredTool({
    name: "sentry_analyze",
    description: TOOL_DESCRIPTION,
    func: async ({ issue_title }: { issue_title: string }) => {
      console.log("#### provided issue title: ", issue_title);

      // Fetch issue and events
      const issues = await sentry.getIssues({
        project: integration.settings.projectIds,
      });

      console.log(`#### Fetched ${issues.length} issues from Sentry ####`);
      for (const issue of issues) {
        console.log(`- Issue: ${issue.title}`);
      }

      const issue = findBestSentryMatch(issue_title, issues);
      if (issue == null) {
        return "No matching Sentry issue found";
      }
      const issue_id = issue.id;
      const events = await sentry.getIssueEvents(issue_id);

      // Investigation check logic (update or create) with LLM summary
      if (context.shouldGenerateChecks && investigation) {
        const investigationCheck = await investigationCheckModel.getOne({
          investigation: investigation,
          source: "sentry",
        });

        const latest_event_id = events[0].id;
        const latest_event = await sentry.getIssueEvent(
          issue_id,
          latest_event_id,
        );
        const stats = await sentry.getIssueEventsTimeseries({
          issueId: issue_id,
        });

        const action = {
          request: `Analyze Sentry issue: ${issue_title}`,
          issue_title: issue.title,
          issue,
          latest_event,
          stats,
        };

        // Use LLM to generate summary and explanation
        let summary = `Sentry issue '${issue.title}' was analyzed for root cause and user impact.`;
        let explanation = `Fetched total of ${events.length} events for the issue.`;

        // try {
        //   const queryExplanationPrompt = await dataExplanationPrompt.format({
        //     toolDescription: TOOL_DESCRIPTION,
        //     data: `Sentry Issue:\n${JSON.stringify(issue, null, 2)}\n\nRecent Events:\n${JSON.stringify(events.slice(0, 3), null, 2)}`,
        //     query: action.request,
        //     context: issue.title,
        //   });

        //   const explanationAiResponse = await chatModel.invoke(
        //     queryExplanationPrompt,
        //     { callbacks: [] },
        //   );

        //   const checkSummaryPrompt = await checksSummaryPrompt.format({
        //     toolDescription: TOOL_DESCRIPTION,
        //     query: action.request,
        //     result: explanationAiResponse.content.toString(),
        //     context: issue.title,
        //   });

        //   const summaryAiResponse = await chatModel.invoke(checkSummaryPrompt, {
        //     callbacks: [],
        //   });

        //   summary = summaryAiResponse.content.toString();
        //   explanation = explanationAiResponse.content.toString();
        // } catch (err) {
        //   console.error("LLM summary failed, falling back to default.", err);
        // }

        const result = { summary, explanation };

        if (investigationCheck) {
          investigationCheck.action = action;
          investigationCheck.result = result;
          investigationCheck.updatedAt = new Date();
          await investigationCheck.save();
        } else {
          await investigationCheckModel.create({
            investigation: investigation,
            source: "sentry",
            action,
            result,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      const issueString = JSON.stringify(issue, null, 2);
      return `Sentry Issue: \n${issueString}\n\nRecent Events: \n${JSON.stringify(events.slice(0, 3), null, 2)}`;
    },
    schema: z.object({
      issue_title: z.string().describe("Title of the issue to analyze"),
    }),
  });
}
