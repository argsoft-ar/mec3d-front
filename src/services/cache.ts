const PREFIX = "mec3d_";
// Claves internas tipo "user:profile" / "georef:provincias": charset cerrado y largo acotado.
const SAFE_KEY = /^[A-Za-z0-9_.:-]{1,100}$/;
const MAX_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ENTRY_LENGTH = 512 * 1024;
const FORBIDDEN_PROPS = new Set(["__proto__", "constructor", "prototype"]);

// Límites de la estructura que se acepta persistir (perfil, provincias, flags).
const MAX_DEPTH = 8;
const MAX_ARRAY_LENGTH = 5000;
const MAX_OBJECT_KEYS = 200;
const MAX_STRING_LENGTH = 10_000;
// Nombres de propiedad tipo identificador (camelCase de los DTO); nada de rutas ni símbolos.
const SAFE_PROP = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
// Caracteres de control (salvo \t \n \r): no tienen uso legítimo en los datos cacheados.
const CONTROL_CHARS = /(?![\t\n\r])\p{Cc}/u;

type StorableValue =
  | null
  | boolean
  | number
  | string
  | StorableValue[]
  | { [key: string]: StorableValue };

/** Marca de valor no persistible (distinta de cualquier valor JSON válido). */
const INVALID: unique symbol = Symbol("invalid");

interface Entry<T> {
  data: T;
  expiresAt: number;
}

/** Clave final en storage, o null si la clave no respeta el charset permitido (se rechaza, no se "limpia"). */
function storageKey(key: string): string | null {
  return typeof key === "string" && SAFE_KEY.test(key) ? PREFIX + key : null;
}

function isEntry(value: unknown): value is Entry<unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const { expiresAt } = value as { expiresAt?: unknown };
  return (
    Object.hasOwn(value, "data") &&
    typeof expiresAt === "number" &&
    Number.isFinite(expiresAt)
  );
}

function isPlainObject(value: object): boolean {
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function sanitizeString(value: string): string | typeof INVALID {
  return value.length <= MAX_STRING_LENGTH && !CONTROL_CHARS.test(value)
    ? value
    : INVALID;
}

function sanitizeArray(
  value: unknown[],
  depth: number,
): StorableValue[] | typeof INVALID {
  if (value.length > MAX_ARRAY_LENGTH) return INVALID;
  const result: StorableValue[] = [];
  for (const item of value) {
    const clean = sanitizeStorable(item, depth + 1);
    if (clean === INVALID) return INVALID;
    result.push(clean);
  }
  return result;
}

function sanitizeObject(
  value: object,
  depth: number,
): { [key: string]: StorableValue } | typeof INVALID {
  if (!isPlainObject(value)) return INVALID;
  const entries = Object.entries(value);
  if (entries.length > MAX_OBJECT_KEYS) return INVALID;
  const result: [string, StorableValue][] = [];
  for (const [prop, item] of entries) {
    // Se omiten (como JSON.stringify) las propiedades undefined.
    if (item === undefined) continue;
    if (FORBIDDEN_PROPS.has(prop) || !SAFE_PROP.test(prop)) return INVALID;
    const clean = sanitizeStorable(item, depth + 1);
    if (clean === INVALID) return INVALID;
    result.push([prop, clean]);
  }
  // fromEntries define propiedades propias: nunca toca el prototype.
  return Object.fromEntries(result);
}

/**
 * Reconstruye `value` como estructura JSON NUEVA y acotada (solo null, boolean, number
 * finito, string sin caracteres de control, arrays y objetos planos con claves tipo
 * identificador). Cualquier otra cosa (funciones, clases, Date, ciclos, profundidad o
 * tamaño excesivos) invalida todo el valor: no se persiste nada "a medias".
 */
function sanitizeStorable(
  value: unknown,
  depth = 0,
): StorableValue | typeof INVALID {
  if (depth > MAX_DEPTH) return INVALID;
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number")
    return Number.isFinite(value) ? value : INVALID;
  if (typeof value === "string") return sanitizeString(value);
  if (Array.isArray(value)) return sanitizeArray(value, depth);
  if (typeof value === "object") return sanitizeObject(value, depth);
  return INVALID;
}

// Descarta claves de prototype pollution al parsear contenido del storage.
function safeReviver(key: string, value: unknown): unknown {
  return FORBIDDEN_PROPS.has(key) ? undefined : value;
}

export function cacheGet<T>(key: string): T | null {
  const storeKey = storageKey(key);
  if (storeKey === null) return null;
  try {
    const raw = sessionStorage.getItem(storeKey);
    if (!raw) return null;
    let entry: unknown;
    try {
      entry =
        raw.length <= MAX_ENTRY_LENGTH ? JSON.parse(raw, safeReviver) : null;
    } catch {
      entry = null;
    }
    const now = Date.now();
    // Entrada corrupta, manipulada (expiresAt fuera del TTL maximo) o vencida: se elimina.
    if (
      !isEntry(entry) ||
      now > entry.expiresAt ||
      entry.expiresAt > now + MAX_TTL_MS
    ) {
      sessionStorage.removeItem(storeKey);
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

/**
 * Persiste `data` solo si la clave pasa la allowlist de charset y el valor se puede
 * reconstruir como estructura JSON acotada; lo que se serializa es esa copia validada
 * (dentro de un sobre con vencimiento), nunca el objeto recibido. Si algo no valida,
 * no se escribe y se borra la entrada previa para no servir datos viejos.
 */
export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  const storeKey = storageKey(key);
  if (storeKey === null || !Number.isFinite(ttlMs) || ttlMs <= 0) return;
  try {
    const clean = sanitizeStorable(data);
    if (clean === INVALID) {
      sessionStorage.removeItem(storeKey);
      return;
    }
    const entry: Entry<StorableValue> = {
      data: clean,
      expiresAt: Date.now() + Math.min(ttlMs, MAX_TTL_MS),
    };
    const serialized = JSON.stringify(entry);
    if (serialized.length > MAX_ENTRY_LENGTH) {
      sessionStorage.removeItem(storeKey);
      return;
    }
    sessionStorage.setItem(storeKey, serialized);
  } catch {
    // storage quota exceeded o private browsing
  }
}

export function cacheDel(key: string): void {
  const storeKey = storageKey(key);
  if (storeKey === null) return;
  try {
    sessionStorage.removeItem(storeKey);
  } catch {
    // storage quota exceeded or private browsing
  }
}

/** Borra todas las entradas de la app (p. ej. perfil) al cerrar sesión. */
export function cacheClear(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // private browsing
  }
}