import { Invitations } from "@/components/Invitations";
import OrganizationContentContainer from "../components/OrganizationContentContainer";
import useDocumentTitle from "@/hooks/documentTitle";
import { ReactNode } from "react";
import ContentContainerCard from "@/components/common/ContentContainerCard";
import { Button } from "@/components/base/buttons/button";
import { useInviteUsers } from "@/api/queries/invite";
import { invalidateOrgUsersQuery } from "@/api/queries/users";
import { toast } from "react-hot-toast";
import { invalidateMe } from "@/api/queries/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useEmailStore } from "@/components/Invitations/store";
import { InviteMembers } from "@/components/Invitations";

export function InviteMembersCard({ children }: { children: ReactNode }) {
  const { mutateAsync: inviteUsers } = useInviteUsers();
  const queryClient = useQueryClient();
  const { invalidEmails, isAllEmailsEmpty, getValidEmails, resetEmails } =
    useEmailStore();

  const validEmailsCount = getValidEmails().length;
  const isInviteDisabled =
    invalidEmails.length > 0 || isAllEmailsEmpty || validEmailsCount === 0;

  const handleInviteUsers = async () => {
    try {
      const validEmails = getValidEmails();

      if (validEmailsCount === 0) {
        return;
      }

      const emails = validEmails.map((email) => email.text);
      const promise = inviteUsers(emails);
      const messages =
        emails.length > 1
          ? {
              loading: "Sending invites...",
              success: "Invites sent.",
              error: "Invites failed.",
            }
          : {
              loading: "Sending invite.",
              success: "Invite sent.",
              error: "Invite failed.",
            };
      toast.promise(promise, messages);

      await promise;
      resetEmails();
      invalidateOrgUsersQuery(queryClient);
      invalidateMe(queryClient);
    } catch (error) {
      console.error(`Error inviting users: ${error}`);
    }
  };
  return (
    <ContentContainerCard>
      <ContentContainerCard.Header>INVITE MEMBERS</ContentContainerCard.Header>
      {children}
      <ContentContainerCard.Footer>
        <Button onClick={handleInviteUsers} isDisabled={isInviteDisabled}>
          Invite
        </Button>
      </ContentContainerCard.Footer>
    </ContentContainerCard>
  );
}

export function OrganizationMembersContainer({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <OrganizationContentContainer title="Members">
      {children}
    </OrganizationContentContainer>
  );
}

export const OrganizationMembersPage = () => {
  useDocumentTitle("Members | Aster");

  return (
    <OrganizationMembersContainer>
      <InviteMembersCard>
        <InviteMembers />
      </InviteMembersCard>
      <Invitations />
    </OrganizationMembersContainer>
  );
};
