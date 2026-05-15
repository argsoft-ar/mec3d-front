import { Search, X } from "lucide-react";
import "./FilterPanel.css";

export interface FilterState {
  search: string;
  priceMin: string;
  priceMax: string;
  rating: number;
  sortBy: "relevance" | "price_asc" | "price_desc" | "rating" | "downloads";
}

export const DEFAULT_FILTER_STATE: FilterState = {
  search: "",
  priceMin: "",
  priceMax: "",
  rating: 0,
  sortBy: "relevance",
};

interface FilterPanelProps {
  state: FilterState;
  onChange: (next: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SORT_OPTIONS: { value: FilterState["sortBy"]; label: string }[] = [
  { value: "relevance", label: "Relevancia" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "rating", label: "Mejor calificados" },
  { value: "downloads", label: "Más descargados" },
];

function FilterPanel({ state, onChange, isOpen, onClose }: FilterPanelProps) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onChange({ ...state, [key]: value });

  const handleRatingStar = (star: number) => {
    set("rating", state.rating === star ? 0 : star);
  };

  const handleReset = () => onChange({ ...DEFAULT_FILTER_STATE });

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`filter-panel__backdrop${isOpen ? " filter-panel__backdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`filter-panel${isOpen ? " filter-panel--open" : ""}`}
        aria-label="Filtros"
      >
        <div className="filter-panel__header">
          <span className="filter-panel__heading">Filtros</span>
          <button
            className="filter-panel__close"
            onClick={onClose}
            aria-label="Cerrar filtros"
            type="button"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Search */}
        <div className="filter-panel__section filter-panel__section--search">
          <label className="filter-panel__label" htmlFor="filter-search">
            Buscar
          </label>
          <div className="filter-panel__input-icon-wrapper">
            <Search
              className="filter-panel__input-icon"
              size={16}
              strokeWidth={1.5}
            />
            <input
              id="filter-search"
              className="filter-panel__input filter-panel__input--with-icon"
              type="text"
              placeholder="Buscar productos..."
              value={state.search}
              onChange={(e) => set("search", e.target.value)}
            />
          </div>
        </div>

        {/* Price range */}
        <div className="filter-panel__section">
          <span className="filter-panel__label">Precio</span>
          <div className="filter-panel__price-row">
            <div className="filter-panel__price-field">
              <label
                className="filter-panel__sublabel"
                htmlFor="filter-price-min"
              >
                Mínimo
              </label>
              <input
                id="filter-price-min"
                className="filter-panel__input"
                type="number"
                min="0"
                placeholder="0"
                value={state.priceMin}
                onChange={(e) => set("priceMin", e.target.value)}
              />
            </div>
            <div className="filter-panel__price-field">
              <label
                className="filter-panel__sublabel"
                htmlFor="filter-price-max"
              >
                Máximo
              </label>
              <input
                id="filter-price-max"
                className="filter-panel__input"
                type="number"
                min="0"
                placeholder="∞"
                value={state.priceMax}
                onChange={(e) => set("priceMax", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="filter-panel__section">
          <span className="filter-panel__label">Calificación mínima</span>
          <div
            className="filter-panel__stars"
            role="group"
            aria-label="Calificación mínima"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`filter-panel__star${state.rating >= star ? " filter-panel__star--active" : ""}`}
                onClick={() => handleRatingStar(star)}
                aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
                aria-pressed={state.rating === star}
              >
                {state.rating >= star ? "★" : "☆"}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="filter-panel__section">
          <label className="filter-panel__label" htmlFor="filter-sort">
            Ordenar por
          </label>
          <select
            id="filter-sort"
            className="filter-panel__select"
            value={state.sortBy}
            onChange={(e) =>
              set("sortBy", e.target.value as FilterState["sortBy"])
            }
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset */}
        <div className="filter-panel__section filter-panel__section--reset">
          <button
            type="button"
            className="filter-panel__reset"
            onClick={handleReset}
          >
            Limpiar filtros
          </button>
        </div>
      </aside>
    </>
  );
}

export default FilterPanel;
