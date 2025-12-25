/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { API_SERVER_URL } from "../../../../constants";
import { ConnectionProps, ConnectionName } from "../../../../types/Connections";
import { FieldConfiguration, IntegrationPayload } from "../../types";
import { IntegrationField } from "../../components/IntegrationField";

const fieldsConfigurations: FieldConfiguration[] = [
  {
    key: "access_token",
    label: "API access key",
    type: "credentials",
    input: { type: "secret" },
  },
  {
    key: "slackChannelId",
    label: "PagerDuty Slack channel ID",
    subtitle:
      "The ID of the Slack channel where PagerDuty incidents are posted.",
    type: "settings",
  },
];

export const ConnectPagerDutyIntegration = ({
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
          vendor: ConnectionName.PagerDuty,
          organization: orgId,
          metadata: { ...(prev?.body?.metadata || {}) },
          credentials: { ...(prev?.body?.credentials || {}) },
          settings: { ...(prev?.body?.settings || {}) },
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
        value={currentValue}
        onChange={handleChange}
      />
    );
  });
};
