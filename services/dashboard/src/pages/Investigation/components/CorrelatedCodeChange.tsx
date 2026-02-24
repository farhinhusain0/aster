import { Button } from "@/components/base/buttons/button";
import CodeBlock from "@/components/common/CodeBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/Accordion";
import Typography from "@/components/common/Typography";
import { ICodeChangeDiff, ICodeChangeDiffFile } from "@/types/Investigtion";
import { LinkExternal01 } from "@untitledui/icons";

interface MatchedDiffFile extends ICodeChangeDiffFile {
  repoName: string;
  sha: string;
}

export function CorrelatedCodeChange({
  codeChangesDescription,
  diffs,
  codeChangeSHAs,
}: {
  codeChangesDescription: string;
  diffs: Record<string, ICodeChangeDiff>;
  codeChangeSHAs: string[];
}) {
  const matchedDiffFiles: MatchedDiffFile[] = Object.entries(diffs)
    .flatMap(([diffKey, diffs]) =>
      diffs.commits.map((item) => ({
        ...item,
        files: item.files.map((file) => ({
          ...file,
          repoName: diffKey,
          sha: item.sha,
        })),
      })),
    )
    .filter((item) => codeChangeSHAs?.includes(item.sha) ?? false)
    .flatMap((item) => item.files);

  return (
    <>
      <Typography variant="md/normal" className="text-black">
        {codeChangesDescription}
      </Typography>
      <Accordion
        type="multiple"
        size="xs"
        className="mt-4"
        defaultValue={
          matchedDiffFiles.length > 0 ? [matchedDiffFiles[0].filename] : []
        }
      >
        {matchedDiffFiles.map((file) => (
          <AccordionItem key={file.filename} value={file.filename}>
            <AccordionTrigger>{file.filename}</AccordionTrigger>
            <AccordionContent>
              <CodeBlock language="diff">{file.patch as string}</CodeBlock>

              <div className="flex justify-end my-4 mr-4">
                <Button
                  color="link-gray"
                  size="sm"
                  iconTrailing={<LinkExternal01 size={20} />}
                  href={`https://github.com/${file.repoName}/commit/${file.sha}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View in GitHub
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
