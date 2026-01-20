import { useState } from "react";
import { GenericModal } from "@/components/common/Modals";
import { Input } from "@/components/base/input/input";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Trash01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { v4 as uuidv4 } from "uuid";
import { useMe } from "@/api/queries/auth";
import { validateEmail } from "@/utils/validators";
import { useOrgUsers } from "@/api/queries/users";
import FormHint from "@/components/common/FormHint";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (emails: string[]) => void;
}

interface Email {
  id: string;
  text: string;
  isValid: boolean;
}

function getEmptyEmail(): Email {
  return { id: uuidv4(), text: "", isValid: false };
}

const INITIAL_EMAILS: Email[] = [
  getEmptyEmail(),
  getEmptyEmail(),
  getEmptyEmail(),
];

const InviteMemberModal = ({ open, onClose, onSubmit }: Props) => {
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    const validEmails = emails.filter(
      (email) => email.isValid && email.text.trim() !== "",
    );
    onSubmit(validEmails.map((email) => email.text));
  };

  const handleDeleteEmail = (id: string) => {
    if (emails.length === 1) {
      setEmails([getEmptyEmail()]);
      return;
    }
    setEmails(emails.filter((email) => email.id !== id));
  };

  const handleAddEmail = () => {
    setEmails([...emails, getEmptyEmail()]);
  };

  const invalidEmails = emails.filter(
    (email) => !email.isValid && email.text.trim() !== "",
  );
  const isAllEmailsEmpty = emails.every((email) => email.text.trim() === "");
  return (
    <GenericModal
      open={open}
      onClose={handleClose}
      title="Invite members"
      primaryButtonText="Invite"
      onPrimaryButtonClick={handleSubmit}
      hasError={invalidEmails.length > 0 || isAllEmailsEmpty}
    >
      <div className="flex flex-col gap-3">
        {emails.map((email, index) => (
          <EmailInput
            key={email.id}
            id={email.id}
            email={email.text}
            onChange={(value, isValid) => {
              const newEmails = [...emails];
              newEmails[index] = {
                ...newEmails[index],
                text: value,
                isValid: isValid,
              };
              setEmails(newEmails);
            }}
            onDelete={handleDeleteEmail}
          />
        ))}
      </div>
      <div>
        <Button size="sm" color="link-color" onClick={handleAddEmail}>
          Add another
        </Button>
      </div>
    </GenericModal>
  );
};

function EmailInput({
  email,
  onChange,
  onDelete,
  id,
}: {
  email: string;
  id: string;
  onChange: (email: string, isValid: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const { data: user } = useMe();
  const { data: users } = useOrgUsers(user?.organization._id);
  const registeredEmails = users?.users
    .filter((user) => user.status === "activated")
    .map((user) => user.email);
  const [emailInputError, setEmailInputError] = useState("");

  const handleChange = (value: string) => {
    // Validate email format
    const isValidEmail = validateEmail(value);

    // Validate if email is registered
    const isRegisteredEmail = registeredEmails?.includes(value);

    const isValid = isValidEmail && !isRegisteredEmail;

    onChange(value, isValid);

    // Unless the typed email is valid we won't show the input
    // error message. But we will count the isValid to decide if the form is valid.
    if (!isValidEmail) {
      setEmailInputError("");
      return;
    }

    if (isRegisteredEmail) {
      setEmailInputError("Email already registered");
    }
    else {
      setEmailInputError("");
    }
  };

  const hasEmailInputError = Boolean(emailInputError);
  return (
    <div className="flex flex-row gap-1.5">
      <div className="w-full">
        <Input
          size="sm"
          value={email}
          onChange={handleChange}
          placeholder="name@company.com"
          isInvalid={hasEmailInputError}
        />
        <FormHint
          open={hasEmailInputError}
          size="sm"
          color="error"
          className="mt-2"
        >
          {emailInputError}
        </FormHint>
      </div>
      <ButtonUtility
        className="p-3"
        size="xs"
        color="secondary"
        tooltip="Delete"
        icon={Trash01}
        onClick={() => onDelete(id)}
      />
    </div>
  );
}

export { InviteMemberModal };
