import { INVESTIGATIONS_PATH } from "@/routes/paths";
import { Navigate } from "react-router-dom";

function HomePage() {
  return <Navigate to={INVESTIGATIONS_PATH} replace />;
}

export { HomePage };
