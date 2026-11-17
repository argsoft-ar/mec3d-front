import type {
  ApiResponse,
  Material,
  PerfilCompleto,
  Provincia,
  RolUsuario,
  Tecnologia,
} from "../interfaces";

/**
 * Validadores puros para lo que se persiste en sessionStorage (evita "storage poisoning").
 * Nunca se guarda la respuesta HTTP tal cual: se reconstruye un objeto NUEVO solo con los
 * campos conocidos y tipados. Si la forma no es la esperada devuelven null (no se cachea /
 * se descarta lo leído).
 */

type UnknownRecord = Record<string, unknown>;

const ROLES: ReadonlySet<string> = new Set<RolUsuario>([
  "comprador",
  "disenador",
  "fabricante",
  "admin",
]);

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || isFiniteNumber(value);
}

function isRol(value: unknown): value is RolUsuario {
  return typeof value === "string" && ROLES.has(value);
}

/** Aplica `sanitizeItem` a cada elemento y descarta los inválidos. */
function sanitizeList<T>(
  value: unknown[],
  sanitizeItem: (item: unknown) => T | null,
): T[] {
  const result: T[] = [];
  for (const item of value) {
    const clean = sanitizeItem(item);
    if (clean !== null) result.push(clean);
  }
  return result;
}

function sanitizeProvincia(value: unknown): Provincia | null {
  if (!isRecord(value)) return null;
  const { id, nombre } = value;
  const idValido =
    typeof id === "string" || (typeof id === "number" && Number.isFinite(id));
  if (!idValido || typeof nombre !== "string") return null;
  return { id: String(id), nombre: String(nombre) };
}

/** `ApiResponse<Provincia[]>` reconstruida, o null si no tiene la forma esperada. */
export function sanitizeProvincias(
  value: unknown,
): ApiResponse<Provincia[]> | null {
  if (!isRecord(value)) return null;
  const { message, data } = value;
  if (typeof message !== "string" || !Array.isArray(data)) return null;
  return {
    message: String(message),
    data: sanitizeList(data, sanitizeProvincia),
  };
}

function sanitizeMaterial(value: unknown): Material | null {
  if (!isRecord(value)) return null;
  const { id, material, materialId, tecnologia, disponible } = value;
  if (
    !isFiniteNumber(id) ||
    typeof material !== "string" ||
    !isFiniteNumber(materialId) ||
    typeof tecnologia !== "string" ||
    typeof disponible !== "boolean"
  )
    return null;
  return { id, material, materialId, tecnologia, disponible };
}

function sanitizeTecnologia(value: unknown): Tecnologia | null {
  if (!isRecord(value)) return null;
  const { id, tecnologia, tecnologiaId, disponible } = value;
  if (
    !isFiniteNumber(id) ||
    typeof tecnologia !== "string" ||
    !isFiniteNumber(tecnologiaId) ||
    typeof disponible !== "boolean"
  )
    return null;
  return { id, tecnologia, tecnologiaId, disponible };
}

const NULLABLE_STRING_FIELDS = [
  "username",
  "cuentaMercadopago",
  "tagline",
  "descripcion",
  "experiencia",
  "telefono",
  "direccion",
] as const;

type NullableStringField = (typeof NULLABLE_STRING_FIELDS)[number];

function hasValidRequiredFields(value: UnknownRecord): boolean {
  return (
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    isRol(value.rolPrincipal) &&
    isNullableNumber(value.zonaId) &&
    isFiniteNumber(value.puntuacion) &&
    typeof value.actualizadoEn === "string" &&
    Array.isArray(value.materiales) &&
    Array.isArray(value.tecnologias) &&
    NULLABLE_STRING_FIELDS.every((field) => isNullableString(value[field]))
  );
}

type OptionalPerfilFields = Pick<
  PerfilCompleto,
  | "cuentaMercadopagoEnCooldown"
  | "cuentaMercadopagoHabilitadaDesde"
  | "georefLocalidadId"
>;

/** Copia los campos opcionales solo si están presentes y con el tipo correcto. */
function optionalFields(value: UnknownRecord): OptionalPerfilFields {
  const result: OptionalPerfilFields = {};
  const {
    cuentaMercadopagoEnCooldown,
    cuentaMercadopagoHabilitadaDesde,
    georefLocalidadId,
  } = value;
  if (typeof cuentaMercadopagoEnCooldown === "boolean")
    result.cuentaMercadopagoEnCooldown = cuentaMercadopagoEnCooldown;
  if (isNullableString(cuentaMercadopagoHabilitadaDesde))
    result.cuentaMercadopagoHabilitadaDesde = cuentaMercadopagoHabilitadaDesde;
  if (isNullableString(georefLocalidadId))
    result.georefLocalidadId = georefLocalidadId;
  return result;
}

/** `PerfilCompleto` reconstruido campo por campo, o null si no tiene la forma esperada. */
export function sanitizePerfilCompleto(value: unknown): PerfilCompleto | null {
  if (!isRecord(value) || !hasValidRequiredFields(value)) return null;
  const v = value as unknown as PerfilCompleto;
  const strings: Pick<PerfilCompleto, NullableStringField> = {
    username: v.username,
    cuentaMercadopago: v.cuentaMercadopago,
    tagline: v.tagline,
    descripcion: v.descripcion,
    experiencia: v.experiencia,
    telefono: v.telefono,
    direccion: v.direccion,
  };
  return {
    id: v.id,
    email: v.email,
    rolPrincipal: v.rolPrincipal,
    zonaId: v.zonaId,
    puntuacion: v.puntuacion,
    actualizadoEn: v.actualizadoEn,
    ...strings,
    ...optionalFields(value),
    materiales: sanitizeList(v.materiales, sanitizeMaterial),
    tecnologias: sanitizeList(v.tecnologias, sanitizeTecnologia),
  };
}
