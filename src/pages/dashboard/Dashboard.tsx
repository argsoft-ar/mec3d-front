import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PencilRuler, Package, Star, Eye, Pencil, Trash2 } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import DataTable from "../../components/DataTable/DataTable";
import type {
  ColumnDef,
  TableAction,
} from "../../components/DataTable/DataTable.types";
import type { Product } from "../../interfaces";
import { productService } from "../../services/product.service";
import "./Dashboard.css";

const MOCK_USER_NAME = "Miguel";

const PRODUCT_COLUMNS: ColumnDef<Product>[] = [
  { key: "title", header: "Título" },
  { key: "format", header: "Formato", width: 90, align: "center" },
  {
    key: "price",
    header: "Precio",
    width: 120,
    align: "right",
    renderCell: (value) => `$${Number(value).toLocaleString("es-AR")} ARS`,
  },
  {
    key: "rating",
    header: "Rating",
    width: 90,
    align: "center",
    renderCell: (value) => `⭐ ${value}`,
  },
  {
    key: "downloads",
    header: "Descargas",
    width: 100,
    align: "center",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    productService
      .getAll()
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  const productActions: TableAction<Product>[] = [
    {
      label: "Ver detalle",
      icon: <Eye size={16} strokeWidth={1.5} />,
      color: "info",
      onClick: (row) => navigate(`/product/${row.id}`),
    },
    {
      label: "Editar",
      icon: <Pencil size={16} strokeWidth={1.5} />,
      color: "primary",
      onClick: (row) => navigate(`/dashboard/products/${row.id}/edit`),
    },
    {
      label: "Eliminar",
      icon: <Trash2 size={16} strokeWidth={1.5} />,
      color: "error",
      onClick: (row) => {
        if (window.confirm(`¿Eliminar "${row.title}"?`)) {
          productService
            .remove(row.id)
            .then(() =>
              setProducts((prev) => prev.filter((p) => p.id !== row.id)),
            )
            .catch((err) => console.error(err));
        }
      },
    },
  ];

  return (
    <Layout>
      <div className="dashboard">
        <header className="dashboard__header">
          <div>
            <h1 className="dashboard__title">Bienvenido, {MOCK_USER_NAME}</h1>
            <p className="dashboard__subtitle">
              Aquí está el resumen de tu actividad
            </p>
          </div>
          <Button
            title="Nuevo diseño"
            variant="primary"
            size="md"
            icon={<Package size={16} strokeWidth={1.5} />}
            onClick={() => navigate("/dashboard/products/new")}
          />
        </header>

        <div className="dashboard__stats">
          <Card
            icon={<PencilRuler size={20} strokeWidth={1.5} />}
            title="Mis Diseños"
            variant="default"
          >
            <div className="dashboard__stat-value">12</div>
            <p className="dashboard__stat-label">diseños publicados</p>
          </Card>
          <Card
            icon={<Package size={20} strokeWidth={1.5} />}
            title="Mis Pedidos"
            variant="default"
          >
            <div className="dashboard__stat-value">3</div>
            <p className="dashboard__stat-label">pedidos activos</p>
          </Card>
          <Card
            icon={<Star size={20} strokeWidth={1.5} />}
            title="Mi Reputación"
            variant="default"
          >
            <div className="dashboard__stat-value">4.8</div>
            <p className="dashboard__stat-label">sobre 5.0 (28 reseñas)</p>
          </Card>
        </div>

        <section className="dashboard__designs">
          <h2 className="dashboard__section-title">Mis Diseños</h2>
          {loadingProducts ? (
            <p>Cargando diseños...</p>
          ) : (
            <DataTable<Product>
              columns={PRODUCT_COLUMNS}
              rows={products}
              actions={productActions}
              emptyMessage="No tenés diseños publicados aún"
            />
          )}
        </section>
      </div>
    </Layout>
  );
}

export default Dashboard;
