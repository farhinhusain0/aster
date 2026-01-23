import { Invitations } from "@/components/Invitations";
import OrganizationContentContainer from "../components/OrganizationContentContainer";
import useDocumentTitle from "@/hooks/documentTitle";
import ContentContainerCard from "@/components/common/ContentContainerCard";
import { Input } from "@/components/base/input/input";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Trash01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { ReactNode } from "react";

export function InviteMembersCard() {
  return (
    <ContentContainerCard>
      <ContentContainerCard.Header>INVITE MEMBERS</ContentContainerCard.Header>
      <div className="px-6 py-5">
        <div className="flex gap-2 pb-4">
          <div className="w-95">
            <Input size="sm" placeholder="name@company.com" />
          </div>
          <ButtonUtility
            className="p-2.5"
            size="xs"
            color="secondary"
            tooltip="Delete"
            icon={Trash01}
          />
        </div>

        <div className="flex gap-2 pb-4">
          <div className="w-95">
            <Input size="sm" placeholder="name@company.com" />
          </div>
          <ButtonUtility
            className="p-2.5"
            size="xs"
            color="secondary"
            tooltip="Delete"
            icon={Trash01}
          />
        </div>

        <div className="flex gap-2 pb-4">
          <div className="w-95">
            <Input size="sm" placeholder="name@company.com" />
          </div>
          <ButtonUtility
            className="p-2.5"
            size="xs"
            color="secondary"
            tooltip="Delete"
            icon={Trash01}
          />
        </div>
        <div>
          <Button size="sm" color="link-color">
            Add another
          </Button>
        </div>
      </div>

      <ContentContainerCard.Footer>
        <Button>Invite</Button>
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
      <InviteMembersCard />
      <Invitations />
    </OrganizationMembersContainer>
  );
};
