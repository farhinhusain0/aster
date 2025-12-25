import { cx } from "@/utils/cx";
import { AnimatePresence, motion } from "motion/react";

const colors = {
  error: "text-error-600",
  warning: "text-warning-600",
  info: "text-info-600",
  success: "text-success-600",
};

const sizes = {
  sm: "text-sm",
  md: "text-md",
  lg: "text-lg",
};

interface FormHintProps {
  children?: React.ReactNode;
  className?: string;
  open?: boolean;
  color?: keyof typeof colors;
  size?: keyof typeof sizes;
}

export default function FormHint({
  className,
  children,
  open,
  color = "error",
  size = "sm",
}: FormHintProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: 1, 
            height: "auto",
            transition: { duration: 0.2, ease: [0.1, 0.5, 1, 1] }
          }}
          exit={{ 
            opacity: 0, 
            height: 0,
            transition: { duration: 0.2, ease: [0.4, 0, 1, 1], delay: 0.05 }
          }}
          className={cx(className, colors[color], sizes[size])}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
