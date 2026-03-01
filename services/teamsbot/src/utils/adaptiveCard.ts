export interface AdaptiveCardElement {
  type: string;
  [key: string]: any;
}

/**
 * Converts markdown text to Adaptive Card elements
 */
export function convertMarkdownToAdaptiveCard(
  text: string,
): AdaptiveCardElement[] {
  const elements: AdaptiveCardElement[] = [];

  // Split text by code blocks FIRST (before any other processing)
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block (with backtick conversion)
    const beforeText = text.slice(lastIndex, match.index);
    if (beforeText.trim()) {
      // Convert `text` to **text** only in non-code-block text
      const convertedText = beforeText.replace(/`([^`]+)`/g, "**$1**");
      elements.push(...parseRegularText(convertedText));
    }

    // Add code block (unchanged)
    const code = match[2];
    elements.push(createCodeBlock(code));

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last code block (with backtick conversion)
  const remainingText = text.slice(lastIndex);
  if (remainingText.trim()) {
    // Convert `text` to **text** only in non-code-block text
    const convertedText = remainingText.replace(/`([^`]+)`/g, "**$1**");
    elements.push(...parseRegularText(convertedText));
  }

  return elements;
}

/**
 * Parse regular text into simple TextBlocks
 */
function parseRegularText(text: string): AdaptiveCardElement[] {
  const elements: AdaptiveCardElement[] = [];

  // Split by paragraphs (double line breaks)
  const paragraphs = text.split("\n\n").filter((p) => p.trim());

  paragraphs.forEach((paragraph, index) => {
    const textBlock: AdaptiveCardElement = {
      type: "TextBlock",
      text: paragraph.trim(),
      wrap: true,
    };

    if (index > 0) {
      textBlock.spacing = "Medium";
    }

    elements.push(textBlock);
  });

  return elements;
}

/**
 * Create a code block element with proper formatting
 */
function createCodeBlock(code: string): AdaptiveCardElement {
  return {
    type: "CodeBlock",
    codeSnippet: code,
  };
}

/**
 * Create an investigation card with proper markdown support
 */
export function createInvestigationCardWithMarkdown({
  hypothesis,
  investigationId,
}: {
  hypothesis: string;
  investigationId: string;
}) {
  const viewInAsterUrl = `${process.env.DASHBOARD_APP_URL}/investigations/${investigationId}`;

  const bodyElements = convertMarkdownToAdaptiveCard(hypothesis);

  // Add action buttons and footer
  bodyElements.push(
    {
      type: "ActionSet",
      separator: true,
      spacing: "Large",
      actions: [
        {
          type: "Action.OpenUrl",
          title: "View in Aster",
          url: viewInAsterUrl,
          style: "positive",
          id: "view-in-aster",
          tooltip: "View in Aster",
        },
      ],
    },
    {
      type: "TextBlock",
      text: "Use @Aster to ask follow-up questions",
      wrap: true,
      style: "default",
      fontType: "Default",
      size: "Small",
      color: "Attention",
      spacing: "Medium",
    },
  );

  return {
    type: "AdaptiveCard",
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    version: "1.5",
    body: bodyElements,
  };
}

export function getIncidentIdFromJSMTitle(title: string): string {
  // Try to extract the incident id from a URL in the title
  // Example: [Alert #159: [Datadog] [P2] [Triggered] Failed to parse URL from undefined](https://j.opsg.in/a/worklifeteam/225fee0d-ea15-4716-963a-c98d93efe94a-1759912753184)
  const urlMatch = title.match(/\((https?:\/\/[^\s)]+)\)/);
  if (urlMatch) {
    const url = urlMatch[1];
    // Extract the last path segment as the incident id
    const parts = url.split("/");
    const incidentId = parts[parts.length - 1];
    if (incidentId && incidentId.length > 10) {
      return incidentId;
    }
  }

  throw new Error("Incident ID not found in title");
}

export function getIncidentIdFromPagerDutyTitle(title: string): string {
  // Try to extract the incident id from a PagerDuty incident URL in the title
  // Example: Datadog P2 Triggered Failed to parse URL from undefined(https://worklifeteam.pagerduty.com/incidents/Q28MRTGY0MQ3R7?utm_campaign=channel&utm_source=msteams)
  const urlMatch = title.match(/\((https?:\/\/[^\s)]+)\)/);
  if (urlMatch) {
    const url = urlMatch[1];
    // Extract the last path segment as the incident id
    const parts = url.split("/");
    const incidentId = parts[parts.length - 1].split("?")[0];
    if (incidentId && incidentId.length > 5) {
      return incidentId;
    }
  }
  throw new Error("Incident ID not found in PagerDuty title");
}
