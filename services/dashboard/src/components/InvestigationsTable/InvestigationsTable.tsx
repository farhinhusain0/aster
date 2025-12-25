import { Link, useSearchParams } from "react-router-dom";
import { useInvestigations } from "../../api/queries/investigations";
import { TableCard, Table } from "../application/table/table";
import { Badge, BadgeWithIcon } from "../base/badges/badges";
import { format, formatDistanceToNowStrict } from "date-fns";
import type { SortDescriptor } from "react-aria-components";
import { PaginationPageMinimalCenter } from "../application/pagination/pagination";
import { INVESTIGATIONS_LIMIT } from "@/constants";
import { keepPreviousData } from "@tanstack/react-query";
import { useGenericLayout } from "@/hooks/layout";
import { usePaginationNavigation } from "@/hooks/pagination";
import { IInvestigation } from "@/types/Investigtion";
import {
  getPriorityText,
  getStatusText,
  PriorityColorMap,
  StatusBadgeComponentMap,
  StatusColorMap,
  StatusIconMap,
} from "@/utils/investigations";
import { type BadgeColors } from "../base/badges/badge-types";
import PagerDutyLogo from "@/assets/logo-pagerduty.png";
import JiraLogo from "@/assets/logo-jira-service-management.png";
import { AlertCircle } from "@untitledui/icons";
import { Tooltip, TooltipTrigger } from "../base/tooltip/tooltip";
import Typography from "../common/Typography";

interface Header {
  label: string;
  isSortable: boolean;
  className?: string;
  allowsSorting?: boolean;
}
const messageColumnClass = "min-w-[250px] w-full overflow-hidden break-words";
const sourceColumnClass =
  "w-auto min-w-[150px] break-words hidden md:table-cell";
const statusColumnClass = "w-auto min-w-[150px] break-words";
const priorityColumnClass = "w-auto min-w-[150px] break-words";
const lastUpdatedColumnClass =
  "w-auto min-w-[150px] break-words hidden lg:table-cell";
const Headers: Header[] = [
  { label: "Message", isSortable: false, className: messageColumnClass },
  { label: "Source", isSortable: false, className: sourceColumnClass },
  { label: "Status", isSortable: true, className: statusColumnClass },
  { label: "Priority", isSortable: true, className: priorityColumnClass },
  {
    label: "Last updated",
    isSortable: true,
    className: lastUpdatedColumnClass,
  },
];
function InvestigationsTable() {
  const { scrollToTop } = useGenericLayout();
  const { page, setPage } = usePaginationNavigation();
  const { data, isPending } = useInvestigations({
    limit: INVESTIGATIONS_LIMIT,
    offset: (page - 1) * INVESTIGATIONS_LIMIT,
    options: {
      placeholderData: keepPreviousData,
    },
  });
  const investigationsData = data?.investigations;
  const sortDescriptor: SortDescriptor = {
    column: "Last updated",
    direction: "ascending",
  };
  if (isPending || !investigationsData) {
    return null;
  }
  function handleMovePage(page: number) {
    scrollToTop();
    setPage(page);
  }
  return (
    <div className="w-full">
      <TableCard.Root className="w-full border-x-0 rounded-none">
        <Table
          aria-label="Investigations Table"
          aria-labelledby="investigations-table"
          sortDescriptor={sortDescriptor}
        >
          <Table.Header>
            {Headers.map(({ label, ...headerProps }, index) => (
              <Table.Head
                id={label}
                label={label?.toString().toUpperCase()}
                key={label + index}
                {...headerProps}
                isRowHeader={true}
                className={`py-3 first:pl-6 last:pr-6 ${headerProps.className || ""}`}
              />
            ))}
          </Table.Header>
          <Table.Body>
            {investigationsData.map((investigation: IInvestigation) => (
              <InvestigationAsTableRow
                key={investigation._id}
                investigation={investigation}
              />
            ))}
          </Table.Body>
        </Table>
        <PaginationPageMinimalCenter
          page={page}
          total={Math.ceil(data?.total / INVESTIGATIONS_LIMIT)}
          onPageChange={handleMovePage}
          className="px-4 py-3 md:px-6 md:pt-3 md:pb-4 border-t border-gray-200"
        />
      </TableCard.Root>
    </div>
  );
}
function InvestigationAsTableRow({
  investigation,
}: {
  investigation: IInvestigation;
}) {
  const [searchParams] = useSearchParams();
  const { _id, pdDetails, jsmDetails, updatedAt } = investigation;
  const message = pdDetails?.title || jsmDetails?.message;
  const source = pdDetails ? "PagerDuty" : "JSM ";
  const isPagerDuty = !!pdDetails;
  const sourceLogo = isPagerDuty ? PagerDutyLogo : JiraLogo;
  const statusText = getStatusText(jsmDetails, pdDetails);
  const priority = getPriorityText(jsmDetails, pdDetails);
  const relativeTime = formatDistanceToNowStrict(new Date(updatedAt), {
    addSuffix: true,
  });
  const exactTime = format(new Date(updatedAt), "MMM dd, yyyy, h:mm:ss a");
  const statusBadge = () => {
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
        color={statusColor as BadgeColors}
        size="md"
        iconLeading={statusIcon}
      >
        {statusText}
      </StatusBadgeComponent>
    );
  };
  const priorityBadge = () => {
    if (!(priority in PriorityColorMap)) {
      return (
        <Badge
          type="modern"
          color="gray"
          size="md"
          className="font-medium text-primary"
        >
          {priority}
        </Badge>
      );
    }
    return (
      <BadgeWithIcon
        type="modern"
        size="md"
        iconLeading={AlertCircle}
        color={(PriorityColorMap[priority] || "gray") as BadgeColors}
        className="font-medium text-primary"
      >
        {priority}
      </BadgeWithIcon>
    );
  };
  return (
    <Table.Row
      href={`/investigations/${_id}?${searchParams.toString()}`}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      key={_id}
    >
      <Table.Cell className={`pl-6 ${messageColumnClass}`}>
        <Link
          to={{
            pathname: `/investigations/${_id}`,
            search: searchParams.toString(),
          }}
          className={"text-primary font-semibold line-clamp-1"}
        >
          {message}
        </Link>
      </Table.Cell>
      <Table.Cell className={sourceColumnClass}>
        <div className="flex items-center gap-2">
          <img
            src={sourceLogo}
            alt={source}
            className="w-5 h-5 rounded-md object-contain"
          />
          <Typography variant="md/medium" className="text-primary">
            {source}
          </Typography>
        </div>
      </Table.Cell>
      <Table.Cell className={statusColumnClass}>{statusBadge()}</Table.Cell>
      <Table.Cell className={priorityColumnClass}>{priorityBadge()}</Table.Cell>
      <Table.Cell className={`pr-6 ${lastUpdatedColumnClass}`}>
        <span className="decoration-dotted underline underline-offset-4 decoration-gray-400 font-medium text-primary">
          <Tooltip title={exactTime}>
            <TooltipTrigger className="group relative flex cursor-pointer flex-col items-center gap-2">
              {relativeTime}
            </TooltipTrigger>
          </Tooltip>
        </span>
      </Table.Cell>
    </Table.Row>
  );
}
export { InvestigationsTable };
