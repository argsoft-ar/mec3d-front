import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import type { LoginLocationState } from "../interfaces";

function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated } = useSession();

  if (!isAuthenticated) {
    const state: LoginLocationState = {
      from: `${location.pathname}${location.search}${location.hash}`,
    };
    return <Navigate to="/login" replace state={state} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
