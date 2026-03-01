import { useInvestigation } from "@/api/queries/investigations";
import Typography from "@/components/common/Typography";
import {
  getPriorityText,
  getStatusText,
  PriorityColorMap,
  StatusBadgeComponentMap,
  StatusColorMap,
  StatusIconMap,
} from "@/utils/investigations";
import { AlertCircle, LinkExternal01 } from "@untitledui/icons";
import { useParams } from "react-router-dom";
import PagerDutyLogo from "@/assets/logo-pagerduty.png";
import JiraLogo from "@/assets/logo-jira-service-management.png";
import { BadgeColors } from "@/components/base/badges/badge-types";
import { Badge, BadgeWithIcon } from "@/components/base/badges/badges";

export function InvestigationDetailsHeader() {
  const { id } = useParams();
  const { data: investigation } = useInvestigation(id || "");

  const { pdDetails, jsmDetails } = investigation;
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
    <div className="w-full flex flex-row gap-5">
      <div className="max-w-investigation-content w-full">
        <Typography variant="xl/semibold" className="text-primary">
          {title}
        </Typography>
        <div className="flex items-center gap-2 mt-2">
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
              <Typography variant="sm/medium" className="text-tertiary">
                View on {source}
              </Typography>
              <LinkExternal01 size={16} />
            </div>
          </a>
        </div>
      </div>
      <div className="max-w-investigation-right-sidebar w-full flex flex-row justify-end gap-2">
        <StatusBadge statusText={statusText} />
        <PriorityBadge priority={priority} />
      </div>
    </div>
  );
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
