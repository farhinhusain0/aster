import { Navigate, useLocation } from "react-router-dom";
import { LOGIN_PATH, SIGNUP_PATH } from "@/routes/paths";
import Typography from "@/components/common/Typography";
import { Button } from "@/components/base/buttons/button";
import { useAuth } from "@/providers/auth";
import toast from "react-hot-toast";

export default function RegistrationEmailVerification() {
  const location = useLocation();
  const { register } = useAuth();

  const email = location.state?.email;
  const password = location.state?.password;
  const name = location.state?.name;

  if (!email || !password || !name) {
    return <Navigate to={SIGNUP_PATH} />;
  }

  async function handleResendLink() {
    const promise = register(email, password, name);
    toast.promise(promise, {
      loading: "Sending link.",
      success: "Link sent.",
      error: "Failed to send link.",
    });
    await promise;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div className="max-w-auth-container flex flex-col justify-center items-center w-full">
        <Typography variant="4xl/semibold" className="text-primary">
          Verify your email
        </Typography>
        <Typography variant="md/normal" className="text-tertiary mt-3">
          We sent a verification link to
        </Typography>
        <Typography variant="md/medium" className="text-tertiary">
          {email}
        </Typography>

        <Button className="mt-8 w-full" size="md" onClick={handleResendLink}>
          Resend link
        </Button>
        <Button className="mt-8" color="link-gray" size="md" href={LOGIN_PATH}>
          Back to log in
        </Button>
      </div>
    </div>
  );
}
