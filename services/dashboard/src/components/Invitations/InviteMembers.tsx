import { Input } from "@/components/base/input/input";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Trash01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { useFeatures } from "@/api/queries/features";
import { useOrgUsers } from "@/api/queries/users";
import FormHint from "@/components/common/FormHint";
import { useState } from "react";
import { validateEmail } from "@/utils/validators";
import { useMe } from "@/api/queries/auth";
import { Email, useEmailStore } from "./store";

export function InviteMembers({
  renderEmailInput,
}: {
  renderEmailInput?: (email: Email) => React.ReactNode;
}) {
  const featuresQuery = useFeatures();
  const isInviteMembersEnabled = featuresQuery.data?.isInviteMembersEnabled;
  const { emails, addEmail } = useEmailStore();

  if (!isInviteMembersEnabled) return null;
  return (
    <div className="flex flex-col gap-4 px-6 py-5 InviteMembers-container">
      <div className="flex flex-col gap-3 InviteMembers-inputsContainer">
        {emails.map((email) =>
          renderEmailInput ? (
            renderEmailInput(email)
          ) : (
            <EmailInput key={email.id} id={email.id} email={email.text} />
          ),
        )}
      </div>
      <div className="InviteMembers-addAnotherButtonContainer">
        <Button size="sm" color="link-color" onClick={addEmail}>
          Add another
        </Button>
      </div>
    </div>
  );
}

interface EmailInputProps {
  email: string;
  id: string;
  validateOnChange?: (
    value: string,
    setEmailInputError: (error: string) => void,
  ) => boolean;
}

export function EmailInput({ email, id, validateOnChange }: EmailInputProps) {
  const { data: user } = useMe();
  const { data: users } = useOrgUsers(user?.organization._id);
  const registeredEmails = users?.users
    .filter((user) => user.status === "activated")
    .map((user) => user.email);
  const [emailInputError, setEmailInputError] = useState("");
  const { updateEmail, deleteEmail, totalEmailsLength } = useEmailStore();

  const handleChange = (value: string) => {
    // Get extra validators
    const isChangeValid = validateOnChange
      ? validateOnChange(value, setEmailInputError)
      : true;

    // Validate email format
    const isValidEmailFormat = validateEmail(value);

    // Validate if email is registered
    const isRegisteredEmail = registeredEmails?.includes(value) ?? false;

    const isValid = isValidEmailFormat && !isRegisteredEmail && isChangeValid;

    updateEmail(id, value, isValid);

    // If the typed email is not a valid email format or the email is valid we don't show the error message.
    if (!isValidEmailFormat || isValid) {
      setEmailInputError("");
      return;
    }

    if (isRegisteredEmail) {
      setEmailInputError("Already a member");
    }
  };

  const hasEmailInputError = Boolean(emailInputError);
  return (
    <div className="flex flex-row gap-2 EmailInput-container">
      <div className="w-95 EmailInput-inputContainer">
        <Input
          className="EmailInput-input"
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
          className="mt-2 EmailInput-formHint"
        >
          {emailInputError}
        </FormHint>
      </div>
      {totalEmailsLength > 1 && (
        <ButtonUtility
          className="p-2.5 EmailInput-deleteButton"
          size="xs"
          color="secondary"
          icon={Trash01}
          onClick={() => deleteEmail(id)}
        />
      )}
    </div>
  );
}
