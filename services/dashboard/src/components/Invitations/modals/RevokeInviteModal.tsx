import { ConfirmationModal } from "@/components/common/Modals";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  email: string;
}

const RevokeInviteModal = ({ open, onClose, onSubmit, email }: Props) => {
  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={`Revoke invite for ${email}?`}
      description="They'll no longer be able to join your organization."
      confirmText="Revoke"
      cancelText="Cancel"
      confirmButtonColor="primary-destructive"
    />
  );
};

export { RevokeInviteModal };
