import { NavList } from "../application/app-navigation/base-components/nav-list";
import { NavItemType } from "../application/app-navigation/config";
import { MagicWand01, Globe02 } from "@untitledui/icons";
import * as paths from "@/routes/paths";
import { useLocation } from "react-router-dom";
import { cx } from "@/utils/cx";
import { useMe } from "@/api/queries/auth";
import { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  color?: string;
  size?: number;
}

export const useNavItems = (): NavItemType[] => {
  const { data: { role = "" } = {} } = useMe() || {};
  const isOwner = role === "owner" || false;

  return [
    {
      label: "Investigations",
      href: paths.INVESTIGATIONS_PATH,
      icon: (props: IconProps) => (
        <MagicWand01 {...props} className={cx(props.className, "-mt-[3px]")} />
      ),
    },
    ...(isOwner
      ? [
          {
            label: "Organization",
            href: paths.ORGANIZATION_PATH,
            icon: (props: IconProps) => (
              <Globe02 {...props} className={cx(props.className, "h-4.5")} />
            ),
            open: true,
            items: [
              { label: "General", href: paths.ORGANIZATION_GENERAL_PATH },
              {
                label: "Members",
                href: paths.ORGANIZATION_MEMBERS_PATH,
              },
              {
                label: "Integrations",
                href: paths.ORGANIZATION_INTEGRATIONS_PATH,
              },
              {
                label: "Knowledge graph",
                href: paths.ORGANIZATION_KNOWLEDGE_GRAPH_PATH,
              },
            ],
          },
        ]
      : []),
  ];
};

export interface SidebarLayoutProps {
  items: NavItemType[];
  children?: React.ReactNode;
}

export function SidebarLayout({ items, children }: SidebarLayoutProps) {
  const location = useLocation();

  return (
    <div className="z-50 flex">
      <aside className="flex h-full max-w-full flex-col overflow-hidden overflow-y-auto bg-primary w-sidebar border-r border-secondary justify-between">
        <NavList items={items} activeUrl={location.pathname} />
        {children}
      </aside>
    </div>
  );
}

export function Sidebar() {
  const navItemsSimple = useNavItems();

  return <SidebarLayout items={navItemsSimple} />;
}
