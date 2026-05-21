import { useState, useRef, useEffect } from "react";
import { CheckCircle } from "lucide-react";
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
import ToastContainer from "../../components/Toast/ToastContainer";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { useToast } from "../../hooks/useToast";
import { productService, uploadImage } from "../../services/product.service";
import type {
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

const INITIAL_FORM: ProductForm = {
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
    label: "URL del archivo de diseño",
    name: "archivoUrl",
    placeholder: "https://...",
    required: true,
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
  const { toasts, addToast, removeToast } = useToast();
  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<ProductForm>>({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast("La imagen debe ser menor a 5MB", "error");
      return;
    }
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    if (errors.imagenUrl) {
      setErrors((prev) => ({ ...prev, imagenUrl: undefined }));
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
    if (!form.archivoUrl.trim() || !/^https?:\/\/.+/.test(form.archivoUrl))
      newErrors.archivoUrl = "Ingresá una URL válida para el archivo";
    if (!form.imagenUrl && !imageFile)
      newErrors.imagenUrl = "La imagen es obligatoria";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      let imageUrl = form.imagenUrl;
      if (imageFile) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImage(imageFile);
        } catch {
          addToast("Error al subir la imagen", "error");
          return;
        } finally {
          setUploadingImage(false);
        }
      }
      await productService.create({
        titulo: form.titulo,
        descripcion: form.descripcion,
        imagenUrl: imageUrl,
        archivoUrl: form.archivoUrl,
        precioBase: Number(form.precioBase),
        formato: form.formato,
        especificaciones: [],
      });
      navigate("/dashboard");
      addToast("Diseño publicado exitosamente", "success");
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Error al publicar el diseño",
        "error",
      );
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

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
    <>
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
              <div className="add-product__image-upload">
                <span className="add-product__image-label">
                  Imagen de portada <span className="required">*</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <Button
                  title="Subir imagen"
                  variant="primary"
                  type="button"
                  disabled={uploadingImage || loading}
                  onClick={() => fileInputRef.current?.click()}
                />
                <p className="add-product__image-hint">
                  El archivo debe ser menor a 5MB
                </p>
                {imagePreview && (
                  <div className="add-product__image-success">
                    <CheckCircle
                      size={18}
                      className="add-product__image-success-icon"
                    />
                    <span className="add-product__image-success-text">
                      {imageFile ? imageFile.name : "Imagen cargada"}
                    </span>
                  </div>
                )}
                {errors.imagenUrl && (
                  <span className="add-product__image-error">
                    {errors.imagenUrl}
                  </span>
                )}
              </div>

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
      <ConfirmDialog
        open={confirmOpen}
        title="Publicar diseño"
        message="¿Confirmas que querés publicar este diseño?"
        confirmLabel="Publicar"
        cancelLabel="Revisar"
        variant="info"
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default AddProduct;
