import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  createContext,
  forwardRef,
  useContext,
} from "react";
import { cx } from "@/utils/cx";
import { ChevronDown } from "@untitledui/icons";
import Typography from "@/components/common/Typography";

type AccordionSize = "xs" | "sm";

const AccordionSizeContext = createContext<AccordionSize>("sm");
const useAccordionSize = () => useContext(AccordionSizeContext);

const triggerSizeStyles: Record<AccordionSize, string> = {
  xs: "px-4 py-2",
  sm: "px-5 py-2.5",
};

const typographyVariant: Record<
  AccordionSize,
  `${"xs" | "sm"}/${"medium" | "semibold"}`
> = {
  xs: "xs/medium",
  sm: "sm/medium",
};

const chevronSize: Record<AccordionSize, number> = {
  xs: 16,
  sm: 16,
};

type AccordionProps = ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Root
> & {
  size?: AccordionSize;
};

const Accordion = forwardRef<
  ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(({ className, size = "sm", ...props }, ref) => (
  <AccordionSizeContext.Provider value={size}>
    <AccordionPrimitive.Root
      ref={ref}
      className={cx("rounded-xl border border-secondary", className)}
      {...props}
    />
  </AccordionSizeContext.Provider>
));
Accordion.displayName = "Accordion";

const AccordionItem = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cx(
      "overflow-hidden first:rounded-t-xl last:rounded-b-xl [&:last-child[data-state=closed]_button]:border-b-0",
      className,
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const size = useAccordionSize();
  return (
    <AccordionPrimitive.Header asChild>
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cx(
          "group flex items-center justify-between w-full cursor-pointer bg-gray-50 border-b border-secondary",
          triggerSizeStyles[size],
          className,
        )}
        {...props}
      >
        {typeof children === "string" ? (
          <Typography
            variant={typographyVariant[size]}
            className="text-tertiary"
          >
            {children}
          </Typography>
        ) : (
          children
        )}
        <ChevronDown
          className="transition-transform duration-200 group-data-[state=open]:rotate-180 text-quaternary"
          size={chevronSize[size]}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = forwardRef<
  ElementRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cx("overflow-hidden border-b border-secondary", className)}
    {...props}
  />
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
export type { AccordionSize };
