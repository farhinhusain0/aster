import React from "react";
import { Button, type ButtonProps } from "@/components/base/buttons/button";
import Typography from "./Typography";
import { Dialog, Modal, ModalOverlay } from "../application/modals/modal";
import { Heading } from "react-aria-components";
import { cx } from "@/utils/cx";
import { CloseButton } from "../base/buttons/close-button";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  title: string;
  description?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: "primary" | "primary-destructive";
  confirmButtonLoading?: boolean;
  confirmButtonDisabled?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onSubmit,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonColor = "primary-destructive",
  confirmButtonLoading = false,
  confirmButtonDisabled = false,
}) => {
  return (
    <ModalOverlay
      isOpen={open}
      shouldCloseOnInteractOutside={(element) => Boolean(element)}
      onOpenChange={onClose}
      isKeyboardDismissDisabled={false}
      isDismissable={true}
    >
      <Modal>
        <Dialog>
          <div className="bg-primary rounded-2xl p-6 shadow-xl flex flex-col gap-5 max-w-confirmation-modal w-full">
            <Heading
              slot="title"
              className="flex flex-col gap-0.5 justify-start align-start"
            >
              <Typography variant="md/semibold" className="text-primary">
                {title}
              </Typography>
              {typeof description === "string" ? (
                <Typography variant="sm/normal" className="text-tertiary">
                  {description}
                </Typography>
              ) : (
                description && (
                  <div className="text-tertiary text-sm font-normal">
                    {description}
                  </div>
                )
              )}
            </Heading>
            <div className="flex flex-row justify-end items-center gap-3">
              <Button size="sm" color="secondary" onClick={onClose}>
                {cancelText}
              </Button>
              {onSubmit && confirmText && (
                <Button
                  size="sm"
                  color={confirmButtonColor}
                  onClick={onSubmit}
                  isDisabled={confirmButtonDisabled}
                  isLoading={confirmButtonLoading}
                >
                  {confirmText}
                </Button>
              )}
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
};

interface GenericModalProps {
  title?: string;
  primaryButtonProps?: ButtonProps;
  secondaryButtonProps?: ButtonProps;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  open: boolean;
  onClose: () => void;
  onPrimaryButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
  children?: React.ReactNode;
  hasError?: boolean;
  variant?: "base" | "confirmation" | "change-password";
}

export const GenericModal: React.FC<GenericModalProps> = ({
  open,
  onClose,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  title,
  primaryButtonText,
  secondaryButtonText = "Cancel",
  secondaryButtonProps,
  primaryButtonProps,
  children,
  hasError = false,
  variant = "base",
}) => {
  const widthClass =
    variant === "base"
      ? "max-w-generic-modal"
      : variant === "confirmation"
        ? "max-w-confirmation-modal"
        : variant === "change-password"
        ? "max-w-change-password-modal"
        : "max-w-invite-members-modal";

  return (
    <ModalOverlay
      isOpen={open}
      shouldCloseOnInteractOutside={(element) => Boolean(element)}
      onOpenChange={onClose}
      isKeyboardDismissDisabled={false}
      isDismissable={true}
    >
      <Modal>
        <Dialog>
          <div
            className={cx(
              "bg-primary rounded-2xl p-6 shadow-xl flex flex-col gap-5 w-full relative",
              widthClass,
            )}
          >
            <CloseButton
              onClick={onClose}
              size="sm"
              className={"absolute top-4 right-3"}
            />

            {title && (
              <Heading
                slot="title"
                className="flex flex-col gap-0.5 justify-start align-start"
              >
                <Typography variant="md/semibold" className="text-primary">
                  {title}
                </Typography>
              </Heading>
            )}

            {children}
            <div className="flex flex-row justify-end items-center gap-3">
              <Button
                size="sm"
                color="secondary"
                onClick={onSecondaryButtonClick || onClose}
                {...secondaryButtonProps}
              >
                {secondaryButtonText}
              </Button>
              {onPrimaryButtonClick && primaryButtonText && (
                <Button
                  size="sm"
                  color={"primary"}
                  onClick={onPrimaryButtonClick}
                  isDisabled={hasError}
                  {...primaryButtonProps}
                >
                  {primaryButtonText}
                </Button>
              )}
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
};
