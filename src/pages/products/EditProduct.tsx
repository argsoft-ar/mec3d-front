import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import Form from "../../components/Form/Form";
import FormField from "../../components/Form/FormField";
import Button from "../../components/Button/Button";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import type { BreadcrumbItem } from "../../components/Breadcrumb/Breadcrumb";
import type { SelectOption } from "../../types";
import { productService } from "../../services/product.service";
import type {
  Product,
  UpdateProductPayload,
  ProductForm,
  FormFieldConfig,
  ButtonConfig,
} from "../../interfaces";
import "./AddProduct.css";

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: "Autos", label: "Autos" },
  { value: "Motos", label: "Motos" },
  { value: "Barcos", label: "Barcos" },
  { value: "Casa", label: "Casa" },
  { value: "Maquinas", label: "Máquinas" },
  { value: "Engranajes", label: "Engranajes" },
];

const FORMAT_OPTIONS: SelectOption[] = [
  { value: "STL", label: "STL" },
  { value: "3MF", label: "3MF" },
  { value: "CNC", label: "CNC" },
  { value: "PLANO", label: "Plano técnico" },
];

const BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Mis Diseños", path: "/dashboard" },
  { label: "Editar Diseño" },
];

const FORM_FIELDS: FormFieldConfig[] = [
  {
    label: "Título del diseño",
    name: "titulo",
    placeholder: "Ej: Engranaje cónico 45°",
    required: true,
  },
  {
    label: "Precio base (ARS)",
    name: "precioBase",
    type: "number",
    placeholder: "Ej: 2500",
    required: true,
  },
  {
    label: "Categoría",
    name: "categoria",
    type: "select",
    options: CATEGORY_OPTIONS,
    required: true,
  },
  {
    label: "Formato de archivo",
    name: "formato",
    type: "select",
    options: FORMAT_OPTIONS,
    required: true,
  },
  {
    label: "URL de imagen de preview",
    name: "imagenUrl",
    placeholder: "https://...",
    fullWidth: true,
  },
  {
    label: "URL del archivo de diseño",
    name: "archivoUrl",
    placeholder: "https://...",
    fullWidth: true,
  },
  {
    label: "Descripción",
    name: "descripcion",
    type: "textarea",
    placeholder: "Describí las características técnicas del diseño...",
    required: true,
    fullWidth: true,
  },
];

function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductForm>({
    titulo: "",
    descripcion: "",
    categoria: "",
    precioBase: "",
    formato: "",
    imagenUrl: "",
    archivoUrl: "",
  });
  const [errors, setErrors] = useState<Partial<ProductForm>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    productService
      .getAll()
      .then((products: Product[]) => {
        const product = products.find((p) => String(p.id) === id);
        if (!product) {
          setNotFound(true);
          return;
        }
        setForm({
          titulo: product.title,
          descripcion: product.description,
          categoria: "",
          precioBase: String(product.price),
          formato: product.format,
          imagenUrl: product.imageUrl ?? "",
          archivoUrl: "",
        });
      })
      .catch((error: unknown) => {
        console.error(error);
        setNotFound(true);
      })
      .finally(() => {
        setFetching(false);
      });
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ProductForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<ProductForm> = {};
    if (!form.titulo.trim()) newErrors.titulo = "El título es obligatorio";
    if (!form.descripcion.trim())
      newErrors.descripcion = "La descripción es obligatoria";
    if (!form.categoria) newErrors.categoria = "Seleccioná una categoría";
    if (
      !form.precioBase ||
      isNaN(Number(form.precioBase)) ||
      Number(form.precioBase) <= 0
    )
      newErrors.precioBase = "Ingresá un precio válido";
    if (!form.formato) newErrors.formato = "Seleccioná un formato";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const payload: UpdateProductPayload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      imagenUrl: form.imagenUrl,
      archivoUrl: form.archivoUrl,
      precioBase: Number(form.precioBase),
      formato: form.formato,
      especificaciones: [],
    };
    try {
      await productService.update(id!, payload);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const FORM_ACTIONS: ButtonConfig[] = [
    {
      title: "Cancelar",
      variant: "ghost",
      type: "button",
      onClick: () => navigate("/dashboard"),
    },
    { title: "Guardar cambios", variant: "primary", type: "submit", loading },
  ];

  if (fetching) {
    return (
      <Layout>
        <p>Cargando...</p>
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout>
        <p>Producto no encontrado.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="add-product">
        <Breadcrumb items={BREADCRUMB_ITEMS} />

        <Header
          title="Editar"
          accentText="Diseño"
          subtitle="Modificá los datos de tu diseño"
        />

        <Card variant="default" className="add-product__card">
          <Form onSubmit={handleSubmit} columns={2}>
            {FORM_FIELDS.map((field) => (
              <FormField
                key={field.name}
                label={field.label}
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                fullWidth={field.fullWidth}
                options={field.options}
                error={errors[field.name]}
              />
            ))}

            <div className="add-product__actions">
              {FORM_ACTIONS.map((btn) => (
                <Button
                  key={btn.title}
                  title={btn.title}
                  variant={btn.variant}
                  size="md"
                  type={btn.type}
                  loading={btn.loading}
                  onClick={btn.onClick}
                />
              ))}
            </div>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}

export default EditProduct;
