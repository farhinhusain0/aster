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

const DeactivateMemberModal = ({
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
      title="Deactivate member?"
      description={`You are deactivating ${user.name} from the ${organization.name} organization. Deactivation will remove their access to Aster.`}
      confirmText="Deactivate"
      cancelText="Cancel"
      confirmButtonColor="primary-destructive"
    />
  );
};

export { DeactivateMemberModal };
