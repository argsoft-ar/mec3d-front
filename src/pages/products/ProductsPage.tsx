import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Header from "../../components/Header/Header";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import ProductCard from "../../components/ProductCard/ProductCard";
import ProductCardSkeleton from "../../components/ProductCard/ProductCardSkeleton";
import FilterPanel, {
  DEFAULT_FILTER_STATE,
} from "../../components/Filter/FilterPanel";
import type { FilterState } from "../../components/Filter/FilterPanel";
import type { BreadcrumbItem } from "../../components/Breadcrumb/Breadcrumb";
import { productService } from "../../services/product.service";
import type { Product } from "../../interfaces/product.interface";
import "./ProductsPage.css";

const SKELETON_COUNT = 8;

function applyFilters(products: Product[], filters: FilterState): Product[] {
  let result = [...products];

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }

  if (filters.priceMin !== "") {
    const min = parseFloat(filters.priceMin);
    if (!isNaN(min)) result = result.filter((p) => p.price >= min);
  }

  if (filters.priceMax !== "") {
    const max = parseFloat(filters.priceMax);
    if (!isNaN(max)) result = result.filter((p) => p.price <= max);
  }

  if (filters.rating > 0) {
    result = result.filter((p) => p.rating >= filters.rating);
  }

  switch (filters.sortBy) {
    case "price_asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "downloads":
      result.sort((a, b) => b.downloads - a.downloads);
      break;
    default:
      break;
  }

  return result;
}

function ProductsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get("category") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTER_STATE,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    productService
      .getAll()
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => applyFilters(products, filters),
    [products, filters],
  );

  const breadcrumbItems: BreadcrumbItem[] = category
    ? [
        { label: "Inicio", path: "/" },
        { label: "Explorar", path: "/explore" },
        { label: category },
      ]
    : [{ label: "Inicio", path: "/" }, { label: "Explorar" }];

  return (
    <Layout>
      <Breadcrumb items={breadcrumbItems} />

      {category ? (
        <Header
          title="Categoría:"
          accentText={category}
          subtitle="Explorá todos los productos en esta categoría."
        />
      ) : (
        <Header
          title="Explorar"
          accentText="piezas 3D"
          subtitle="Descubrí miles de diseños listos para imprimir."
        />
      )}

      <FilterPanel
        state={filters}
        onChange={setFilters}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="products-page__body">
        <div className="products-page__content">
          <div className="products-page__toolbar">
            <button
              type="button"
              className="products-page__filters-toggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir filtros"
            >
              <SlidersHorizontal size={16} strokeWidth={1.5} />
              Filtros
            </button>

            {!loading && (
              <p className="products-page__count">
                {filtered.length}{" "}
                {filtered.length === 1 ? "resultado" : "resultados"}
              </p>
            )}
          </div>

          {loading ? (
            <div className="products-page__grid">
              {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="products-page__empty">
              <p className="products-page__empty-title">
                No se encontraron productos
              </p>
              <p className="products-page__empty-subtitle">
                Intentá ajustar los filtros o buscar otro término.
              </p>
            </div>
          ) : (
            <div className="products-page__grid">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  imageUrl={product.imageUrl}
                  title={product.title}
                  description={product.description}
                  rating={product.rating}
                  downloads={product.downloads}
                  price={product.price}
                  onClick={() => navigate(`/product/${product.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ProductsPage;
