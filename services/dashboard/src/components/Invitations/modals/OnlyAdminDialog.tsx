import { ConfirmationModal } from "@/components/common/Modals";

interface Props {
  open: boolean;
  onClose: () => void;
}

const OnlyAdminDialog = ({ open, onClose }: Props) => {
  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      title="Admin required"
      description={`You must have at least one admin in your organization.`}
      cancelText="Cancel"
    />
  );
};

export { OnlyAdminDialog };
