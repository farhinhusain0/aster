import { ConfirmationModal } from "@/components/common/Modals";
import { IEnrichedUser } from "@/api/calls/users";
import { IOrganization } from "@/api/calls/organizations";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  user: IEnrichedUser;
  organization: IOrganization;
}

const ActivateMemberModal = ({
  open,
  onClose,
  onSubmit,
  user,
  organization,
}: Props) => {
  if (!user || !organization) return null;

  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={`Reactivate ${user.name}?`}
      description={`Activation will allow them to access ${organization.name}.`}
      confirmText="Activate"
      cancelText="Cancel"
      confirmButtonColor="primary"
    />
  );
};

export { ActivateMemberModal };
