import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/Accordion";
import Typography from "@/components/common/Typography";
import { SentryLatestEvent } from "@/types/Investigtion";
import { extractInAppFrames } from "@/utils/investigations";
import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist as ideStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";

export function SentryStackTrace({
  latestEvent,
  title,
}: {
  latestEvent?: object;
  title?: string;
}) {
  const event = latestEvent as SentryLatestEvent | undefined;
  if (!event?.entries) return null;

  const frames = extractInAppFrames(event);
  if (frames.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="md/normal" className="text-black">
        {title}
      </Typography>

      <Accordion
        size="xs"
        type="multiple"
        defaultValue={frames.length > 0 ? [frames[0].filename] : []}
      >
        {frames.map((frame) => (
          <AccordionItem key={frame.filename} value={frame.filename}>
            <AccordionTrigger>{frame.filename}</AccordionTrigger>
            <AccordionContent>
              <SyntaxHighlighter
                language="javascript"
                style={ideStyle}
                showLineNumbers
                startingLineNumber={frame.startLine}
                wrapLines
                lineProps={(lineNumber: number) => {
                  const style: Record<string, string> = {
                    display: "block",
                    fontSize: "12px",
                    lineHeight: "18px",
                  };
                  if (frame.errorLine === lineNumber) {
                    style.backgroundColor = "var(--color-gray-100)";
                  }
                  return { style };
                }}
              >
                {frame.code}
              </SyntaxHighlighter>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
