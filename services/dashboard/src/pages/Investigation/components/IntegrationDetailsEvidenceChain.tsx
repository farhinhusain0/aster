import { useInvestigation } from "@/api/queries/investigations";
import { Button } from "@/components/base/buttons/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/common/Accordion";
import Typography from "@/components/common/Typography";
import { icons } from "@/components/Connection/icons";
import { ConnectionName } from "@/types/Connections";
import {
  IInvestigationCheck,
  InvestigationCheckSource,
  ISentryIssue,
  ISentryStats,
} from "@/types/Investigtion";
import { ClockFastForward, LinkExternal01 } from "@untitledui/icons";
import { useParams } from "react-router-dom";
import { SentryErrorFrequency } from "./SentryErrorFrequency";
import { SentryStackTrace } from "./SentryStackTrace";

export function IntegrationDetailsEvidenceChain() {
  const { id } = useParams();
  const { data: investigation } = useInvestigation(id || "");

  const { checks } = investigation;

  return (
    <div>
      <div className="flex flex-row gap-2 items-center">
        <ClockFastForward size={16} />
        {/* leading-0 is to optically match the alignment of the clock icon */}
        <Typography variant="sm/medium" className="text-primary leading-0">
          Evidence chain
        </Typography>
      </div>
      <div className="flex flex-col gap-5 w-full mt-5">
        {checks.map((check: IInvestigationCheck) => (
          <EvidenceChainItem key={check._id} check={check} />
        ))}
      </div>
    </div>
  );
}

function EvidenceChainItem({ check }: { check: IInvestigationCheck }) {
  if (check.source === InvestigationCheckSource.Sentry) {
    return <SentryEvidenceChain check={check} />;
  }

  if (check.source === InvestigationCheckSource.Github) {
    return <GithubEvidenceChain check={check} />;
  }

  return null;
}

function EvidenceChainItemCard({
  sourceName,
  SourceLogo,
  name,
  children,
}: {
  sourceName: string;
  SourceLogo: React.ComponentType<{
    className: string;
    style?: React.CSSProperties;
  }>;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={`${sourceName}-${name}`}>
        <AccordionTrigger>
          <div className="flex flex-row gap-1.5 items-center text-xs font-semibold">
            <SourceLogo className="w-5 h-5 text-primary" />
            <span className="text-primary">
              <span className="text-quaternary">{sourceName}&nbsp;/&nbsp;</span>
              {name}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 py-4">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function SentryEvidenceChain({ check }: { check: IInvestigationCheck }) {
  const sourceName = "Sentry";
  const SourceLogo = icons[ConnectionName.Sentry];

  const { action } = check;
  const { issue, stats, issue_title, latest_event } = action ?? {};

  return (
    <>
      <EvidenceChainItemCard
        name="Error frequency"
        sourceName={sourceName}
        SourceLogo={SourceLogo}
      >
        <SentryErrorFrequency
          issue={issue as ISentryIssue}
          stats={stats as ISentryStats}
        />
        <div className="flex justify-end">
          <Button
            color="link-gray"
            size="sm"
            iconTrailing={<LinkExternal01 size={20} />}
            href={issue?.permalink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View in Sentry
          </Button>
        </div>
      </EvidenceChainItemCard>

      <EvidenceChainItemCard
        name="Stack trace"
        sourceName={sourceName}
        SourceLogo={SourceLogo}
      >
        <SentryStackTrace latestEvent={latest_event} title={issue_title} />
        <div className="flex justify-end">
          <Button
            color="link-gray"
            size="sm"
            iconTrailing={<LinkExternal01 size={20} />}
            href={issue?.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4"
          >
            View in Sentry
          </Button>
        </div>
      </EvidenceChainItemCard>
    </>
  );
}

function GithubEvidenceChain({ check }: { check: IInvestigationCheck }) {
  const sourceName = "GitHub";
  const SourceLogo = icons[ConnectionName.Github];

  return (
    <EvidenceChainItemCard
      name="Correlated code change"
      sourceName={sourceName}
      SourceLogo={SourceLogo}
    >
      sdf
    </EvidenceChainItemCard>
  );
}
