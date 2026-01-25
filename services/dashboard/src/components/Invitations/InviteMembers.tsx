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
import { useEmailStore } from "./store";

export function InviteMembers() {
  const featuresQuery = useFeatures();
  const isInviteMembersEnabled = featuresQuery.data?.isInviteMembersEnabled;
  const { emails, addEmail } = useEmailStore();

  if (!isInviteMembersEnabled) return null;
  return (
    <div className="flex flex-col gap-4 px-6 py-5 InviteMembers-container">
      <div className="flex flex-col gap-3 InviteMembers-inputsContainer">
        {emails.map((email) => (
          <EmailInput key={email.id} id={email.id} email={email.text} />
        ))}
      </div>
      <div className="InviteMembers__AddAnotherButtonContainer">
        <Button size="sm" color="link-color" onClick={addEmail}>
          Add another
        </Button>
      </div>
    </div>
  );
}

function EmailInput({ email, id }: { email: string; id: string }) {
  const { data: user } = useMe();
  const { data: users } = useOrgUsers(user?.organization._id);
  const registeredEmails = users?.users
    .filter((user) => user.status === "activated")
    .map((user) => user.email);
  const [emailInputError, setEmailInputError] = useState("");
  const { updateEmail, deleteEmail } = useEmailStore();

  const handleChange = (value: string) => {
    // Validate email format
    const isValidEmail = validateEmail(value);

    // Validate if email is registered
    const isRegisteredEmail = registeredEmails?.includes(value);

    const isValid = isValidEmail && !isRegisteredEmail;

    updateEmail(id, value, isValid);

    // Unless the typed email is valid we won't show the input
    // error message. But we will count the isValid to decide if the form is valid.
    if (!isValidEmail) {
      setEmailInputError("");
      return;
    }

    if (isRegisteredEmail) {
      setEmailInputError("Email already registered");
    } else {
      setEmailInputError("");
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
      <ButtonUtility
        className="p-2.5 EmailInput-deleteButton"
        size="xs"
        color="secondary"
        tooltip="Delete"
        icon={Trash01}
        onClick={() => deleteEmail(id)}
      />
    </div>
  );
}
