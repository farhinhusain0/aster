import { useState, useCallback, useEffect, useRef } from "react";

interface UseDisclosureProps {
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  animationDuration?: number; // in milliseconds, default 300ms
  onShouldRenderChange?: (shouldRender: boolean) => void;
}

interface UseDisclosureReturn {
  // Core state
  isOpen: boolean;
  shouldRender: boolean; // Controls DOM rendering (true during open + animation)

  // Actions
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;

  // For manual control (advanced usage)
  setIsOpen: (open: boolean) => void;
}

export function useDisclosure(
  {
    defaultOpen = false,
    onOpenChange,
    onShouldRenderChange,
    animationDuration = 300,
  }: UseDisclosureProps = { animationDuration: 300 },
): UseDisclosureReturn {
  const [isOpen, setIsOpenState] = useState(defaultOpen);
  const [shouldRender, setShouldRender] = useState(defaultOpen);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const onOpen = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setShouldRender(true); // Show in DOM first
    // Small delay to ensure DOM is ready for animation
    setTimeout(() => setIsOpenState(true), 10);
    onOpenChange?.(true);
    onShouldRenderChange?.(true);
  }, [onOpenChange, onShouldRenderChange]);

  const onClose = useCallback(() => {
    setIsOpenState(false); // Start exit animation
    onOpenChange?.(false);
    // Hide from DOM after animation completes
    timeoutRef.current = setTimeout(() => {
      setShouldRender(false);
      onShouldRenderChange?.(false);
    }, animationDuration);
  }, [onOpenChange, animationDuration, onShouldRenderChange]);

  const onToggle = useCallback(() => {
    isOpen ? onClose() : onOpen();
  }, [isOpen, onOpen, onClose]);

  const setIsOpen = useCallback(
    (open: boolean) => {
      open ? onOpen() : onClose();
    },
    [onOpen, onClose],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return {
    isOpen,
    shouldRender,
    onOpen,
    onClose,
    onToggle,
    setIsOpen,
  };
}
