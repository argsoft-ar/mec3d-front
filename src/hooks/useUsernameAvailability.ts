import { useEffect, useRef, useState } from "react";
import { usuarioService } from "../services/usuario.service";

export type UsernameAvailabilityStatus =
  | "idle"
  | "invalid"
  | "checking"
  | "available"
  | "taken";

interface UseUsernameAvailabilityReturn {
  status: UsernameAvailabilityStatus;
}

interface CheckResult {
  value: string;
  result: "available" | "taken";
}

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const DEBOUNCE_MS = 400;

export function useUsernameAvailability(
  username: string,
  currentUsername: string,
): UseUsernameAvailabilityReturn {
  const [check, setCheck] = useState<CheckResult | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  const trimmed = username.trim();
  const isUnchanged = !trimmed || trimmed === currentUsername;
  const isValidFormat = USERNAME_REGEX.test(trimmed);
  const shouldCheck = !isUnchanged && isValidFormat;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!shouldCheck) return;

    let cancelled = false;
    debounceRef.current = window.setTimeout(() => {
      usuarioService
        .checkUsernameDisponible(trimmed)
        .then((res) => {
          if (cancelled) return;
          setCheck({
            value: trimmed,
            result: res.disponible ? "available" : "taken",
          });
        })
        .catch(() => {
          /* ignore, falls back to "checking" until user edits again */
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [trimmed, shouldCheck]);

  let status: UsernameAvailabilityStatus;
  if (isUnchanged) status = "idle";
  else if (!isValidFormat) status = "invalid";
  else if (check && check.value === trimmed) status = check.result;
  else status = "checking";

  return { status };
}
