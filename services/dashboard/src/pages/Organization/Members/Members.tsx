import { Invitations } from "@/components/Invitations";
import OrganizationContentContainer from "../components/OrganizationContentContainer";
import useDocumentTitle from "@/hooks/documentTitle";

export const OrganizationMembersPage = () => {
  useDocumentTitle('Members | Aster');
  return (
    <OrganizationContentContainer title="Members">
      <Invitations />
    </OrganizationContentContainer>
  );
};
