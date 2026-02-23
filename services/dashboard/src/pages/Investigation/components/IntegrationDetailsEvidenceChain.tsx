import { useInvestigation } from "@/api/queries/investigations";
import ContentContainerCard from "@/components/common/ContentContainerCard";
import Typography from "@/components/common/Typography";
import { icons } from "@/components/Connection/icons";
import { ConnectionName } from "@/types/Connections";
import {
  IInvestigationCheck,
  InvestigationCheckSource,
  ISentryIssue,
  ISentryStats,
} from "@/types/Investigtion";
import { ClockFastForward } from "@untitledui/icons";
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
    <ContentContainerCard>
      <ContentContainerCard.Header>
        <div className="flex flex-row gap-1.5 items-center">
          <SourceLogo className="w-4 h-4 text-primary" />
          <span className="text-primary">
            <span className="text-quaternary">{sourceName}&nbsp;/&nbsp;</span>
            {name}
          </span>
        </div>
      </ContentContainerCard.Header>
      <ContentContainerCard.Content>{children}</ContentContainerCard.Content>
    </ContentContainerCard>
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
      </EvidenceChainItemCard>

      <EvidenceChainItemCard
        name="Stack trace"
        sourceName={sourceName}
        SourceLogo={SourceLogo}
      >
        <SentryStackTrace
          latestEvent={latest_event}
          viewUrl={action?.url}
          title={issue_title}
        />
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
