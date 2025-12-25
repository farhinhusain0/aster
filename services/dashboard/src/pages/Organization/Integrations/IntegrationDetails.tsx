import { useVendors } from "@/api/queries/vendors";
import { ConnectRequest, Integration, Vendor } from "@/types/Connections";
import { Navigate, useParams } from "react-router-dom";
import * as paths from "@/routes/paths";
import {
  useDeleteIntegration,
  useIntegrations,
} from "@/api/queries/integrations";
import OrganizationContentContainer from "../components/OrganizationContentContainer";
import Typography from "@/components/common/Typography";
import { icons } from "@/components/Connection/icons";
import ContentContainerCard from "@/components/common/ContentContainerCard";
import { Button } from "@/components/base/buttons/button";
import { ChevronDown } from "@untitledui/icons";
import { Dot } from "@/components/foundations/dot-icon";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { useDisclosure } from "@/hooks/modal";
import { cx } from "@/utils/cx";
import { ConfirmationModal } from "@/components/common/Modals";
import toast from "react-hot-toast";
import { useMe } from "@/api/queries/auth";
import {
  connectVendor,
  integrationHint,
} from "@/components/Connection/vendorComponents";
import { IntegrationFieldContext } from "@/components/Connection/components/IntegrationField";
import { useState } from "react";
import useDocumentTitle from "@/hooks/documentTitle";

export default function OrganizationIntegrationDetailsPage() {
  const { isOpen, setIsOpen } = useDisclosure();
  const {
    isOpen: isDisconnectAlertModalOpen,
    setIsOpen: setIsDisconnectAlertModalOpen,
  } = useDisclosure({ animationDuration: 300 });
  const { vendorId } = useParams();
  const [formData, setFormData] = useState({});
  const [_requestData, setRequestData] = useState<ConnectRequest>({});

  const vendorsQuery = useVendors({
    select: (data: Vendor[] | undefined) =>
      data?.filter((vendor) => vendor._id.toString() === vendorId),
  });
  const integrationsQuery = useIntegrations({
    select: (data: Integration[] | undefined) =>
      data?.filter(
        (integration) => integration.vendor._id.toString() === vendorId,
      ),
  });
  const { data: me } = useMe();
  const { mutateAsync: deleteIntegration, isPending: isDeletePending } =
    useDeleteIntegration();

  const vendor = vendorsQuery.data?.[0];
  const integration = integrationsQuery.data?.[0];
  const organizationId = me?.organization?._id;

  const pageTitle = vendor
    ? `${vendor.displayName || vendor.name} | Aster`
    : "Integration details | Aster";

  useDocumentTitle(pageTitle);

  if (
    vendorsQuery.isPending ||
    integrationsQuery.isPending ||
    !organizationId
  ) {
    return null;
  } else if (!vendor || !integration) {
    return <Navigate to={paths.ORGANIZATION_INTEGRATIONS_PATH} />;
  }

  const handleDelete = async () => {
    try {
      if (!integration?._id) {
        return;
      }

      const promise = deleteIntegration(integration?._id);
      toast.promise(promise, {
        loading: "Disconnecting integration.",
        success: "Integration disconnected.",
        error: "Disconnection failed.",
      });

      await promise;
    } catch (error) {
      console.error("Error during integration deletion", error);
    }

    setIsDisconnectAlertModalOpen(false);
  };

  const Icon = icons?.[vendor.name as keyof typeof icons] || null;
  const ConnectionComponent =
    connectVendor[vendor.name as keyof typeof connectVendor];
  return (
    <OrganizationContentContainer
      title={
        <div className="flex flex-row items-center gap-3">
          <Icon className="h-8 w-8" />
          <Typography variant="lg/semibold" className="text-primary">
            {vendor.displayName || vendor.name}
          </Typography>
        </div>
      }
    >
      <ContentContainerCard>
        <ContentContainerCard.Content>
          <div className="flex flex-row gap-8">
            <Typography
              variant="md/medium"
              className="text-secondary max-w-[276px] w-full"
            >
              Status
            </Typography>

            <Dropdown.Root isOpen={isOpen} onOpenChange={setIsOpen}>
              <Button
                className="font-medium text-md -mt-2 -ml-1.5 gap-2"
                color="tertiary"
                iconLeading={
                  <Dot className={"size-2 text-utility-success-500"} />
                }
                iconTrailing={
                  <ChevronDown
                    className={cx(
                      "size-4 transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                  />
                }
                isDisabled={isDeletePending}
              >
                Connected
              </Button>
              <Dropdown.Popover className={"max-w-[136px]"}>
                <Dropdown.Menu>
                  <Dropdown.Section>
                    <Dropdown.Item
                      variant="danger"
                      onClick={() => setIsDisconnectAlertModalOpen(true)}
                    >
                      Disconnect
                    </Dropdown.Item>
                  </Dropdown.Section>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown.Root>
          </div>
          <IntegrationFieldContext.Provider
            value={{
              isIntegrationConnected: true,
              variant: "integration-details",
            }}
          >
            <ConnectionComponent
              data={integration}
              orgId={organizationId}
              setFormData={setFormData}
              setRequestData={setRequestData}
              formData={formData}
            />
          </IntegrationFieldContext.Provider>
        </ContentContainerCard.Content>
      </ContentContainerCard>

      <ConfirmationModal
        open={isDisconnectAlertModalOpen}
        onClose={() => setIsDisconnectAlertModalOpen(false)}
        title={
          integrationHint[vendor.name as keyof typeof integrationHint]
            ?.alertHeader
        }
        description={
          integrationHint[vendor.name as keyof typeof integrationHint]
            ?.alertDescription
        }
        confirmButtonColor="primary-destructive"
        confirmText="Disconnect"
        onSubmit={handleDelete}
      />
    </OrganizationContentContainer>
  );
}
