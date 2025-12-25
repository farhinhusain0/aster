/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { API_SERVER_URL } from "../../../../constants";
import { ConnectionProps, ConnectionName } from "../../../../types/Connections";
import { FieldConfiguration, IntegrationPayload } from "../../types";
import { IntegrationField } from "../../components/IntegrationField";

const fieldsConfigurations: FieldConfiguration[] = [
  {
    key: "organizationId",
    label: "Organization slug",
    type: "settings",
    input: { type: "text" },
  },
  {
    key: "personalToken",
    label: "Personal token",
    type: "credentials",
    input: { type: "secret" },
  },
  {
    key: "projectIds",
    label: "Project ID",
    type: "settings",
    input: { type: "text" },
    subtitle: "Comma separated project IDs, e.g. 54852, 78489",
  },
];

export const ConnectSentryIntegration = ({
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
          vendor: ConnectionName.Sentry,
          organization: orgId,
          metadata: {},
          settings: { ...(prev?.body?.settings || {}) },
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
    let currentValue = data?.[type]?.[key] || formData[key];

    // For projectIds, convert array to comma-separated string for display
    if (key === "projectIds") {
      if (Array.isArray(currentValue)) {
        currentValue = currentValue.join(", ");
      }
    }

    const handleChange = (value: string) => {
      let payloadValue: string | string[] = value;
      // For projectIds, convert comma-separated string to array for payload
      if (key === "projectIds") {
        payloadValue = value
          .replace(", ", ",")
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id.length > 0);
      }
      updateState({ key, value: payloadValue, type });
      setFormData((prev: any) => ({
        ...prev,
        [key]: value,
      }));
    };
    return (
      <IntegrationField
        key={config.key}
        config={config}
        value={currentValue}
        onChange={handleChange}
      />
    );
  });
};
