import type { FC, HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { ChevronDown, Share04 } from "@untitledui/icons";
import { Link as AriaLink } from "react-aria-components";
import { Badge } from "@/components/base/badges/badges";
import { cx, sortCx } from "@/utils/cx";

const styles = sortCx({
  root: "group relative flex cursor-pointer items-center rounded-md bg-primary outline-focus-ring transition duration-100 ease-linear select-none hover:bg-primary_hover focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
  rootSelected: "bg-active hover:bg-secondary_hover",
});

interface NavItemBaseProps {
  /** Whether the nav item shows only an icon. */
  iconOnly?: boolean;
  /** Whether the collapsible nav item is open. */
  open?: boolean;
  /** URL to navigate to when the nav item is clicked. */
  href?: string;
  /** Type of the nav item. */
  type: "link" | "collapsible" | "collapsible-child";
  /** Icon component to display. */
  icon?: FC<HTMLAttributes<HTMLOrSVGElement>>;
  /** Badge to display. */
  badge?: ReactNode;
  /** Whether the nav item is currently active. */
  current?: boolean;
  /** Whether to truncate the label text. */
  truncate?: boolean;
  /** Handler for click events. */
  onClick?: MouseEventHandler;
  /** Content to display. */
  children?: ReactNode;
}

export const NavItemBase = ({
  current,
  type,
  badge,
  href,
  icon: Icon,
  children,
  truncate = true,
  onClick,
  open,
}: NavItemBaseProps) => {
  const iconElement = Icon && (
    <Icon
      aria-hidden="true"
      className={cx("mr-2 size-5 shrink-0 text-primary transition-inherit-all")}
    />
  );

  const badgeElement =
    badge && (typeof badge === "string" || typeof badge === "number") ? (
      <Badge className="ml-3" color="gray" type="pill-color" size="sm">
        {badge}
      </Badge>
    ) : (
      badge
    );

  const labelElement = (
    <span
      className={cx(
        "flex-1 text-left text-sm font-semibold text-primary transition-inherit-all",
        truncate && "truncate",
      )}
    >
      {children}
    </span>
  );

  const isExternal = href && href.startsWith("http");
  const externalIcon = isExternal && (
    <Share04 className="size-4 stroke-[2.5px] text-primary" />
  );

  if (type === "collapsible") {
    // We are using a <button> instead of <summary> because we are no longer using <details>
    return (
      <button
        type="button"
        className={cx(
          "w-full px-3 py-2",
          styles.root,
          current && styles.rootSelected,
        )}
        onClick={onClick}
      >
        {iconElement}
        {labelElement}
        {badgeElement}

        <ChevronDown
          aria-hidden="true"
          className={cx(
            "ml-3 size-4 shrink-0 stroke-[2.5px] text-primary transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>
    );
  }

  if (type === "collapsible-child") {
    return (
      <AriaLink
        href={href!}
        target={isExternal ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className={cx(
          "py-2 pr-3 pl-10",
          styles.root,
          current && styles.rootSelected,
        )}
        onClick={onClick}
        aria-current={current ? "page" : undefined}
      >
        {labelElement}
        {externalIcon}
        {badgeElement}
      </AriaLink>
    );
  }

  return (
    <AriaLink
      href={href!}
      target={isExternal ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className={cx("px-3 py-2", styles.root, current && styles.rootSelected)}
      onClick={onClick}
      aria-current={current ? "page" : undefined}
    >
      {iconElement}
      {labelElement}
      {externalIcon}
      {badgeElement}
    </AriaLink>
  );
};
