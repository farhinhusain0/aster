import { ConfirmationModal } from "@/components/common/Modals";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const DeleteMemberModal = ({ open, onClose, onSubmit }: Props) => {
  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Delete member?"
      description="They'll no longer be able to join your organization."
      confirmText="Delete"
      cancelText="Cancel"
      confirmButtonColor="primary-destructive"
    />
  );
};

export { DeleteMemberModal };
