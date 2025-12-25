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
      title="Delete member"
      description="Are you sure you want to delete this member?"
      confirmText="Delete member"
      cancelText="Cancel"
      confirmButtonColor="primary-destructive"
    />
  );
};

export { DeleteMemberModal };
