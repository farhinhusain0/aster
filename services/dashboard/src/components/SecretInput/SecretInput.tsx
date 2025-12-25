import { InputGroup } from "../base/input/input-group";
import { InputBase } from "../base/input/input";
import { Check, Copy01 } from "@untitledui/icons";
import { Button } from "../base/buttons/button";
import { useClipboard } from "@/hooks/use-clipboard";

interface Props {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const SecretInput = ({ disabled, value, onChange }: Props) => {
  const { copy, copied } = useClipboard();

  return (
    <InputGroup
      className="max-w-[400px]"
      aria-labelledby="Bot user OAuth token"
      aria-label="Bot user OAuth token"
      trailingAddon={
        <Button
          color="secondary"
          iconLeading={copied ? Check : Copy01}
          onClick={() => copy(value)}
        >
          Copy
        </Button>
      }
      onChange={(value) => {
        console.log("value", value);
        onChange(value);
      }}
      value={value}
    >
      <InputBase
        type="password"
        inputClassName="truncate"
        isDisabled={disabled}
      />
    </InputGroup>
  );
};

export { SecretInput };
