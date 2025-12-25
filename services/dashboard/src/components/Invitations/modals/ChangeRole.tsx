import { ConfirmationModal } from "@/components/common/Modals";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  currentRole: string;
}

const ChangeRoleModal = ({ open, onClose, onSubmit, currentRole }: Props) => {
  const roleToggle = { owner: "member", member: "owner" };
  const newRole = roleToggle[currentRole as keyof typeof roleToggle];

  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Change member role?"
      description={`Are you sure you want to change the role to ${newRole === "owner" ? "admin" : "member"}?`}
      confirmText="Change"
      cancelText="Cancel"
      confirmButtonColor="primary-destructive"
    />
  );
};

export { ChangeRoleModal };
