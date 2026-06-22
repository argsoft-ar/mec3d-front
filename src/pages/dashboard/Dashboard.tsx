import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PencilRuler, Package, Star, Eye, Pencil, Trash2 } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import DataTable from "../../components/DataTable/DataTable";
import type {
  ColumnDef,
  TableAction,
  FilterableField,
} from "../../components/DataTable/DataTable.types";
import type { Product } from "../../interfaces";
import { productService } from "../../services/product.service";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import ToastContainer from "../../components/Toast/ToastContainer";
import { useToast } from "../../hooks/useToast";
import "./Dashboard.css";

const PRODUCT_COLUMNS: ColumnDef<Product>[] = [
  { key: "title", header: "Título", sortable: true },
  { key: "format", header: "Formato", width: 90, align: "center" },
  {
    key: "price",
    header: "Precio",
    width: 120,
    align: "right",
    sortable: true,
    renderCell: (value) => `$${Number(value).toLocaleString("es-AR")} ARS`,
  },
  {
    key: "rating",
    header: "Rating",
    width: 90,
    align: "center",
    sortable: true,
    renderCell: (value) => `⭐ ${value}`,
  },
  {
    key: "downloads",
    header: "Descargas",
    width: 100,
    align: "center",
    sortable: true,
  },
];

const PRODUCT_FILTERABLE_FIELDS: FilterableField<Product>[] = [
  { key: "format", label: "Formato", options: ["STL", "OBJ", "STEP", "3MF"] },
];

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    const state = location.state as { successToast?: string } | null;
    if (state?.successToast) {
      addToast(state.successToast, "success");
      window.history.replaceState({}, "");
    }
  }, []);

  const rawUser = localStorage.getItem("auth_user");
  const userEmail: string = rawUser
    ? (JSON.parse(rawUser) as { email: string }).email
    : "";
  const displayName = userEmail
    ? userEmail.split("@")[0].charAt(0).toUpperCase() +
      userEmail.split("@")[0].slice(1)
    : "Usuario";
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    productService
      .getMine()
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  const totalReviews = products.reduce((sum, p) => sum + p.reviewCount, 0);
  const avgRating =
    products.length > 0
      ? products.reduce((sum, p) => sum + p.rating, 0) / products.length
      : 0;

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { id, title } = deleteTarget;
    const removeDeleted = (prev: Product[]) => prev.filter((p) => p.id !== id);
    productService
      .remove(id)
      .then(() => {
        setProducts(removeDeleted);
        addToast(`"${title}" eliminado correctamente`, "success");
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
            <h1 className="dashboard__title">Bienvenido, {displayName}</h1>
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
            key="designs"
            icon={<PencilRuler size={20} strokeWidth={1.5} />}
            title="Mis Diseños"
            variant="default"
          >
            <div className="dashboard__stat-value">{products.length}</div>
            <p className="dashboard__stat-label">diseños publicados</p>
          </Card>
          <Card
            key="pedidos"
            icon={<Package size={20} strokeWidth={1.5} />}
            title="Mis Pedidos"
            variant="default"
          >
            <div className="dashboard__stat-value">3</div>
            <p className="dashboard__stat-label">pedidos activos</p>
          </Card>
          <Card
            key="reputation"
            icon={<Star size={20} strokeWidth={1.5} />}
            title="Mi Reputación"
            variant="default"
          >
            <div className="dashboard__stat-value">{avgRating.toFixed(1)}</div>
            <p className="dashboard__stat-label">
              sobre 5.0 ({totalReviews} reseñas)
            </p>
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
              searchable
              pagination
              filterableFields={PRODUCT_FILTERABLE_FIELDS}
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
