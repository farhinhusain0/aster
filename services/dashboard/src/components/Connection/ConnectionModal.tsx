import { GenericModal } from "../common/Modals";
import {
  ConnectionName,
  ConnectRequest,
  Integration,
  Vendor,
} from "@/types/Connections";
import Typography from "../common/Typography";
import { connectVendor, integrationHint } from "./vendorComponents";
import { IntegrationFieldContext } from "./components/IntegrationField";
import { invalidateMe, useMe } from "@/api/queries/auth";
import {
  useCreateIntegration,
  useIntegrations,
} from "@/api/queries/integrations";
import { useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Heading } from "react-aria-components";

interface ConnectionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  vendor: Vendor;
}

export const ConnectionModal = ({
  open,
  onClose,
  onSubmit,
  vendor,
}: ConnectionModalProps) => {
  const { _id: vendorId, name } = vendor;
  const [formData, setFormData] = useState({});
  const [requestData, setRequestData] = useState<ConnectRequest>({});
  const queryClient = useQueryClient();
  const { mutateAsync: createIntegration, isPending: isCreatePending } =
    useCreateIntegration();
  const integrationsQuery = useIntegrations({
    select: (data: Integration[] | undefined) =>
      data?.filter(
        (integration) => integration.vendor._id.toString() === vendorId,
      ),
  });
  const { data: me, isPending: isMePending } = useMe();

  if (integrationsQuery.isPending || isMePending || !me || !vendor) {
    return null;
  }

  const integration = integrationsQuery.data?.[0];
  const organizationId = me.organization._id;
  const ConnectionComponent =
    connectVendor[vendor.name as keyof typeof connectVendor];

  const handleConnect = async () => {
    if (Object.keys(requestData).length > 0) {
      const promise = createIntegration(requestData);
      toast.promise(promise, {
        loading: "Connecting integration.",
        success: "Integration connected.",
        error: "Connection failed.",
      });
      await promise;
    }

    invalidateMe(queryClient);
    onSubmit();
  };

  const isFormDataValid = (formData: Record<string, any>) => {
    return Object.keys(formData).every((key) => {
      const value = formData[key];
      if (Array.isArray(value)) {
        return (
          value.length > 0 &&
          value.every(
            (entry: Record<string, any>) =>
              entry &&
              typeof entry === "object" &&
              Object.values(entry).every(Boolean),
          )
        );
      }
      return Boolean(value);
    });
  };

  return (
    <GenericModal
      open={open}
      onClose={onClose}
      onPrimaryButtonClick={handleConnect}
      {...(vendor.name !== ConnectionName.Teams && {
        primaryButtonText: "Connect",
        primaryButtonProps: {
          isDisabled:
            isCreatePending ||
            Object.keys(formData).length === 0 ||
            !isFormDataValid(formData),
        },
      })}
    >
      <div className="flex flex-col gap-0.5">
        <Heading slot="title">
          <Typography variant="lg/semibold">
            {vendor.displayName || vendor.name}
          </Typography>
        </Heading>
        <Typography variant="sm/normal" className="text-secondary">
          {
            integrationHint[name as keyof typeof integrationHint]
              ?.unauthenticated
          }
        </Typography>
      </div>
      <IntegrationFieldContext.Provider
        value={{ isIntegrationConnected: false, variant: "modal" }}
      >
        <ConnectionComponent
          data={integration}
          orgId={organizationId}
          setFormData={setFormData}
          setRequestData={setRequestData}
          formData={formData}
        />
      </IntegrationFieldContext.Provider>
    </GenericModal>
  );
};
