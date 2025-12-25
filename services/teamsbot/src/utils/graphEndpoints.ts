export function getMessageEndpoint(
  teamId: string,
  channelId: string,
  messageId: string,
): string {
  return `/teams/${teamId}/channels/${channelId}/messages/${messageId}`;
}

export function getMessageRepliesEndpoint(
  teamId: string,
  channelId: string,
  messageId: string,
): string {
  return `/teams/${teamId}/channels/${channelId}/messages/${messageId}/replies`;
}
