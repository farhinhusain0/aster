import Typography from "@/components/common/Typography";
import { SentryLatestEvent } from "@/types/Investigtion";
import { extractInAppFrames } from "@/utils/investigations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { ChevronDown, LinkExternal01 } from "@untitledui/icons";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/hljs";

export function SentryStackTrace({
  latestEvent,
  viewUrl,
  title,
}: {
  latestEvent?: object;
  viewUrl?: string;
  title?: string;
}) {
  const event = latestEvent as SentryLatestEvent | undefined;
  if (!event?.entries) return null;

  const frames = extractInAppFrames(event);
  if (frames.length === 0) return null;

  return (
    <>
      <Typography variant="sm/normal" className="text-primary">
        {title}
      </Typography>
      <div className="rounded-lg border border-secondary overflow-hidden">
        <Accordion
          type="multiple"
          defaultValue={frames.length > 0 ? [frames[0].filename] : []}
        >
          {frames.map((frame) => (
            <AccordionItem
              key={frame.filename}
              value={frame.filename}
              className="border-b border-secondary last:border-b-0"
            >
              <AccordionTrigger className="group flex items-center justify-between w-full px-4 py-2.5 cursor-pointer bg-secondary">
                <span className="text-sm font-medium text-secondary font-mono">
                  {frame.filename}
                </span>
                <ChevronDown
                  className="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180 text-quaternary"
                  size={20}
                />
              </AccordionTrigger>
              <AccordionContent className="overflow-hidden">
                <SyntaxHighlighter
                  language="javascript"
                  style={vs}
                  showLineNumbers
                  startingLineNumber={frame.startLine}
                  wrapLines
                  lineProps={(lineNumber: number) => {
                    const style: Record<string, string> = {
                      display: "block",
                    };
                    if (frame.errorLine === lineNumber) {
                      style.backgroundColor = "rgba(239, 68, 68, 0.15)";
                      style.borderLeft = "3px solid #ef4444";
                      style.paddingLeft = "4px";
                    }
                    return { style };
                  }}
                  customStyle={{
                    margin: 0,
                    padding: "12px 0",
                    fontSize: "0.8125rem",
                    lineHeight: 1.6,
                    background: "transparent",
                  }}
                  lineNumberStyle={{
                    minWidth: "3em",
                    paddingRight: "1em",
                    color: "#9ca3af",
                  }}
                >
                  {frame.code}
                </SyntaxHighlighter>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {viewUrl && (
        <div className="flex justify-end">
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-tertiary hover:text-secondary flex items-center gap-1.5 transition-colors"
          >
            View in Sentry
            <LinkExternal01 size={14} />
          </a>
        </div>
      )}
    </>
  );
}
