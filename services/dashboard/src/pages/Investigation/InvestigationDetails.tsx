import { Navigate, useParams } from "react-router-dom";
import {
  InvestigationDetailsLeftPanel,
  InvestigationDetailsRightPanel,
} from "@/components/InvestigationDetails";
import { useInvestigation } from "@/api/queries/investigations";
import useDocumentTitle from "@/hooks/documentTitle";

function InvestigationDetails() {
  useDocumentTitle("Investigation details | Aster");
  const { id, checkId } = useParams();
  const { data: investigation, isPending } = useInvestigation(id || "");

  if (isPending) {
    return null;
  } else if (!investigation) {
    return <Navigate to={"/investigations"} />;
  }

  return (
    <div className=" w-256 mx-auto">
      <div className="flex gap-10">
        <div className="flex-1 min-w-0 max-w-140">
          <InvestigationDetailsLeftPanel />
        </div>

        {checkId && (
          <div className="flex-shrink-0 ">
            <InvestigationDetailsRightPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export { InvestigationDetails };
