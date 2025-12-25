import { cx } from "@/utils/cx";

const sizeVariants = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-md",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "display-xs": "text-display-xs",
  "display-sm": "text-display-sm",
  "display-md": "text-display-md",
  "display-lg": "text-display-lg",
  "display-xl": "text-display-xl",
  "display-2xl": "text-display-2xl",
};

const weightVariants = {
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  variant?: `${keyof typeof sizeVariants}/${keyof typeof weightVariants}`;
}

export default function Typography({
  children,
  className = "",
  variant = "md/normal",
}: TypographyProps) {
  const [fontSize, fontWeight] = variant.split("/");
  return (
    <div
      className={cx(
        sizeVariants[fontSize as keyof typeof sizeVariants],
        weightVariants[fontWeight as keyof typeof weightVariants],
        className,
      )}
    >
      {children}
    </div>
  );
}
