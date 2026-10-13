import type React from "react";
import { Suspense, lazy, Fragment } from "react";
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
import PageLoader from "../../components/PageLoader/PageLoader";
import MultiSelectField from "../../components/MultiSelectField/MultiSelectField";
import { useProductForm } from "../../hooks/useProductForm";
import {
  MAX_MATERIALES_POR_DISENO,
  MAX_PRECIO_BASE,
  MAX_PRINT_HOURS,
  MIN_PRECIO_BASE,
  MIN_PRINT_HOURS,
} from "../../utils/product.util";
import type {
  FormFieldConfig,
  ButtonConfig,
  ProductFormTextKey,
} from "../../interfaces";
import "./ProductFormPage.css";

const ModelViewer3D = lazy(
  () => import("../../components/ModelViewer3D/ModelViewer3D"),
);

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: "Autos", label: "Autos" },
  { value: "Motos", label: "Motos" },
  { value: "Barcos", label: "Barcos" },
  { value: "Casa", label: "Casa" },
  { value: "Maquinas", label: "Máquinas" },
  { value: "Engranajes", label: "Engranajes" },
  { value: "Planos técnicos", label: "Planos técnicos" },
];

const DIFICULTAD_OPTIONS: SelectOption[] = [
  { value: "Básico", label: "Básico" },
  { value: "Intermedio", label: "Intermedio" },
  { value: "Avanzado", label: "Avanzado" },
];
const SOPORTES_OPTIONS: SelectOption[] = [
  { value: "Necesarios", label: "Necesarios" },
  { value: "No necesarios", label: "No necesarios" },
];
const LAYER_OPTIONS: SelectOption[] = [
  { value: "0.1mm", label: "0.1mm" },
  { value: "0.15mm", label: "0.15mm" },
  { value: "0.2mm", label: "0.2mm" },
  { value: "0.3mm", label: "0.3mm" },
];
const INFILL_OPTIONS: SelectOption[] = [
  { value: "15%", label: "15%" },
  { value: "20%", label: "20%" },
  { value: "25%", label: "25%" },
  { value: "30%", label: "30%" },
  { value: "40%", label: "40%" },
  { value: "50%", label: "50%" },
  { value: "60%", label: "60%" },
];

// Evita notación exponencial y signos en inputs numéricos.
const NON_NUMERIC_KEYS = ["e", "E", "+", "-"] as const;
const INTEGER_ONLY_KEYS = [...NON_NUMERIC_KEYS, ".", ","] as const;

const FORM_FIELDS: FormFieldConfig[] = [
  {
    label: "Imagen de portada",
    name: "imagenUrl",
    type: "file",
    accept: "image/*",
    required: true,
    fullWidth: true,
    hint: "El archivo debe ser menor a 5MB",
  },
  {
    // Label, accept y hint dependen de la categoría (ver getProductFormRules).
    label: "Archivo de diseño",
    name: "archivoUrl",
    type: "file",
    required: true,
    fullWidth: true,
  },
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
    min: MIN_PRECIO_BASE,
    max: MAX_PRECIO_BASE,
    step: 0.01,
    inputMode: "decimal",
    blockedKeys: NON_NUMERIC_KEYS,
    hint: "Máximo 2 decimales.",
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
    required: true,
  },
  {
    label: "Descripción",
    name: "descripcion",
    type: "textarea",
    placeholder: "Describí las características técnicas del diseño...",
    required: true,
    fullWidth: true,
  },
  {
    label: "Tecnología",
    name: "tecnologia",
    type: "select",
    placeholder: "Seleccioná una tecnología",
    required: true,
    fullWidth: true,
  },
  {
    label: "Dimensiones",
    name: "specDimensiones",
    placeholder: "Ej: 110x90x35mm",
    required: true,
  },
  {
    label: "Dificultad",
    name: "specDificultad",
    type: "select",
    options: DIFICULTAD_OPTIONS,
    required: true,
  },
  {
    label: "Tiempo de impresión (horas)",
    name: "specTiempoImpresion",
    type: "number",
    placeholder: "Ej: 4",
    required: true,
    min: MIN_PRINT_HOURS,
    max: MAX_PRINT_HOURS,
    step: 1,
    inputMode: "numeric",
    blockedKeys: INTEGER_ONLY_KEYS,
  },
  {
    label: "Soportes",
    name: "specSoportes",
    type: "select",
    options: SOPORTES_OPTIONS,
    required: true,
  },
  {
    label: "Altura de Capa (Layer)",
    name: "specLayer",
    type: "select",
    options: LAYER_OPTIONS,
    required: true,
  },
  {
    label: "Relleno (Infill)",
    name: "specInfill",
    type: "select",
    options: INFILL_OPTIONS,
    required: true,
  },
];

