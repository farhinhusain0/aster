import { useIntegrations } from "../../../api/queries/integrations";
import {
  ConnectionName,
  ConnectionType,
  Vendor,
} from "../../../types/Connections";
import { useVendors } from "../../../api/queries/vendors";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { icons } from "../../../components/Connection/icons";
import {
  useCreateIndex,
  useDeleteIndex,
  useIndex,
} from "../../../api/queries/knowledgeGraph";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "../../../api/queries/auth";
import { useJob } from "../../../api/queries/jobs";
import OrganizationContentContainer from "../components/OrganizationContentContainer";
import Typography from "@/components/common/Typography";
import { Button } from "@/components/base/buttons/button";
import { Legend, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ChartLegendContent } from "@/components/application/charts/charts-base";
import { Toggle } from "@/components/base/toggle/toggle";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import ContentContainerCard from "@/components/common/ContentContainerCard";
import { ConfirmationModal } from "@/components/common/Modals";
import { useDisclosure } from "@/hooks/modal";
import { formatDate } from "@/utils/date";
import { ConnectionModal } from "@/components/Connection/ConnectionModal";
import useDocumentTitle from "@/hooks/documentTitle";

const Null = styled.span``;

const INDEXABLE_VENDORS = [
  "Slack",
  "Github",
  "Notion",
  "Confluence",
  "Jira",
  "PagerDuty",
];

const CLASS_NAMES = {
  Github: "text-indigo-500",
  Slack: "text-brand-600",
  Notion: "text-purple-600",
  Confluence: "text-purple-500",
  Jira: "text-brand-700",
  PagerDuty: "text-brand-500",
};

const EMPTY_PIE_CHART = [
  {
    name: "No integrations",
    value: 100,
    className: "text-utility-gray-200",
  },
];

