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
  IDatadogLogsStats,
  IGrafanaLogsStats,
  IInvestigation,
  IInvestigationCheck,
  InvestigationCheckSource,
  ISentryStats,
} from "@/types/Investigtion";
import { ClockFastForward, LinkExternal01 } from "@untitledui/icons";
import { useParams } from "react-router-dom";
import { CorrelatedCodeChange } from "./CorrelatedCodeChange";
import { DatadogErrorFrequency } from "./DatadogErrorFrequency";
import { GrafanaErrorFrequency } from "./GrafanaErrorFrequency";
import { SentryErrorFrequency } from "./SentryErrorFrequency";
import { SentryStackTrace } from "./SentryStackTrace";

export function IntegrationDetailsEvidenceChain() {
  const { id } = useParams();
  const { data: investigation } = useInvestigation(id || "");

  const evidenceCards = getEvidenceCards(investigation);

  return (
    <div>
      <div className="flex flex-row gap-2 items-center">
        <ClockFastForward size={16} />
        {/* leading-0 is to optically match the alignment of the clock icon */}
        <Typography variant="sm/medium" className="text-primary leading-0">
          Evidence chain
        </Typography>
      </div>
      <div className="flex flex-col w-full mt-5">
        {evidenceCards.map((card, index) => (
          <div key={card.key} className="flex flex-row gap-3">
            {/*
              Timeline indicator: numbered circle with connecting lines.
              The circle is vertically centered with the accordion header
              (1px border + 10px trigger padding + 10px half-content = 21px,
              minus 12px circle center = ~8px offset). For the first item we
              use a plain 8px spacer; for subsequent items that 8px is split
              into a 6px line segment + 2px gap so the connector runs almost
              up to the circle without touching it.
            */}
            <div className="flex flex-col items-center">
              {index > 0 ? (
                <>
                  <div className="w-0.5 h-1.5 bg-border-secondary" />
                  <div className="h-0.5" />
                </>
              ) : (
                <div className="h-2" />
              )}
              <div className="w-6 h-6 rounded-full border border-secondary bg-primary flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-quaternary">
                  {index + 1}
                </span>
              </div>
              {index < evidenceCards.length - 1 && (
                <>
                  <div className="h-0.5" />
                  <div className="w-0.5 flex-1 bg-border-secondary" />
                </>
              )}
            </div>
            <div className="flex-1 pb-5 min-w-0">
              <EvidenceChainItemCard
                sourceName={card.sourceName}
                SourceLogo={card.SourceLogo}
                name={card.name}
              >
                {card.content}
              </EvidenceChainItemCard>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface EvidenceCardData {
  key: string;
  sourceName: string;
  SourceLogo: React.ComponentType<{
    className: string;
    style?: React.CSSProperties;
  }>;
  name: string;
  content: React.ReactNode;
}

function getEvidenceCards(investigation: IInvestigation): EvidenceCardData[] {
  const { checks } = investigation;
  const cards: EvidenceCardData[] = [];

  for (const check of checks) {
    if (check.source === InvestigationCheckSource.Sentry) {
      cards.push(...getSentryCards(check));
    }

    if (check.source === InvestigationCheckSource.Github) {
      const card = getGithubCard(check);
      if (card) cards.push(card);
    }

    if (check.source === InvestigationCheckSource.Grafana) {
      const card = getGrafanaCard(check);
      if (card) cards.push(card);
    }

    if (check.source === InvestigationCheckSource.Datadog) {
      const card = getDatadogCard(check);
      if (card) cards.push(card);
    }
  }

  return cards;
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

function getSentryCards(check: IInvestigationCheck): EvidenceCardData[] {
  const sourceName = "Sentry";
  const SourceLogo = icons[ConnectionName.Sentry];
  const { action } = check;
  const { issue, stats, issue_title, latest_event } = action ?? {};

  const viewInSentry = (
    <div className="flex justify-end mt-4">
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
  );

  return [
    {
      key: `${check._id}-error-frequency`,
      sourceName,
      SourceLogo,
      name: "Error frequency",
      content: (
        <>
          <SentryErrorFrequency stats={stats as ISentryStats} />
          {viewInSentry}
        </>
      ),
    },
    {
      key: `${check._id}-stack-trace`,
      sourceName,
      SourceLogo,
      name: "Stack trace",
      content: (
        <>
          <SentryStackTrace latestEvent={latest_event} title={issue_title} />
          {viewInSentry}
        </>
      ),
    },
  ];
}

function getGithubCard(check: IInvestigationCheck): EvidenceCardData | null {
  const sourceName = "GitHub";
  const SourceLogo = icons[ConnectionName.Github];
  const { action } = check;
  const { codeChangeSHAs } = action ?? {};

  if (!codeChangeSHAs?.length && !action?.diffs) {
    return null;
  }

  return {
    key: `${check._id}-code-change`,
    sourceName,
    SourceLogo,
    name: "Correlated code change",
    content: (
      <>
        <CorrelatedCodeChange
          codeChangesDescription={action?.codeChangesDescription ?? ""}
          diffs={action?.diffs ?? {}}
          codeChangeSHAs={codeChangeSHAs ?? []}
        />
      </>
    ),
  };
}

function getGrafanaCard(check: IInvestigationCheck): EvidenceCardData | null {
  const sourceName = "Grafana";
  const SourceLogo = icons[ConnectionName.Grafana];
  const { action } = check;
  const { stats } = action as { stats: IGrafanaLogsStats };

  if (!stats?.values.length) {
    return null;
  }

  return {
    key: `${check._id}-error-frequency`,
    sourceName,
    SourceLogo,
    name: "Error frequency",
    content: (
      <>
        <GrafanaErrorFrequency stats={stats} />
      </>
    ),
  };
}

function getDatadogCard(check: IInvestigationCheck): EvidenceCardData | null {
  const sourceName = "Datadog";
  const SourceLogo = icons[ConnectionName.DataDog];
  const { action } = check;
  const { stats } = action as { stats: IDatadogLogsStats[] };

  if (!stats?.length) {
    return null;
  }

  return {
    key: `${check._id}-error-frequency`,
    sourceName,
    SourceLogo,
    name: "Error frequency",
    content: (
      <>
        <DatadogErrorFrequency stats={stats} />
      </>
    ),
  };
}
