import { useInvestigation } from "@/api/queries/investigations";
import ContentContainerCard from "@/components/common/ContentContainerCard";
import Typography from "@/components/common/Typography";
import { InvestigationConfidenceLevel } from "@/types/Investigtion";
import { cx } from "@/utils/cx";
import { sanitizeMarkdownText } from "@/utils/strings";
import { CheckCircle, SearchRefraction, Stars02 } from "@untitledui/icons";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useParams } from "react-router-dom";
const CONFIDENCE_LEVEL_MAP = {
  [InvestigationConfidenceLevel.Low]: {
    text: "Low confidence",
    className: "text-warning-500",
  },
  [InvestigationConfidenceLevel.Medium]: {
    text: "Medium confidence",
    className: "text-warning-500",
  },
  [InvestigationConfidenceLevel.High]: {
    text: "High confidence",
    className: "text-success-500",
  },
};

export function InvestigationDetailsVerdict() {
  const { id } = useParams();
  const { data: investigation } = useInvestigation(id || "");

  const { hypothesis, rootCause, recommendedFix, confidenceLevel } =
    investigation;

  return (
    <div className="">
      <ContentContainerCard>
        <ContentContainerCard.Header>
          ASTER'S VERDICT
        </ContentContainerCard.Header>
        <ContentContainerCard.Content>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-3">
              <div className="flex items-center justify-center min-w-9 min-h-9 rounded-lg bg-brand-50">
                <SearchRefraction size={20} className="text-brand-600" />
              </div>
              <div className="flex flex-col gap-[1px]">
                <Typography variant="md/semibold" className="text-primary">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                  >{`Root cause: ${rootCause}`}</Markdown>
                </Typography>
                <Typography
                  variant="xs/normal"
                  className={cx(
                    "flex items-center",
                    CONFIDENCE_LEVEL_MAP[
                      confidenceLevel as keyof typeof CONFIDENCE_LEVEL_MAP
                    ].className,
                  )}
                >
                  <CheckCircle size={12} className="mr-1" />
                  {
                    CONFIDENCE_LEVEL_MAP[
                      confidenceLevel as keyof typeof CONFIDENCE_LEVEL_MAP
                    ].text
                  }
                </Typography>
              </div>
            </div>

            <div>
              <Typography
                variant="sm/normal"
                className="text-primary [&_p]:m-0 [&_a]:text-blue-600 [&_p]:break-words [&_a]:break-all [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:overflow-auto"
              >
                <Markdown remarkPlugins={[remarkGfm]}>
                  {sanitizeMarkdownText(hypothesis)}
                </Markdown>
              </Typography>
            </div>

            <div className="flex flex-row gap-2 bg-brand-50 rounded-lg p-4 border border-secondary">
              <div className="h-5 flex items-center justify-center">
                <Stars02 size={14} className="text-brand-600" />
              </div>
              <div>
                <Typography variant="sm/medium" className="text-brand-600">
                  Recommended fix:
                </Typography>
                <Typography variant="sm/medium" className="text-primary mt-1">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {recommendedFix}
                  </Markdown>
                </Typography>
              </div>
            </div>
          </div>
        </ContentContainerCard.Content>
      </ContentContainerCard>
    </div>
  );
}
