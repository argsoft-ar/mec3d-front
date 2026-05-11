import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

interface AddProductForm {
  titulo: string;
  descripcion: string;
  categoria: string;
  precioBase: string;
  formato: string;
  imagenUrl: string;
  archivoUrl: string;
}

const INITIAL_FORM: AddProductForm = {
  titulo: "",
  descripcion: "",
  categoria: "",
  precioBase: "",
  formato: "",
  imagenUrl: "",
  archivoUrl: "",
};

const BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Mis Diseños", path: "/dashboard" },
  { label: "Nuevo Diseño" },
];

interface FormFieldConfig {
  label: string;
  name: keyof AddProductForm;
  type?: "text" | "number" | "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  options?: SelectOption[];
}

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

function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState<AddProductForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<AddProductForm>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AddProductForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<AddProductForm> = {};
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
    try {
      await productService.create({
        titulo: form.titulo,
        descripcion: form.descripcion,
        imagenUrl: form.imagenUrl,
        archivoUrl: form.archivoUrl,
        precioBase: Number(form.precioBase),
        formato: form.formato,
        especificaciones: [],
      });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  interface ButtonConfig {
    title: string;
    variant: "ghost" | "primary";
    type: "button" | "submit";
    loading?: boolean;
    onClick?: () => void;
  }

  const FORM_ACTIONS: ButtonConfig[] = [
    {
      title: "Cancelar",
      variant: "ghost",
      type: "button",
      onClick: () => navigate("/dashboard"),
    },
    { title: "Publicar diseño", variant: "primary", type: "submit", loading },
  ];

  return (
    <Layout>
      <div className="add-product">
        <Breadcrumb items={BREADCRUMB_ITEMS} />

        <Header
          title="Nuevo"
          accentText="Diseño"
          subtitle="Completá los datos para publicar tu diseño"
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

export default AddProduct;
