import { Button } from "@/components/base/buttons/button";
import { Navigate, useLocation } from "react-router-dom";
import * as paths from "../../routes/paths";

const RequestAccessPage = () => {
  const location = useLocation();

  const email = location.state?.email;

  if (!email) {
    return <Navigate to={paths.LOGIN_PATH} />;
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div className="max-w-auth-container flex flex-col justify-center items-center w-full gap-8">
        <div className="flex flex-col gap-3 justify-center items-center">
          <h1 className="text-3xl font-semibold text-primary">
            Ready to start ?
          </h1>
          <p className="text-text-tertiary text-center">
            Thank you for your interest in Aster. We are currently invite-only
            but you can request early access below.
          </p>
        </div>
        <div className="flex flex-col gap-6 w-full items-center justify-center">
          <Button
            href="https://tally.so/r/nWlxVR"
            color="primary"
            size="lg"
            className="w-full"
          >
            Request access
          </Button>

          <Button
            color="link-gray"
            href={paths.LOGIN_PATH}
            type="button"
            size="md"
          >
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequestAccessPage;
