import { useEffect, type RefObject } from "react";

/**
 * Cierra un desplegable abierto al hacer click o mover el foco fuera de `rootRef`
 * (`returnFocus = false`) o al presionar Escape dentro de él (`returnFocus = true`).
 * `onDismiss` debe ser estable (useCallback).
 */
export function useDropdownDismiss(
  rootRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  onDismiss: (returnFocus: boolean) => void,
): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!isOpen || !root) return;
    const container: HTMLElement = root;

    function handleOutside(event: Event) {
      if (event.target instanceof Node && container.contains(event.target))
        return;
      onDismiss(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      // Evita que un contenedor (p. ej. un modal) también se cierre con el mismo Escape.
      event.stopPropagation();
      onDismiss(true);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("focusin", handleOutside);
    root.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("focusin", handleOutside);
      root.removeEventListener("keydown", handleKeyDown);
    };
  }, [rootRef, isOpen, onDismiss]);
}
