import { Navigate, useParams } from "react-router-dom";
import { useInvestigation } from "@/api/queries/investigations";
import useDocumentTitle from "@/hooks/documentTitle";
import {
  InvestigationDetailsHypothesis,
  InvestigationDetailsHeader,
} from "./components";

function InvestigationDetails() {
  useDocumentTitle("Investigation details | Aster");
  const { id } = useParams();
  const { data: investigation, isPending } = useInvestigation(id || "");

  if (isPending) {
    return null;
  } else if (!investigation) {
    return <Navigate to={"/investigations"} />;
  }

  return (
    <div className="w-full max-w-[952px] mx-auto">
      <InvestigationDetailsHeader />
      <div className="flex gap-5 flex-row mt-5">
        <div className="max-w-investigation-content w-full">
          <InvestigationDetailsHypothesis />
        </div>
        <div className="max-w-investigation-right-sidebar w-full">Right sidebar components here</div>
      </div>
    </div>
  );
}

export { InvestigationDetails };
