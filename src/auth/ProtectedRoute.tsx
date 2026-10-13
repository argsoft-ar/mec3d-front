import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { LoginLocationState } from "../interfaces";

function ProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("auth_token");

  if (!token) {
    const state: LoginLocationState = {
      from: `${location.pathname}${location.search}${location.hash}`,
    };
    return <Navigate to="/login" replace state={state} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
