import { Link, useParams } from "react-router-dom";
import { useInvestigation } from "@/api/queries/investigations";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sanitizeMarkdownText } from "@/utils/strings";
import GrafanaLogo from "@/assets/logo-grafana.png";
import DatadogLogo from "@/assets/logo-datadog.png";
import SentryLogo from "@/assets/logo-sentry.svg";
import { FaGithub } from "react-icons/fa";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { format, formatDistanceToNowStrict } from "date-fns";
import { Badge, BadgeWithIcon } from "@/components/base/badges/badges";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { BadgeColors } from "@/components/base/badges/badge-types";
import Divider from "@/components/common/Divider";
import Typography from "@/components/common/Typography";
import { cx } from "@/utils/cx";
import {
  ArrowRight,
  ChevronDown,
  LinkExternal01,
  AlertCircle,
} from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import {
  getStatusText,
  StatusColorMap,
  StatusBadgeComponentMap,
  StatusIconMap,
  getPriorityText,
  PriorityColorMap,
} from "@/utils/investigations";
import PagerDutyLogo from "@/assets/logo-pagerduty.png";
import JiraLogo from "@/assets/logo-jira-service-management.png";

interface File {
  filename: string;
  url: string;
  text?: string;
}

interface Check {
  _id: string;
  source: string;
  result: {
    summary: string;
    explanation?: string;
  };
  action?: {
    query?: string;
    url?: string;
    files?: Array<File>;
  };
}

