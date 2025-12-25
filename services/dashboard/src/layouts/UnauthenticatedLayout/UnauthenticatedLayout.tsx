import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { RouterProvider } from "react-aria-components";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import * as paths from "../../routes/paths";
import { useAuth } from "@/providers/auth";

export default function UnauthenticatedLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isVerifying } = useAuth();

  useEffect(() => {
    queryClient.clear();
  }, []);

  if (isVerifying) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={paths.HOME_PATH} />;
  }

  return (
    <RouterProvider navigate={navigate}>
      <Outlet />
    </RouterProvider>
  );
}
