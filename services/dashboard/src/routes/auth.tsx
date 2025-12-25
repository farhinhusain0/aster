import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/auth";
import * as paths from "./paths";

interface Props {
  component: React.ComponentType<object>;
}

function AuthenticationGuard({ component: Component, ...props }: Props) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return null;
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
