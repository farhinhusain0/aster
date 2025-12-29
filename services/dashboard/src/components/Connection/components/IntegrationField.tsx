import { FieldConfiguration } from "../types";
import Typography from "@/components/common/Typography";
import { Input, InputBase, InputBaseProps } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { InputGroup } from "@/components/base/input/input-group";
import { Button } from "@/components/base/buttons/button";
import { useClipboard } from "@/hooks/use-clipboard";
import { Check, Copy01 } from "@untitledui/icons";
import { createContext, useContext, useEffect } from "react";
import { cx } from "@/utils/cx";

interface Props {
  value: string;
  config: FieldConfiguration;
  onChange: (value: string) => void;
}

interface IntegrationFieldContextType {
  isIntegrationConnected: boolean;
  variant: "modal" | "integration-details";
}

export const IntegrationFieldContext =
  createContext<IntegrationFieldContextType>({
    isIntegrationConnected: false,
    variant: "integration-details",
  });

const IntegrationField = (props: Props) => {
  const { config, onChange } = props;

  useEffect(() => {
    onChange("");
  }, []);

  return (
    <Wrapper label={config.label}>
      <InputRenderer {...props} />
    </Wrapper>
  );
};

function Wrapper({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { variant } = useContext(IntegrationFieldContext);

  return (
    <div
      className={cx(
        "flex gap-8",
        variant === "modal" ? "flex-col" : "flex-row",
      )}
    >
      {variant !== "modal" && (
        <Typography
          variant="md/medium"
          className="text-secondary max-w-[276px] w-full"
        >
          {label}
        </Typography>
      )}
      {children}
    </div>
  );
}

interface CommonProps {
  "aria-labelledby": string;
  "aria-label": string;
  className: string;
  label: string;
  hint: string | undefined;
  size: InputBaseProps["size"];
}

function InputRenderer(props: Props) {
  const { config, onChange, value } = props;
  const inputType = config.input?.type || "text";
  const { isIntegrationConnected, variant } = useContext(
    IntegrationFieldContext,
  );

  let commonProps: CommonProps = {
    "aria-labelledby": (config.label || config.placeholder) + "-" + config.key,
    "aria-label": (config.label || config.placeholder) + "-" + config.key,
    className: "w-full",
    label: "",
    hint: undefined,
    size: "sm",
  };

  if (variant === "modal") {
    commonProps = {
      ...commonProps,
      label: config.label,
      className: "w-full",
      hint: config.subtitle,
    };
  }

  switch (inputType) {
    case "text":
    case "secret": {
      return (
        <TextFieldInput
          commonProps={commonProps}
          value={value as string}
          isPassword={inputType === "secret"}
          isIntegrationConnected={isIntegrationConnected}
          onChange={onChange}
          placeholder={config.placeholder || ""}
        />
      );
    }
    case "select": {
      return (
        <Select
          {...commonProps}
          items={config.input!.options!.map((option) => ({
            label: option,
            id: option,
          }))}
          selectedKey={value || undefined}
          onSelectionChange={(value) => {
            onChange(value as string);
          }}
          placeholder={config.placeholder || "Select"}
          isDisabled={isIntegrationConnected}
        >
          {(item) => (
            <Select.Item key={item.id} id={item.id}>
              {item.label}
            </Select.Item>
          )}
        </Select>
      );
    }
  }
}

function CopyButton({ value }: { value: string }) {
  const { copy, copied } = useClipboard();

  return (
    <Button
      color="secondary"
      iconLeading={copied ? Check : Copy01}
      onClick={() => copy(value)}
      size="sm"
    >
      Copy
    </Button>
  );
}

interface TextFieldInputProps {
  value: string;
  isPassword: boolean;
  isIntegrationConnected: boolean;
  onChange: (value: string) => void;
  commonProps: CommonProps;
  placeholder?: string;
}

function TextFieldInput({
  commonProps,
  isPassword,
  isIntegrationConnected,
  onChange,
  value,
  placeholder,
}: TextFieldInputProps) {
  const inputValue = value || "";

  if (isIntegrationConnected) {
    return (
      <InputGroup
        {...commonProps}
        trailingAddon={<CopyButton value={inputValue} />}
        value={inputValue}
      >
        <InputBase
          isDisabled={true}
          type={isPassword ? "password" : "text"}
          inputClassName="truncate"
        />
      </InputGroup>
    );
  }

  return (
    <Input
      {...commonProps}
      type={isPassword ? "password" : "text"}
      inputClassName={isPassword ? "truncate" : undefined}
      value={inputValue}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}

export {
  IntegrationField,
  Wrapper as IntegrationFieldSectionWrapper,
  InputRenderer as IntegrationFieldInputRenderer,
  TextFieldInput as IntegrationTextFieldInput,
  CopyButton as IntegrationCopyButton,
  type CommonProps as IntegrationCommonProps,
  type TextFieldInputProps as IntegrationTextFieldInputProps,
};