function StatusBadge({ statusText }: { statusText: string }) {
  const StatusBadgeComponent =
    StatusBadgeComponentMap[
      statusText as keyof typeof StatusBadgeComponentMap
    ] || StatusBadgeComponentMap.fallback;
  const statusColor =
    StatusColorMap[statusText as keyof typeof StatusColorMap] ||
    StatusColorMap.fallback;
  const statusIcon =
    StatusIconMap[statusText as keyof typeof StatusIconMap] || undefined;

  return (
    <StatusBadgeComponent
      type="pill-color"
      size="md"
      color={statusColor as BadgeColors}
      iconLeading={statusIcon}
    >
      {statusText}
    </StatusBadgeComponent>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const hasPriorityColor = priority in PriorityColorMap;
  const priorityColor = hasPriorityColor
    ? (PriorityColorMap[
        priority as keyof typeof PriorityColorMap
      ] as BadgeColors)
    : undefined;

  const commonProps = {
    type: "modern" as const,
    size: "md" as const,
    className: "font-medium text-primary",
  };

  if (hasPriorityColor && priorityColor) {
    return (
      <BadgeWithIcon
        {...commonProps}
        iconLeading={AlertCircle}
        color={priorityColor}
      >
        {priority}
      </BadgeWithIcon>
    );
  }

  return (
    <Badge {...commonProps} color="gray">
      {priority}
    </Badge>
  );
}

function InvestigationDetailsLeftPanel() {
  const { id, checkId } = useParams();
  const { data: investigation } = useInvestigation(id || "");

  const { pdDetails, jsmDetails, hypothesis, updatedAt, checks } =
    investigation;
  const relativeTime = updatedAt
    ? formatDistanceToNowStrict(new Date(updatedAt), { addSuffix: true })
    : "";
  const exactTime = updatedAt
    ? format(new Date(updatedAt), "MMM dd, yyyy, h:mm:ss a")
    : "";
  const title = pdDetails?.title || jsmDetails?.message;
  const statusText = getStatusText(jsmDetails, pdDetails);
  const priority = getPriorityText(jsmDetails, pdDetails);
  const source = pdDetails ? "PagerDuty" : "JSM ";
  const isPagerDuty = !!pdDetails;
  const sourceLogo = isPagerDuty ? PagerDutyLogo : JiraLogo;
  const incidentExternalLink = isPagerDuty
    ? pdDetails?.html_url
    : jsmDetails?.asterAdded?.htmlUrl;

  return (
    <div>
      <Typography variant="xl/semibold" className="text-primary mb-5">
        {title}
      </Typography>

      <div className="flex-1 rounded-2xl border border-gray-200 p-4 mb-5">
        <div className="flex items-center gap-2">
          <Typography variant="sm/medium" className="text-primary">
            Source:
          </Typography>

          <a
            className="text-sm text-link inline-flex gap-2 items-center"
            href={incidentExternalLink}
            target="_blank"
          >
            <img
              src={sourceLogo}
              alt={source}
              className="w-5 h-5 rounded-md object-contain"
            />
            <div className="flex items-center gap-2">
              {/* leading-[19px] is to optically match the alignment of the source logo */}
              <Typography variant="sm/medium" className="text-primary leading-[19px]">
                {source}
              </Typography>
              <LinkExternal01 size={14} className="mt-0.5" />
            </div>
          </a>
        </div>

        <Divider className="mt-3 mb-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 ">
            <Typography variant="sm/medium" className="text-primary">
              Last updated:{" "}
              <span className="decoration-dotted underline underline-offset-4 decoration-gray-400 font-medium text-primary inline-flex items-center gap-1 whitespace-nowrap ml-1">
                <Tooltip title={exactTime}>
                  <TooltipTrigger className="group relative inline-flex cursor-pointer items-center gap-1">
                    {relativeTime}
                  </TooltipTrigger>
                </Tooltip>
              </span>
            </Typography>
          </div>

          <div className="flex items-center gap-2 ">
            <Typography variant="sm/medium" className="text-primary">
              Status:
            </Typography>
            <StatusBadge statusText={statusText} />
          </div>

          <div className="flex items-center gap-2 ">
            <Typography variant="sm/medium" className="text-primary">
              Priority:
            </Typography>
            <PriorityBadge priority={priority} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-col justify-start items-start mb-5">
        <Typography variant="md/semibold" className="text-primary">
          Hypothesis
        </Typography>

        <Typography
          variant="md/normal"
          className="[&_p]:m-0 [&_a]:text-blue-600 [&_p]:break-words [&_a]:break-all [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:overflow-auto"
        >
          <Markdown remarkPlugins={[remarkGfm]}>
            {sanitizeMarkdownText(hypothesis)}
          </Markdown>
        </Typography>
      </div>

      {checks.length > 0 && (
        <div className="flex gap-3 flex-col justify-start items-start">
          <Typography variant="md/semibold" className="text-primary">
            Checks
          </Typography>
          {checks.length > 0 && (
            <div className="flex gap-3 flex-col justify-start items-start w-full">
              {checks.map((check: Check) => (
                <Link
                  className="w-full"
                  key={check._id}
                  to={
                    checkId === check._id
                      ? `/investigations/${id}`
                      : `/investigations/${id}/${check._id}`
                  }
                >
                  <div
                    className={cx(
                      "flex-1 rounded-xl p-3 h-12.5 box-border border border-gray-200",

                      checkId === check?._id &&
                        "border-brand-500 ring-1 ring-brand-500 ring-inset",
                    )}
                  >
                    <div className="flex gap-2 items-center ">
                      <Badge
                        type="color"
                        size="md"
                        className="font-semibold text-primary"
                      >
                        {check.source === "github" ? "Changes" : "Application"}
                      </Badge>
                      <Typography
                        variant="sm/medium"
                        className="text-primary line-clamp-1 max-w-[75%]"
                      >
                        {check?.result?.summary}
                      </Typography>
                      <ArrowRight className="size-5 ml-auto text-gray-500" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div
        className={`flex gap-3 flex-col justify-start items-start ${checks.length > 0 ? "mt-5" : ""}`}
      ></div>
    </div>
  );
}

function InvestigationDetailsRightPanel() {
  const { id, checkId } = useParams();
  const { data: investigation } = useInvestigation(id || "");
  const check = investigation.checks.find(
    (item: { _id: string }) => item._id === checkId,
  );
  const { action, result } = check;

  function getHeader() {
    if (check?.source === "github") {
      return "Check code changes";
    } else if (check?.source === "sentry") {
      return "Check issue";
    }

    return "Check logs";
  }

  function getSource() {
    let text = "";
    let avatar = null;

    if (check?.source === "github") {
      text = "GitHub";
      avatar = <FaGithub className="h-5 w-5" />;
    } else if (check?.source === "grafana") {
      text = "Grafana";
      avatar = <Avatar className="h-5 w-5" src={GrafanaLogo} alt="grafana" />;
    } else if (check?.source === "datadog") {
      text = "Datadog";
      avatar = <Avatar className="h-5 w-5" src={DatadogLogo} alt="datadog" />;
    } else if (check?.source === "sentry") {
      text = "Sentry";
      avatar = <Avatar className="h-5 w-5" src={SentryLogo} alt="sentry" />;
    }

    return (
      <div className="flex items-center gap-2">
        {avatar}
        <Typography variant="sm/medium" className="text-primary">
          {text}
        </Typography>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-[424px]">
      <div className="flex-1 rounded-2xl border border-gray-200 shadow-sm">
        <div className="p-5 gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <Typography variant="xl/semibold">{getHeader()}</Typography>
            </div>
            <div className="flex items-center gap-2">
              <Typography variant="sm/medium" className="text-primary">
                Source:
              </Typography>
              <Typography variant="sm/medium">{getSource()}</Typography>
            </div>
          </div>

          <Divider className="mt-4 mb-5" />

          <ExplanationBlock
            action={action}
            result={result}
            source={check.source}
          />
        </div>
      </div>
    </div>
  );
}

interface ExplanationBlockProps {
  action: Check["action"];
  result: Check["result"];
  source: string;
}

function ExplanationBlock({ action, result, source }: ExplanationBlockProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Typography variant="md/semibold">
          {source === "github" ? "Changes" : "Application"}
        </Typography>
        <Typography variant="md/normal">{result?.summary}</Typography>
      </div>

      <div className="flex flex-col gap-3">
        <Typography variant="md/semibold">
          {source === "github" ? "Explanation" : action?.query}
        </Typography>
        <Typography variant="md/normal">{result?.explanation}</Typography>
      </div>
      {source === "github" && (
        <div className="flex flex-col gap-3 ">
          <Typography variant="md/semibold">Documents</Typography>
          <div className="border border-gray-200 rounded-lg">
            <Accordion type="single" collapsible>
              {action?.files?.map((f: File, i: number) => (
                <AccordionItem key={f.filename} value={f.filename + i}>
                  <AccordionTrigger className="group flex items-center justify-between w-full p-3 pr-5 cursor-pointer border-b border-gray-200">
                    <a className="flex gap-1" href={f.url} target="_blank">
                      <Typography
                        variant="md/semibold"
                        className="text-primary"
                      >
                        {f.filename}
                      </Typography>
                      <LinkExternal01 size={14} className="mt-0.5" />
                    </a>
                    <ChevronDown
                      className="transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180 text-gray-400"
                      size={24}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="p-3 border-b border-gray-200">
                    <SyntaxHighlighter
                      customStyle={{ fontSize: "0.875rem", lineHeight: 1.5 }}
                      style={vs}
                    >
                      {f.text as string}
                    </SyntaxHighlighter>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      )}
    </div>
  );
}

export { InvestigationDetailsLeftPanel, InvestigationDetailsRightPanel };
