import { useMe } from "@/api/queries/auth";
import { useIntegrations } from "@/api/queries/integrations";
import { useVendors } from "@/api/queries/vendors";
import Typography from "@/components/common/Typography";
import { Connection } from "@/components/Connection/Connection";
import { ConnectionType, Vendor } from "@/types/Connections";
import OrganizationContentContainer from "../components/OrganizationContentContainer";
import ContentContainerCard from "@/components/common/ContentContainerCard";
import useDocumentTitle from "@/hooks/documentTitle";

export const OrganizationIntegrationsPage = () => {
  useDocumentTitle('Integrations | Aster');
  const meQuery = useMe();
  const integrationsQuery = useIntegrations();
  const vendorsQuery = useVendors();

  const isPending =
    meQuery.isPending || integrationsQuery.isPending || vendorsQuery.isPending;

  const { data: user } = meQuery;

  if (isPending) {
    return null;
  }

  if (!user?.organization?._id) {
    return (
      <div className="max-w-organization-content mx-auto w-full mt-[200px]">
        <Typography className="text-primary text-center">
          Please add organization in Profile page
        </Typography>
      </div>
    );
  }

  // Create a map for efficient lookups of existing integrations
  const integrationsMap = new Map(
    integrationsQuery.data?.map(
      (integration: { vendor: Vendor; _id: string }) => [
        integration.vendor?._id,
        integration,
      ],
    ),
  );

  // Separate vendors into 'connected' and 'available' lists
  const connectedItems: { vendor: Vendor; data: any }[] = [];
  const availableVendors: Vendor[] = [];

  vendorsQuery.data?.forEach((vendor: Vendor) => {
    const integrationData = integrationsMap.get(vendor._id);
    if (integrationData) {
      connectedItems.push({ vendor, data: integrationData });
    } else {
      availableVendors.push(vendor);
    }
  });

  return (
    <OrganizationContentContainer title="Integrations">
      {/* 1. Conditionally render the "Connected" card */}
      {connectedItems.length > 0 && (
        <ContentContainerCard>
          <ContentContainerCard.Header>
            CONNECTED
          </ContentContainerCard.Header>
          <div className="[&>*:last-child>div]:border-b-0">
            {connectedItems.map(({ vendor, data }) => (
              <Connection
                key={vendor.name + ConnectionType.Integration}
                vendor={vendor}
                data={data}
              />
            ))}
          </div>
        </ContentContainerCard>
      )}

      {/* 2. "Available" integrations card */}
      <ContentContainerCard>
        <ContentContainerCard.Header>
          ADD NEW
        </ContentContainerCard.Header>
        <div className="[&>*:last-child>div]:border-b-0">
          {availableVendors.map((vendor: Vendor) => (
            <Connection
              key={vendor.name + ConnectionType.Integration}
              vendor={vendor}
            />
          ))}
        </div>
      </ContentContainerCard>
    </OrganizationContentContainer>
  );
};
