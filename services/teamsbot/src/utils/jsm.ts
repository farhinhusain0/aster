export function getJSMURLFromText(text: string): string {
  // Regex to match URLs of the expected JSM format
  const regex = /https:\/\/j\.opsg\.in\/a\/worklifeteam\/[a-z0-9-]+-\d+/gi;
  const match = text.match(regex);
  return match ? match[0] : "";
}

export function getJSMIncidentIdFromURL(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1];
}