export const OrganizationKnowledgeGraphPage = () => {
  useDocumentTitle("Knowledge graph | Aster");
  const {
    isOpen: isDeleteGraphAlertOpen,
    setIsOpen: setIsDeleteGraphAlertOpen,
  } = useDisclosure({ animationDuration: 300 });
  const { isOpen: isBuildIndexAlertOpen, setIsOpen: setIsBuildIndexAlertOpen } =
    useDisclosure({ animationDuration: 300 });
  const integrationsQuery = useIntegrations({ refetchOnWindowFocus: false });
  const vendorsQuery = useVendors();
  const queryClient = useQueryClient();

  const { mutateAsync: indexCreation, isPending: isIndexCreationPending } =
    useCreateIndex();
  const { data: user } = useMe();
  const organization = user?.organization;

  const indexQuery = useIndex();
  const jobQuery = useJob(
    organization?._id as string,
    "ingest-knowledge",
    "pending",
  );

  const { data: index } = indexQuery;
  const { data: jobs } = jobQuery;
  const job = jobs && jobs?.[0];

  const connectedVendors = integrationsQuery.data?.map(
    (integration: { vendor: { name: ConnectionName } }) =>
      integration.vendor.name,
  );

  const isBasicIndexingInprogress = jobQuery?.data?.some(
    (job: { status: string; phase: string }) => job.status === "pending",
  );

  const [selectedVendors, setSelectedVendors] = useState<string[]>(
    index?.dataSources || [],
  );
  useEffect(() => {
    setSelectedVendors(index?.dataSources || []);
  }, [index?.dataSources]);

  const seriesData = (() => {
    if (!index?.stats) {
      return EMPTY_PIE_CHART;
    }

    const integrationsByVendorName = new Map(
      integrationsQuery.data?.map((integration) => [
        integration.vendor.name,
        integration,
      ]) ?? [],
    );

    const statsAster = index?.stats
      ? Object.entries(index?.stats).map(([key, value]) => {
          const integration = integrationsByVendorName.get(
            key as ConnectionName,
          );
          const displayName =
            integration?.vendor.displayName || integration?.vendor.name;

          return {
            name: `${displayName}: ${value}`,
            value: value || 0,
            label: `${displayName}: ${value}`,
            className: CLASS_NAMES[key as keyof typeof CLASS_NAMES],
          } as {
            name: string;
            value: number;
            label: string;
            className: string;
          };
        })
      : [];

    const filteredData = statsAster.filter(
      (d: { value: number }) => d.value > 0,
    );

    return filteredData.length === 0 ? EMPTY_PIE_CHART : filteredData;
  })();

  const handleBuildIndex = async () => {
    const promise = indexCreation({
      dataSources: selectedVendors,
    });

    toast.promise(promise, {
      loading: "Building index.",
      success: "Index built.",
      error: "Build failed.",
    });

    await promise;
    setIsBuildIndexAlertOpen(false);

    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: [ConnectionType.Integration] });
    }, 1000);
  };

  const { mutateAsync: deleteIndex } = useDeleteIndex();

  const handleDelete = async () => {
    setIsDeleteGraphAlertOpen(false);
    const promise = deleteIndex(index?._id);

    toast.promise(promise, {
      loading: "Deleting graph.",
      success: "Index deleted.",
      error: "Delete failed.",
    });

    await promise;
    queryClient.invalidateQueries({ queryKey: ["index"] });
  };

  const submitLabel = isBasicIndexingInprogress
    ? "Build in-progress"
    : index
      ? "Rebuild Index"
      : "Build Index";
  const confirmMessage = index ? (
    "Are you sure you want to rebuild the index? All of its data will be deleted"
  ) : (
    <span>
      You will be creating a new index with the selected data sources:{" "}
      <span className="font-semibold">
        {selectedVendors.slice(0, -1).join(", ")}
      </span>
      <span>{selectedVendors.length > 1 && " and "}</span>
      <span className="font-semibold">
        {selectedVendors[selectedVendors.length - 1]}
      </span>
      . Do you want to continue?
    </span>
  );

  const displayableVendors = vendorsQuery.data?.filter((vendor) =>
    INDEXABLE_VENDORS.includes(vendor.name),
  );

  return (
    <OrganizationContentContainer title="Knowledge graph">
      <div className="shadow-xs bg-primary rounded-xl border border-secondary">
        <div className="flex flex-row gap-0 w-full bg-secondary rounded-xl rounded-b-none border-b border-secondary">
          <div className="flex-1 px-6 py-3 border-r border-secondary">
            <Typography variant="xs/semibold" className="text-quaternary">
              SOURCES
            </Typography>
          </div>
          <div className="flex-1 px-6 py-3">
            <Typography variant="xs/semibold" className="text-quaternary">
              DISTRIBUTION
            </Typography>
          </div>
        </div>
        <div className="flex flex-row gap-0 w-full">
          <div className="flex-1 border-r border-secondary">
            {displayableVendors?.map((vendor) => (
              <VendorItem
                key={vendor.name}
                vendor={vendor}
                isConnected={Boolean(connectedVendors?.includes(vendor.name))}
                isChecked={Boolean(selectedVendors?.includes(vendor.name))}
                onChange={() =>
                  selectedVendors.includes(vendor.name)
                    ? setSelectedVendors(
                        selectedVendors.filter((v) => v !== vendor.name),
                      )
                    : setSelectedVendors([...selectedVendors, vendor.name])
                }
              />
            ))}
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <ResponsiveContainer>
              <PieChart
                margin={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  content={ChartLegendContent}
                />

                <Pie
                  isAnimationActive={false}
                  startAngle={-270}
                  endAngle={-630}
                  stroke="none"
                  data={seriesData}
                  dataKey="value"
                  nameKey="name"
                  fill="currentColor"
                  innerRadius={20}
                  outerRadius={135}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center gap-2 border-t border-secondary rounded-xl rounded-t-none px-6 py-4">
          {isBasicIndexingInprogress ? (
            <LoadingIndicator
              size="sm"
              label={"In progress."}
              className="flex-row"
              labelColor="tertiary"
            />
          ) : job?.status === "failed" ? (
            <Typography variant="sm/medium" className="text-error-primary">
              Indexing failed.
            </Typography>
          ) : index?.updatedAt ? (
            <div>
              <Typography variant="sm/normal" className="text-tertiary">
                Last indexed at:
              </Typography>
              <Typography variant="sm/semibold" className="text-tertiary">
                {formatDate({
                  inputDate: index.updatedAt,
                })}
              </Typography>
            </div>
          ) : (
            <div />
          )}

          <Button
            isDisabled={
              selectedVendors.length === 0 ||
              job?.status === "pending" ||
              isBasicIndexingInprogress ||
              isIndexCreationPending
            }
            onClick={() => setIsBuildIndexAlertOpen(true)}
          >
            {submitLabel}
          </Button>

          <ConfirmationModal
            title={`${submitLabel}?`}
            description={confirmMessage}
            open={isBuildIndexAlertOpen}
            onClose={() => setIsBuildIndexAlertOpen(false)}
            onSubmit={handleBuildIndex}
            confirmText={"Confirm"}
            cancelText="Cancel"
            confirmButtonColor="primary"
            confirmButtonDisabled={isIndexCreationPending}
            confirmButtonLoading={isIndexCreationPending}
          />
        </div>
      </div>
      {index &&
        !isIndexCreationPending &&
        index?.state?.status !== "pending" && (
          <ContentContainerCard>
            <ContentContainerCard.Content>
              <div className="flex flex-row gap-8 justify-between">
                <div className="flex flex-col gap-0.5">
                  <Typography variant="md/medium" className="text-secondary">
                    Delete knowledge graph
                  </Typography>
                  <Typography variant="md/normal" className="text-tertiary">
                    If you delete this graph, all this data will be lost
                    forever. This action is irreversible.
                  </Typography>
                </div>

                <Button
                  color="tertiary-destructive"
                  onClick={() => setIsDeleteGraphAlertOpen(true)}
                >
                  Delete
                </Button>
                <ConfirmationModal
                  title="Delete graph?"
                  description="Are you sure you want to delete your organization's knowledge graph? This action cannot be undone."
                  open={isDeleteGraphAlertOpen}
                  onClose={() => setIsDeleteGraphAlertOpen(false)}
                  onSubmit={handleDelete}
                  confirmButtonColor="primary-destructive"
                  confirmText="Delete"
                  cancelText="Cancel"
                />
              </div>
            </ContentContainerCard.Content>
          </ContentContainerCard>
        )}
    </OrganizationContentContainer>
  );
};

