import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { useAuth } from "@/providers/auth";
import { HOME_PATH, SIGNUP_PATH } from "@/routes/paths";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

export default function RegistrationTokenVerificationCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const tokenProcessing = useRef(false);
  const { verifyRegistration } = useAuth();

  useEffect(() => {
    if (token && !tokenProcessing.current) {
      async function verify(token: string) {
        try {
          await verifyRegistration(token);
          navigate(HOME_PATH, { replace: true });
        } catch (error) {
          console.error(error);
          toast.error("Invalid token or expired.");
          navigate(SIGNUP_PATH, { replace: true });
        }
      }
      tokenProcessing.current = true;
      verify(token);
    }
  }, [token]);

  if (!token) {
    return <Navigate to={SIGNUP_PATH} replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <LoadingIndicator type="line-simple" size="md" />
    </div>
  );
}
