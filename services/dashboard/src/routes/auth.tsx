import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/auth";
import * as paths from "./paths";
import { useValidateToken } from "@/api/queries/users";

interface Props {
  component: React.ComponentType<object>;
}

function AuthenticationGuard({ component: Component, ...props }: Props) {
  const { isLoading, isAuthenticated, resetAuthState } = useAuth();
  const { isPending, isError } = useValidateToken();

  if (isLoading || isPending) {
    return null;
  } else if (isError) {
    resetAuthState();
    return <Navigate to={paths.LOGIN_PATH} />;
  } else if (!isAuthenticated) {
    return <Navigate to={paths.LOGIN_PATH} />;
  }

  return (
    <>
      <Component {...props} />
    </>
  );
}

export { AuthenticationGuard };
