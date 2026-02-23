import { BadgeColors } from "@/components/base/badges/badge-types";
import { BadgeWithDot, BadgeWithIcon } from "@/components/base/badges/badges";
import {
  JSMDetails,
  ParsedFrame,
  PDDetails,
  SentryLatestEvent,
} from "@/types/Investigtion";
import { CheckCircle, Eye } from "@untitledui/icons";

export const JSMStatusTextMap = {
  open: "Open",
  closed: "Closed",
  acknowledged: "Acknowledged",
};

export const PDStatusTextMap = {
  triggered: "Triggered",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
};

export const StatusColorMap = {
  [JSMStatusTextMap.open]: "success",
  [JSMStatusTextMap.closed]: "success",
  [PDStatusTextMap.triggered]: "error",
  [PDStatusTextMap.acknowledged]: "blue",
  [PDStatusTextMap.resolved]: "success",
  fallback: "gray",
};
export const StatusIconMap = {
  [JSMStatusTextMap.closed]: CheckCircle,
  [PDStatusTextMap.acknowledged]: Eye,
  [PDStatusTextMap.resolved]: CheckCircle,
};
export const StatusBadgeComponentMap = {
  [PDStatusTextMap.triggered]: BadgeWithDot,
  [JSMStatusTextMap.open]: BadgeWithDot,
  [JSMStatusTextMap.closed]: BadgeWithIcon,
  [PDStatusTextMap.resolved]: BadgeWithIcon,
  [PDStatusTextMap.acknowledged]: BadgeWithIcon,
  fallback: BadgeWithDot,
};
export const PriorityColorMap: Record<string, BadgeColors> = {
  P1: "error",
  P2: "orange",
  P3: "warning",
  P4: "blue-light",
  P5: "gray",
};

export const getJSMStatusText = (details: JSMDetails) => {
  if (details.acknowledged && details.status === "open") {
    return JSMStatusTextMap.acknowledged;
  }

  if (details.status && details.status in JSMStatusTextMap) {
    return JSMStatusTextMap[details.status as keyof typeof JSMStatusTextMap];
  }

  return JSMStatusTextMap.open;
};

export const getPDStatusText = (details: PDDetails) => {
  if (details.status && details.status in PDStatusTextMap) {
    return PDStatusTextMap[details.status as keyof typeof PDStatusTextMap];
  }

  return PDStatusTextMap.triggered;
};

export const getStatusText = (
  jsmDetails: JSMDetails | null | undefined,
  pdDetails: PDDetails | null | undefined,
) => {
  if (jsmDetails) {
    return getJSMStatusText(jsmDetails);
  }

  if (pdDetails) {
    return getPDStatusText(pdDetails);
  }

  return "Active";
};

export const getPriorityText = (
  jsmDetails: JSMDetails | null | undefined,
  pdDetails: PDDetails | null | undefined,
) => {
  if (jsmDetails && Object.keys(jsmDetails).length > 0) {
    return jsmDetails.priority || "No priority";
  }
  if (pdDetails && Object.keys(pdDetails).length > 0) {
    return pdDetails.priority?.name || "No priority";
  }
  return "No priority";
};

export function extractInAppFrames(
  latestEvent: SentryLatestEvent,
): ParsedFrame[] {
  const exceptionEntry = latestEvent.entries?.find(
    (e) => e.type === "exception",
  );
  if (!exceptionEntry) return [];

  const frameMap = new Map<string, ParsedFrame>();
  const exceptions = exceptionEntry.data.values || [];

  for (const exception of exceptions) {
    if (!exception.stacktrace?.frames) continue;
    for (const frame of exception.stacktrace.frames) {
      if (!frame.inApp || !frame.context?.length) continue;

      const existing = frameMap.get(frame.filename);
      const existingLineCount = existing?.code.split("\n").length ?? 0;

      if (!existing || frame.context.length > existingLineCount) {
        const sorted = [...frame.context].sort((a, b) => a[0] - b[0]);
        frameMap.set(frame.filename, {
          filename: frame.filename,
          startLine: sorted[0][0],
          code: sorted.map(([, line]) => line).join("\n"),
          errorLine: frame.lineNo,
        });
      }
    }
  }

  // We want it in reversed because the last file is the main file in the trace
  return Array.from(frameMap.values()).reverse();
}
