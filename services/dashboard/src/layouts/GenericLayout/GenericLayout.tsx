import { Header } from "../../components/Header";
import { Outlet, useNavigate } from "react-router-dom";
import { RouterProvider } from "react-aria-components";
import { useMe } from "@/api/queries/auth";
import { Sidebar } from "@/components/Sidebar";

interface GenericLayoutProps {
  SidebarComponent?: React.ComponentType<object>;
}

function GenericLayout({ SidebarComponent = Sidebar }: GenericLayoutProps) {
  const navigate = useNavigate();
  const { isPending } = useMe() || {};

  if (isPending) {
    return null;
  }

  return (
    <RouterProvider navigate={navigate}>
      <div className="flex flex-col h-screen w-full">
        <Header />
        <div className="flex flex-1 min-h-0">
          <SidebarComponent />
          <main
            id="generic-layout-main-content"
            className="flex-1 p-6 overflow-y-auto"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </RouterProvider>
  );
}

export { GenericLayout };
