import { useCallback, useEffect } from "react";
import { API_SERVER_URL } from "../../../../constants";
import { ConnectionProps, ConnectionName } from "../../../../types/Connections";
import { FieldConfiguration, IntegrationPayload } from "../../types";
import {
  IntegrationField,
  IntegrationFieldInputRenderer,
  IntegrationFieldSectionWrapper,
} from "../../components/IntegrationField";
import Typography from "@/components/common/Typography";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { GitBranch02, Trash01 } from "@untitledui/icons";
import Divider from "@/components/common/Divider";

const fieldsConfigurations: FieldConfiguration[] = [
  {
    key: "access_token",
    label: "Personal access token (Classic)",
    type: "credentials",
    input: { type: "secret" },
  },
];

const customFieldsConfigurations: FieldConfiguration[] = [
  {
    key: "reposToSync",
    label: "Repositories",
    type: "settings",
    input: {
      type: "dynamic-text",
      shape: [
        {
          key: "repoName",
          label: "Repository name",
          placeholder: "Repository name",
        },
        {
          key: "branchName",
          label: "Branch name",
          placeholder: "Branch name",
        },
      ],
    },
  },
];

export const ConnectGithubIntegration = ({
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
          vendor: ConnectionName.Github,
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

  const handleChange = (value: string | any, key: string, type: string) => {
    updateState({ key, value, type });
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <>
      {fieldsConfigurations.map((config) => {
        const { key, type } = config;
        const currentValue = data?.[type]?.[key] || formData[key];

        return (
          <IntegrationField
            key={config.key}
            config={config}
            value={currentValue || ""}
            onChange={(value: string) => handleChange(value, key, type)}
          />
        );
      })}
      <GitHubCustomFields
        data={data}
        formData={formData}
        onChange={handleChange}
      />
    </>
  );
};

function GitHubCustomFields({
  data,
  formData,
  onChange,
}: {
  data: any;
  formData: any;
  onChange: (value: string | any, key: string, type: string) => void;
}) {
  return customFieldsConfigurations.map((config) => {
    const { key, type } = config;
    const isConnected = !!data?.[type]?.[key];

    if (isConnected) {
      return (
        <ReadOnlyGitHubCustomFieldItem
          key={config.key}
          data={data}
          config={config}
        />
      );
    }

    return (
      <GitHubCustomFieldItem
        key={config.key}
        data={data}
        formData={formData}
        onChange={onChange}
        config={config}
      />
    );
  });
}

function GitHubCustomFieldItem({
  data,
  formData,
  onChange,
  config,
}: {
  data: any;
  formData: any;
  onChange: (value: string | any, key: string, type: string) => void;
  config: FieldConfiguration;
}) {
  const { key, input, label, type } = config;
  const currentValue = data?.[type]?.[key] || formData?.[key] || [];
  const shape = input?.shape || [];

  useEffect(() => {
    if (currentValue.length === 0) {
      handleAddMore();
    }
  }, []);

  const handleAddMore = () => {
    onChange(
      [
        ...currentValue,
        shape
          .map((field: any) => ({ [field.key]: "" }))
          .reduce((acc: any, curr: any) => ({ ...acc, ...curr }), {}),
      ],
      key,
      type,
    );
  };

  const handleRemove = (index: number) => {
    onChange(
      [...currentValue.slice(0, index), ...currentValue.slice(index + 1)],
      key,
      type,
    );
  };

  const handleChange = (
    inputValue: string,
    repoIndex: number,
    fieldIndex: number,
  ) => {
    let updatedValue = [...currentValue];
    updatedValue[repoIndex][fieldIndex] = inputValue;

    onChange(updatedValue, key, type);
  };

  return (
    <div>
      <Typography variant="md/medium" className="text-secondary mb-2">
        {label}
      </Typography>
      <IntegrationFieldSectionWrapper key={key} label={label}>
        <div className={"flex flex-col gap-4 w-full"}>
          {currentValue?.map?.((item: any, index: number) => (
            <div className={"flex gap-4 w-full flex-row"} key={index}>
              {shape.map((field: any) => (
                <IntegrationFieldInputRenderer
                  key={`${index}-${field.key}`}
                  config={{
                    ...config,
                    label: "",
                    key: field.key,
                    placeholder: field.placeholder,
                    input: { type: "text" },
                  }}
                  value={item[field.key]}
                  onChange={(value: string) =>
                    handleChange(value, index, field.key)
                  }
                />
              ))}
              {currentValue.length > 1 && (
                <ButtonUtility
                  size="sm"
                  color="tertiary"
                  tooltip="Delete"
                  icon={Trash01}
                  onClick={() => handleRemove(index)}
                />
              )}
            </div>
          ))}

          <div className="flex flex-row gap-4 w-full">
            <Button color="secondary" size="sm" onClick={handleAddMore}>
              Add more
            </Button>
          </div>
        </div>
      </IntegrationFieldSectionWrapper>
    </div>
  );
}

function ReadOnlyGitHubCustomFieldItem({
  config,
  data,
}: {
  data: any;
  config: FieldConfiguration;
}) {
  const { key, type } = config;
  const currentValue = data?.[type]?.[key] || [];

  return (
    <IntegrationFieldSectionWrapper key={key} label={"Synced Repositories"}>
      <div className={"flex flex-col gap-5 w-full"}>
        {currentValue.map((item: any, index: number) => {
          const [repoName, branchName] = item.repoName.split("/");
          return (
            <div
              className={"rounded-lg border border-secondary flex flex-col"}
              key={index}
            >
              <div className="flex items-center gap-0 px-3 py-2 text-disabled">
                <Typography variant="md/normal">{repoName}/</Typography>
                <Typography variant="md/semibold">{branchName}</Typography>
              </div>
              <Divider />
              <div className="flex items-center gap-1 px-3 py-2">
                <GitBranch02 size={16} className="text-disabled" />
                <Typography variant="md/normal" className="text-disabled font-mono">
                  {item.branchName}
                </Typography>
              </div>
            </div>
          );
        })}
      </div>
    </IntegrationFieldSectionWrapper>
  );
}
