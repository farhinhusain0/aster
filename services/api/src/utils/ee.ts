export function isLangfuseEnabled() {
  return (
    !!process.env.LANGFUSE_SECRET_KEY &&
    !!process.env.LANGFUSE_PUBLIC_KEY &&
    !!process.env.LANGFUSE_HOST
  );
}

export function isSMTPEnabled() {
  return !!process.env.SMTP_CONNECTION_URL;
}
