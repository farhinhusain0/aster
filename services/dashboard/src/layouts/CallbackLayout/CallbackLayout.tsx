import { RouterProvider } from "react-aria-components";
import { Outlet, useNavigate } from "react-router-dom";

export default function CallbackLayout() {
  const navigate = useNavigate();

  return (
    <RouterProvider navigate={navigate}>
      <Outlet />;
    </RouterProvider>
  );
}
