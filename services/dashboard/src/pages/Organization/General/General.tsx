import { useMe } from "@/api/queries/auth";
import { InformationCard } from "./components/InformationCard";
import OrganizationContentContainer from "../components/OrganizationContentContainer";
import useDocumentTitle from "@/hooks/documentTitle";

export const OrganizationGeneralPage = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  useDocumentTitle("General | Aster");
  const { data: user, isPending } = useMe();

  const organization = user?.organization;

  if (isPending) {
    return null;
  }

  return (
    <OrganizationContentContainer title="General">
      <InformationCard organization={organization} key={organization?._id} />
      {children}
    </OrganizationContentContainer>
  );
};
