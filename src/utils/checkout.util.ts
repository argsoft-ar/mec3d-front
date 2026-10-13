// Dominios de Mercado Pago a los que se permite redirigir; sus subdominios
// (www., sandbox., etc.) quedan cubiertos por la comparación de sufijo.
const TRUSTED_CHECKOUT_DOMAINS = [
  "mercadopago.com",
  "mercadopago.com.ar",
  "mercadolibre.com",
] as const;

function isTrustedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return TRUSTED_CHECKOUT_DOMAINS.some(
    (domain) => host === domain || host.endsWith(`.${domain}`),
  );
}

/** true solo para URLs https (sin credenciales ni puerto) de un host de Mercado Pago. */
export function isTrustedCheckoutUrl(
  value: string | null | undefined,
): value is string {
  if (!value) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return (
    url.protocol === "https:" &&
    !url.username &&
    !url.password &&
    url.port === "" &&
    isTrustedHostname(url.hostname)
  );
}
