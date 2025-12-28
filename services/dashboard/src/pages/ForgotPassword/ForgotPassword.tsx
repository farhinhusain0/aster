import { useState } from "react";
import { Input } from "@/components/base/input/input";
import { Button } from "@/components/base/buttons/button";
import { LOGIN_PATH } from "@/routes/paths";
import Typography from "@/components/common/Typography";
import { ArrowLeft } from "@untitledui/icons";
import { validateEmail } from "@/utils/validators";
import FormHint from "@/components/common/FormHint";
import { toast } from "react-hot-toast";
import { useAuth } from "@/providers/auth";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { forgotPassword, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const promise = forgotPassword(email);
    toast.promise(promise, {
      loading: "Sending link.",
      success: "Password reset link sent.",
      error: "Failed to send link. Try again.",
    });
    await promise;
    setIsSuccess(true);
  };

  const handleInputChange = (value: string) => {
    setError(null);
    setEmail(value);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center w-full flex-col gap-4 p-4">
        <div className="w-full max-w-auth-container">
          <div className="flex flex-col items-center text-center gap-8">
            <div>
              <Typography
                variant="display-sm/semibold"
                className="text-primary"
              >
                Check your email
              </Typography>

              <Typography variant="md/normal" className="text-tertiary mt-3">
                We've sent a password reset link to
              </Typography>
              <Typography variant="md/medium" className="text-tertiary">
                {email}
              </Typography>
            </div>

            <div className="text-center">
              <Typography variant="sm/normal" className="text-tertiary">
                Didn't receive the email?{" "}
                <Button color="link-color" size="sm" onClick={handleSubmit}>
                  Click to resend
                </Button>
              </Typography>
            </div>

            <Button iconLeading={ArrowLeft} color="link-gray" href={LOGIN_PATH}>
              Back to log in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasError = Boolean(error) || !validateEmail(email);
  return (
    <div className="flex min-h-screen items-center justify-center w-full flex-col gap-4 p-4">
      <div className="w-full max-w-auth-container">
        <div className="flex flex-col">
          <div className="text-center mb-8">
            <Typography variant="display-sm/semibold" className="text-primary">
              Forgot password?
            </Typography>
            <Typography variant="md/normal" className="text-tertiary mt-2">
              No worries, we'll send you reset instructions.
            </Typography>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Email"
                value={email}
                onChange={handleInputChange}
                placeholder="Enter your email address..."
                type="text"
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
              type="submit"
              color="primary"
              size="lg"
              className="w-full"
              isDisabled={isLoading || hasError}
            >
              Reset password
            </Button>
          </form>

          <div className="flex justify-center items-center mt-6">
            <Button iconLeading={ArrowLeft} color="link-gray" href={LOGIN_PATH}>
              Back to log in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
