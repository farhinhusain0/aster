export const buildOutput = (text: string, sources?: string[]): string => {
  return text;
};

export const buildDatadogLogsUrl = (query: string): string => {
  const now = Date.now();
  const yesterday = now - 24 * 60 * 60 * 1000;

  const params = new URLSearchParams({
    query,
    from_ts: yesterday.toString(),
    to_ts: now.toString()
  });

  return `https://app.datadoghq.com/logs?${params.toString()}`;
}