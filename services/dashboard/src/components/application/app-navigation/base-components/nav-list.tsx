import { useState } from "react";
import { cx } from "@/utils/cx";
import type { NavItemDividerType, NavItemType } from "../config";
import { NavItemBase } from "./nav-item";

interface NavListProps {
  /** URL of the currently active item. */
  activeUrl?: string;
  /** Additional CSS classes to apply to the list. */
  className?: string;
  /** List of items to display. */
  items: (NavItemType | NavItemDividerType)[];
}

export const NavList = ({ activeUrl, items, className }: NavListProps) => {
  // We still need state to manage which sections are open
  const [openSections, setOpenSections] = useState(() => {
    const initialOpenState: { [key: string]: boolean } = {};
    items.forEach((item) => {
      if ("items" in item && item.items && item.label) {
        initialOpenState[item.label] =
          item.open ||
          item.items.some((subItem) => subItem.href === activeUrl);
      }
    });
    return initialOpenState;
  });

  // Function to toggle a section's open/closed state
  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <ul className={cx("mt-4 flex flex-col px-2 lg:px-4", className)}>
      {items.map((item, index) => {
        // Renders a divider
        if ("divider" in item && item.divider) {
          return (
            <li key={index} className="w-full px-0.5 py-2">
              <hr className="h-px w-full border-none bg-border-secondary" />
            </li>
          );
        }

        // Renders a collapsible item
        if ("items" in item && item.items?.length) {
          const isOpen = !!openSections[item.label];
          return (
            <div key={item.label} className="py-0.5">
              <NavItemBase
                href={item.href}
                badge={item.badge}
                icon={item.icon}
                type="collapsible"
                open={isOpen}
                onClick={() => toggleSection(item.label)}
              >
                {item.label}
              </NavItemBase>

              {/* Animate the container's height for a smooth open/close */}
              <div
                className={cx(
                  "overflow-hidden transition-[max-height] duration-500 ease-in-out",
                  isOpen ? "max-h-[500px]" : "max-h-0" // Use max-height for animation
                )}
              >
                <ul className="py-0.5">
                  {item.items.map((childItem, childIndex) => (
                    <li
                      key={childItem.label}
                      className={cx(
                        "py-0.5 transition-all duration-300 ease-in-out",
                        // Classes for the animation states
                        isOpen
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 -translate-y-2"
                      )}
                      // The magic for the cascade effect!
                      style={{
                        transitionDelay: isOpen ? `${childIndex * 50}ms` : "0ms",
                      }}
                    >
                      <NavItemBase
                        href={childItem.href}
                        badge={childItem.badge}
                        type="collapsible-child"
                        current={activeUrl === childItem.href}
                      >
                        {childItem.label}
                      </NavItemBase>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        }

        // Renders a simple link item
        return (
          <li key={item.label} className="py-0.5">
            <NavItemBase
              type="link"
              badge={item.badge}
              icon={item.icon}
              href={item.href}
              current={activeUrl === item.href}
            >
              {item.label}
            </NavItemBase>
          </li>
        );
      })}
    </ul>
  );
};