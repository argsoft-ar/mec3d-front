import { useMemo, useSyncExternalStore } from "react";
import {
  getCurrentUser,
  getSessionSnapshot,
  onSessionChanged,
} from "../services/session";
import type { RolUsuario, UsuarioPublico } from "../interfaces";

interface UseSessionReturn {
  isAuthenticated: boolean;
  user: UsuarioPublico | null;
  rol: RolUsuario | null;
}

// También escucha `storage` para reflejar login/logout hechos en otra pestaña.
function subscribe(listener: () => void): () => void {
  const unsubscribe = onSessionChanged(listener);
  window.addEventListener("storage", listener);
  return () => {
    unsubscribe();
    window.removeEventListener("storage", listener);
  };
}

export function useSession(): UseSessionReturn {
  const snapshot = useSyncExternalStore(subscribe, getSessionSnapshot);

  return useMemo(() => {
    const [token] = snapshot.split("|", 1);
    const isAuthenticated = token !== "";
    const user = isAuthenticated ? getCurrentUser() : null;
    return { isAuthenticated, user, rol: user?.rolPrincipal ?? null };
  }, [snapshot]);
}
