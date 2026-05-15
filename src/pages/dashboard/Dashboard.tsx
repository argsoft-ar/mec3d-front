import { useState, useEffect } from "react";
import type React from "react";
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
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import ToastContainer from "../../components/Toast/ToastContainer";
import { useToast } from "../../hooks/useToast";
import "./Dashboard.css";

const MOCK_USER_NAME = "Miguel";

type StatCard = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  label: string;
};

const STAT_CARDS: StatCard[] = [
  {
    icon: <PencilRuler size={20} strokeWidth={1.5} />,
    title: "Mis Diseños",
    value: 12,
    label: "diseños publicados",
  },
  {
    icon: <Package size={20} strokeWidth={1.5} />,
    title: "Mis Pedidos",
    value: 3,
    label: "pedidos activos",
  },
  {
    icon: <Star size={20} strokeWidth={1.5} />,
    title: "Mi Reputación",
    value: 4.8,
    label: "sobre 5.0 (28 reseñas)",
  },
];

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
  const { toasts, addToast, removeToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    productService
      .getAll()
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    productService
      .remove(deleteTarget.id)
      .then(() => {
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        addToast(`"${deleteTarget.title}" eliminado correctamente`, "success");
        setDeleteTarget(null);
      })
      .catch(() => {
        addToast("Error al eliminar el diseño", "error");
      })
      .finally(() => setDeleting(false));
  };

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
      onClick: (row) => setDeleteTarget(row),
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
          {STAT_CARDS.map((stat) => (
            <Card
              key={stat.title}
              icon={stat.icon}
              title={stat.title}
              variant="default"
            >
              <div className="dashboard__stat-value">{stat.value}</div>
              <p className="dashboard__stat-label">{stat.label}</p>
            </Card>
          ))}
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
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar diseño"
        message={`¿Estás seguro que querés eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default Dashboard;
