import { useChangePasswordMutation } from "@/api/queries/users";
import { Input } from "@/components/base/input/input";
import FormHint from "@/components/common/FormHint";
import { GenericModal } from "@/components/common/Modals";
import { validatePassword } from "@/utils/validators";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface FormData {
  currentPassword: string;
  newPassword: string;
  error: string | null | undefined;
}

export default function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const changePasswordMutation = useChangePasswordMutation();
  const [formData, setFormData] = useState<FormData>({
    currentPassword: "",
    newPassword: "",
    error: null,
  });

  function handleChange(
    value: string,
    type: "currentPassword" | "newPassword",
  ) {
    let _error = null;
    if (type === "newPassword" && value.length > 0) {
      const { error } = validatePassword(value);

      _error = error;
    }
    setFormData({ ...formData, [type]: value, error: _error });
  }

  const handleSubmit = async () => {
    const promise = changePasswordMutation.mutateAsync({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
    toast.promise(promise, {
      loading: "Changing password...",
      success: "Password changed successfully.",
      error: "Password change failed.",
    });
    await promise;
    handleClose();
  };

  function handleClose() {
    onClose();
    setFormData({
      currentPassword: "",
      newPassword: "",
      error: null,
    });
  }

  return (
    <GenericModal
      open={open}
      onClose={handleClose}
      title="Change password"
      primaryButtonText="Confirm"
      onPrimaryButtonClick={handleSubmit}
      hasError={
        !formData.currentPassword ||
        !formData.newPassword ||
        Boolean(formData.error) ||
        changePasswordMutation.isPending
      }
      variant="change-password"
    >
      <div className="flex flex-col gap-4 relative">
        <Input
          type="password"
          label="Current password"
          value={formData.currentPassword}
          onChange={(value) => handleChange(value, "currentPassword")}
        />
        <div>
          <Input
            type="password"
            label="New password"
            value={formData.newPassword}
            onChange={(value) => handleChange(value, "newPassword")}
          />

          <FormHint
            open={Boolean(formData.error)}
            size="sm"
            color="error"
            className="mt-2"
          >
            {formData.error}
          </FormHint>
        </div>
      </div>
    </GenericModal>
  );
}
