export function getProvinciaPrefix(zonaId: number): string | null {
  const codigo = String(zonaId);
  if (codigo.length === 8 || codigo.length === 5) return codigo.substring(0, 2);
  if (codigo.length === 7 || codigo.length === 4)
    return `0${codigo.substring(0, 1)}`;
  return null;
}

export function getPartidoPrefix(zonaId: number): string | null {
  const codigo = String(zonaId);
  if (codigo.length === 8) return codigo.substring(0, 5);
  if (codigo.length === 7) return `0${codigo.substring(0, 4)}`;
  return null;
}
