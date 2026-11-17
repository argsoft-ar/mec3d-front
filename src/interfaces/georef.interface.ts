// Entidades geográficas devueltas por el backend (API Georef de Argentina)
export interface Provincia {
  id: string;
  nombre: string;
}

export interface Departamento {
  id: string;
  nombre: string;
}

export interface Localidad {
  id: string;
  nombre: string;
}

/** Códigos Georef (solo dígitos) elegidos por nivel; se combinan con OR. */
export interface ZonaFiltro {
  provincias: string[];
  departamentos: string[];
  localidades: string[];
}
