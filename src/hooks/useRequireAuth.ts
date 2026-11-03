import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSession } from "./useSession";
import type { LoginLocationState } from "../interfaces";

/**
 * `requireAuth(from?)` devuelve true si hay sesión; si no, lleva a /login para volver
 * a `from` (por defecto, la ruta actual) tras autenticarse.
 */
export function useRequireAuth() {
  const { isAuthenticated } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = useCallback(
    (from?: string): boolean => {
      if (isAuthenticated) return true;
      const state: LoginLocationState = {
        from: from ?? `${location.pathname}${location.search}${location.hash}`,
      };
      navigate("/login", { state });
      return false;
    },
    [isAuthenticated, navigate, location],
  );

  return { isAuthenticated, requireAuth };
}