const VendorItem = ({
  vendor,
  isConnected,
  isChecked,
  onChange,
}: {
  vendor: Vendor;
  isConnected: boolean;
  isChecked: boolean;
  onChange: (isSelected: boolean) => void;
}) => {
  const [isSelected, setIsSelected] = useState(isChecked);
  const Icon = icons?.[vendor.name as keyof typeof icons] || Null;
  const { isOpen, onClose, onOpen, shouldRender } = useDisclosure();

  const onSubmit = () => {
    onClose();
  };

  useEffect(() => {
    setIsSelected(isChecked);
  }, [isChecked]);

  const handleChange = (isSelected: boolean) => {
    setIsSelected(isSelected);
    onChange(isSelected);
  };

  return (
    <div
      key={vendor.name}
      className="flex flex-row items-center justify-between gap-2 px-5 py-4 border-b border-secondary last:border-b-0"
    >
      <div className="flex flex-row items-center gap-3">
        <Icon style={{ width: "32px", height: "32px" }} />
        <Typography variant="md/medium" className="text-primary">
          {vendor.displayName || vendor.name}
        </Typography>
      </div>
      {isConnected ? (
        <Toggle isSelected={isSelected} onChange={handleChange} />
      ) : (
        <Button onClick={onOpen} color="link-color" size="sm">
          Connect
          {shouldRender && vendor && (
            <ConnectionModal
              open={isOpen}
              onClose={onClose}
              onSubmit={onSubmit}
              vendor={vendor as Vendor}
            />
          )}
        </Button>
      )}
    </div>
  );
};
