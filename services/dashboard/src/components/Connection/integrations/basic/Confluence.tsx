/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { API_SERVER_URL } from "../../../../constants";
import { ConnectionProps, ConnectionName } from "../../../../types/Connections";
import { FieldConfiguration, IntegrationPayload } from "../../types";
import { IntegrationField } from "../../components/IntegrationField";

const fieldsConfigurations: FieldConfiguration[] = [
  {
    key: "email",
    label: "Atlassian user email",
    type: "credentials",
  },
  {
    key: "access_token",
    label: "API token",
    type: "credentials",
    input: { type: "secret" },
  },
  {
    key: "site_url",
    label: "Site URL",
    subtitle: "your-site.atlassian.net",
    type: "metadata",
  },
];

export const ConnectConfluenceIntegration = ({
  orgId,
  formData,
  setFormData,
  setRequestData,
  data,
}: ConnectionProps) => {
  const updateState = useCallback(
    async ({ key, value, type }: any) => {
      setRequestData((prev: any) => {
        const body: IntegrationPayload = {
          vendor: ConnectionName.Confluence,
          organization: orgId,
          metadata: { ...(prev?.body?.metadata || {}) },
          credentials: { ...(prev?.body?.credentials || {}) },
        };

        body[type as keyof IntegrationPayload][key] = value;

        return {
          url: `${API_SERVER_URL}/integrations`,
          body,
        };
      });
    },
    [orgId, setRequestData],
  );

  return fieldsConfigurations.map((config) => {
    const { key, type } = config;
    const currentValue = data?.[type]?.[key] || formData[key];
    const handleChange = (value: string) => {
      updateState({ key, value, type });
      setFormData((prev: any) => ({
        ...prev,
        [key]: value,
      }));
    };
    return (
      <IntegrationField
        key={config.key}
        config={config}
        value={currentValue || ""}
        onChange={handleChange}
      />
    );
  });
};
