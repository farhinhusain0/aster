import { InvestigationsTable } from "../../components/InvestigationsTable";
import { useInvestigations } from "@/api/queries/investigations";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import AsterLogo from "@/assets/logo-cat.png";
import useDocumentTitle from "@/hooks/documentTitle";
import { INVESTIGATIONS_LIMIT } from "@/constants";

function Investigations() {
  useDocumentTitle("Investigations | Aster");

  const { data, isPending } = useInvestigations({
    limit: INVESTIGATIONS_LIMIT,
    offset: 0,
  });

  if (isPending) {
    return null;
  }

  if (!data || data.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center max-w-[352px] mt-[250px]">
          <EmptyState.Header>
            <img src={AsterLogo} alt="Empty state" className="w-14 h-14" />
          </EmptyState.Header>
          <div className="z-10">
            <EmptyState.Title>No alerts yet.</EmptyState.Title>
            <EmptyState.Description>
              Aster has not detected any alerts or incidents yet. Check if all
              your integrations have been connected properly.
            </EmptyState.Description>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full h-full min-w-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-primary">Investigations</h1>
        
      </div>
      <div className="-mx-6" >
      <InvestigationsTable />
      </div>
    </div>
  );
}

export { Investigations };