function ProductFormPage() {
  const {
    isEdit,
    form,
    rules,
    errors,
    handleChange,
    handleMaterialesChange,
    tecnologiaOptions,
    materialOptions,
    loadingMateriales,
    imageFile,
    imagePreview,
    uploadingImage,
    fileInputRef,
    handleFileChange,
    archivoFile,
    uploadingArchivo,
    archivoFileInputRef,
    handleArchivoFileChange,
    archivoPreviewUrl,
    archivoPreviewFormat,
    handleImagePreviewError,
    handleModelPreviewError,
    loading,
    confirmOpen,
    setConfirmOpen,
    handleSubmit,
    handleConfirm,
    fetching,
    notFound,
    toasts,
    removeToast,
  } = useProductForm();
  const navigate = useNavigate();

  const DYNAMIC_OPTIONS: Partial<Record<ProductFormTextKey, SelectOption[]>> = {
    tecnologia: tecnologiaOptions,
    formato: rules.formatOptions,
  };

  const renderField = (field: FormFieldConfig) => (
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
      options={DYNAMIC_OPTIONS[field.name] ?? field.options}
      error={errors[field.name]}
      hint={field.hint}
      accept={field.accept}
      min={field.min}
      max={field.max}
      step={field.step}
      inputMode={field.inputMode}
      blockedKeys={field.blockedKeys}
    />
  );

  const FILE_FIELD_PROPS: Record<
    string,
    {
      fileInputRef: React.RefObject<HTMLInputElement | null>;
      onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      fileName?: string;
      fileSelected: boolean;
      disabled: boolean;
    }
  > = {
    imagenUrl: {
      fileInputRef,
      onFileChange: handleFileChange,
      fileName: imageFile?.name,
      fileSelected: !!imagePreview,
      disabled: uploadingImage || loading,
    },
    archivoUrl: {
      fileInputRef: archivoFileInputRef,
      onFileChange: handleArchivoFileChange,
      fileName: archivoFile?.name,
      fileSelected: !!(archivoFile || form.archivoUrl),
      disabled: uploadingArchivo || loading,
    },
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Mis Diseños", path: "/dashboard" },
    { label: isEdit ? "Editar Diseño" : "Nuevo Diseño" },
  ];

  const FORM_ACTIONS: ButtonConfig[] = [
    {
      title: "Cancelar",
      variant: "ghost",
      type: "button",
      onClick: () => navigate("/dashboard"),
    },
    {
      title: isEdit ? "Guardar cambios" : "Publicar diseño",
      variant: "primary",
      type: "submit",
      loading,
    },
  ];

  if (isEdit && fetching)
    return (
      <Layout>
        <p>Cargando...</p>
      </Layout>
    );
  if (isEdit && notFound)
    return (
      <Layout>
        <p>Producto no encontrado.</p>
      </Layout>
    );

  return (
    <>
      <Layout>
        <div className="add-product">
          <Breadcrumb items={breadcrumbItems} />
          <Header
            title={isEdit ? "Editar" : "Nuevo"}
            accentText="Diseño"
            subtitle={
              isEdit
                ? "Modificá los datos de tu diseño"
                : "Completá los datos para publicar tu diseño"
            }
          />
          <Card variant="default" className="add-product__card">
            <Form onSubmit={handleSubmit} columns={2}>
              <div className="add-product__uploads">
                <div className="add-product__upload-col">
                  <FormField
                    key={FORM_FIELDS[0].name}
                    label={FORM_FIELDS[0].label}
                    name={FORM_FIELDS[0].name}
                    type={FORM_FIELDS[0].type}
                    value={form[FORM_FIELDS[0].name]}
                    onChange={handleChange}
                    required={FORM_FIELDS[0].required}
                    fullWidth={FORM_FIELDS[0].fullWidth}
                    error={errors[FORM_FIELDS[0].name]}
                    hint={FORM_FIELDS[0].hint}
                    accept={FORM_FIELDS[0].accept}
                    {...FILE_FIELD_PROPS[FORM_FIELDS[0].name]}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Vista previa de la imagen de portada"
                      className="add-product__image-preview"
                      onError={handleImagePreviewError}
                    />
                  )}
                </div>
                <div className="add-product__upload-col">
                  <FormField
                    key={FORM_FIELDS[1].name}
                    label={rules.archivo.label}
                    name={FORM_FIELDS[1].name}
                    type={FORM_FIELDS[1].type}
                    value={form[FORM_FIELDS[1].name]}
                    onChange={handleChange}
                    required={FORM_FIELDS[1].required}
                    fullWidth={FORM_FIELDS[1].fullWidth}
                    error={errors[FORM_FIELDS[1].name]}
                    hint={rules.archivo.hint}
                    accept={rules.archivo.accept}
                    {...FILE_FIELD_PROPS[FORM_FIELDS[1].name]}
                  />
                  {(archivoPreviewUrl || form.archivoUrl) &&
                    archivoPreviewFormat && (
                      <Suspense
                        fallback={<PageLoader label="Cargando visor 3D..." />}
                      >
                        <ModelViewer3D
                          url={archivoPreviewUrl || form.archivoUrl}
                          format={archivoPreviewFormat}
                          className="add-product__model-preview"
                          onPreviewError={handleModelPreviewError}
                        />
                      </Suspense>
                    )}
                </div>
              </div>

              {FORM_FIELDS.slice(2, 7).map(renderField)}

              {rules.showTechnicalFields && (
                <>
                  <h3 className="add-product__specs-title">
                    Especificaciones Técnicas
                  </h3>

                  {FORM_FIELDS.slice(7).map((field) => (
                    <Fragment key={field.name}>
                      {renderField(field)}
                      {field.name === "tecnologia" && (
                        <MultiSelectField
                          label="Materiales compatibles"
                          name="materiales"
                          options={materialOptions}
                          value={form.materiales}
                          onChange={handleMaterialesChange}
                          required
                          fullWidth
                          maxSelected={MAX_MATERIALES_POR_DISENO}
                          loading={loadingMateriales}
                          disabled={!form.tecnologia}
                          error={errors.materiales}
                          emptyMessage="Elegí primero una tecnología para ver sus materiales."
                          hint="Podés elegir más de un material."
                        />
                      )}
                    </Fragment>
                  ))}
                </>
              )}

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
        title={isEdit ? "Guardar cambios" : "Publicar diseño"}
        message={
          isEdit
            ? "¿Confirmas que querés guardar los cambios?"
            : "¿Confirmas que querés publicar este diseño?"
        }
        confirmLabel={isEdit ? "Guardar" : "Publicar"}
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

export default ProductFormPage;
