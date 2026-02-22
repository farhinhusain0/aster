import { Navigate, useParams } from "react-router-dom";
import { useInvestigation } from "@/api/queries/investigations";
import useDocumentTitle from "@/hooks/documentTitle";
import {
  InvestigationDetailsHypothesis,
  InvestigationDetailsHeader,
} from "./components";
import {
  InvestigationDetailsLeftPanel,
  InvestigationDetailsRightPanel,
} from "@/components/InvestigationDetails/InvestigationDetails";

function InvestigationDetails() {
  useDocumentTitle("Investigation details | Aster");
  const { id, checkId } = useParams();
  const { data: investigation, isPending } = useInvestigation(id || "");

  if (isPending) {
    return null;
  } else if (!investigation) {
    return <Navigate to={"/investigations"} />;
  }

  if (!investigation.rootCause || !investigation.recommendedFix) {
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

  return (
    <div className="w-full max-w-[952px] mx-auto">
      <InvestigationDetailsHeader />
      <div className="flex gap-5 flex-row mt-5">
        <div className="max-w-investigation-content w-full">
          <InvestigationDetailsHypothesis />
        </div>
        <div className="max-w-investigation-right-sidebar w-full">
          Right sidebar components here
        </div>
      </div>
    </div>
  );
}

export { InvestigationDetails };
