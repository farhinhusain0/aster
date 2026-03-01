import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/Accordion";
import CodeBlock from "@/components/common/CodeBlock";
import Typography from "@/components/common/Typography";
import { SentryLatestEvent } from "@/types/Investigtion";
import { extractInAppFrames } from "@/utils/investigations";

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
              <CodeBlock
                startingLineNumber={frame.startLine}
                highlightLine={frame.errorLine}
              >
                {frame.code}
              </CodeBlock>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
