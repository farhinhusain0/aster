export function capitalize(text: string) {
  return `${text[0].toUpperCase()}${text.slice(1)}`;
}

export function format(
  template: string,
  ...params: (string | number | boolean)[]
) {
  const result = params.reduce<string>(
    (total, current) => total.replace("%s", String(current)),
    template,
  );
  return result;
}

export function sanitizeMarkdownText(text: string) {
  return (
    text
      // Remove all slack emoji colons
      .replace(/ :[a-zA-Z0-9_]+:/g, "")
      // Remove zero-width spaces
      .replace(/\u200B/g, "")
      // Replace escaped newlines with real newlines
      // Replace escaped `\\n` with a real newline
      .replace(/\\\n/g, "\n\n")
      // Ensure double newlines where necessary for markdown paragraphs
      .replace(/\n\n/g, "\n\n")
      // Fix bullet points (ensure a space after `•` or `-`)
      .replace(/(?:^|\n)\s*•\s*/g, "\n- ") // Converts `•` to `-` with proper spacing
      // Fix bold/italic markers around text (ensure proper placement of `*`)
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "**$1**") // Converts `*text*` to `**text**`
      // Fix Slack-style links (<https://example.com|text>)
      .replace(/<(https?:\/\/\S+)\|([^>]+)>/g, "[$2]($1)")
      // Remove unnecessary trailing backslashes
      .replace(/\\$/gm, "")
      // Trim leading/trailing whitespace
      .trim()
  );
}
