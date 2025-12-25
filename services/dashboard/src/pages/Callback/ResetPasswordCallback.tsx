import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import Typography from "@/components/common/Typography";
import { HOME_PATH, LOGIN_PATH } from "@/routes/paths";
import { ArrowLeft } from "@untitledui/icons";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { validatePassword } from "@/utils/validators";
import FormHint from "@/components/common/FormHint";
import { toast } from "react-hot-toast";
import { useAuth } from "@/providers/auth";

export default function ResetPasswordCallback() {
  const { resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");

  if (!token) {
    return <Navigate to={LOGIN_PATH} replace />;
  }

  const handleSubmit = async () => {
    try {
      await resetPassword(token, newPassword);
      navigate(HOME_PATH, { replace: true });
    } catch (error) {
      toast.error("Token expired.");
      navigate(LOGIN_PATH, { replace: true });
    }
  };

  const handleInputChange = (value: string) => {
    setError(null);
    setNewPassword(value);
    if (value.length > 0) {
      const error = validatePassword(value);
      setError(error.error);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-auth-container flex flex-col items-center justify-center gap-8">
        <Typography variant="display-sm/semibold" className="text-primary">
          Set new Password
        </Typography>

        <div className="w-full">
          <Input
            label="Password"
            value={newPassword}
            onChange={handleInputChange}
            placeholder="Create new password..."
            type="password"
          />
          <FormHint
            open={Boolean(error)}
            size="sm"
            color="error"
            className="mt-2"
          >
            {error}
          </FormHint>
        </div>
        <Button
          onClick={handleSubmit}
          className="w-full"
          isDisabled={Boolean(error) || isLoading}
        >
          Reset Password
        </Button>
        <Button
          iconLeading={ArrowLeft}
          color="link-gray"
          href={LOGIN_PATH}
          isDisabled={isLoading}
        >
          Back to log in
        </Button>
      </div>
    </div>
  );
}
