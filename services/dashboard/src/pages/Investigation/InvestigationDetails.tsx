import { useInvestigation } from "@/api/queries/investigations";
import {
  InvestigationDetailsLeftPanel,
  InvestigationDetailsRightPanel,
} from "@/components/InvestigationDetails/InvestigationDetails";
import useDocumentTitle from "@/hooks/documentTitle";
import { Navigate, useParams } from "react-router-dom";
import {
  IntegrationDetailsEvidenceChain,
  InvestigationDetailsHeader,
  InvestigationDetailsVerdict,
} from "./components";

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
        {/* Added a large mb so that the last card have a bottom space to breath */}
        <div className="max-w-investigation-content w-full flex flex-col gap-5 mx-auto mb-50">
          <InvestigationDetailsVerdict />
          <IntegrationDetailsEvidenceChain />
        </div>
        {/* <div className="max-w-investigation-right-sidebar w-full">
          Right sidebar components here
        </div> */}
      </div>
    </div>
  );
}

export { InvestigationDetails };
