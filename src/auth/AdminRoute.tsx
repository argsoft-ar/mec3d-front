import { Navigate, Outlet } from "react-router-dom";
import { puedeVerAdmin } from "../utils/admin-access.util";

function AdminRoute() {
  if (!puedeVerAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
