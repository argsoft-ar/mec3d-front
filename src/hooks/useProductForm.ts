import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "./useToast";
import { useCatalogoDiseno } from "./useCatalogoDiseno";
import {
  productService,
  uploadImage,
  uploadModel,
} from "../services/product.service";
import {
  MAX_MATERIALES_POR_DISENO,
  MAX_PRECIO_BASE,
  MAX_PRINT_HOURS,
  MIN_PRINT_HOURS,
} from "../utils/product.util";
import type {
  UpdateProductPayload,
  ProductForm,
  ProductFormErrors,
} from "../interfaces";

const INITIAL_FORM: ProductForm = {
  titulo: "",
  descripcion: "",
  categoria: "",
  precioBase: "",
  formato: "",
  imagenUrl: "",
  archivoUrl: "",
  tecnologia: "",
  materiales: [],
  specDimensiones: "",
  specDificultad: "",
  specTiempoImpresion: "",
  specSoportes: "",
  specLayer: "",
  specInfill: "",
};

// El backend admite hasta 2 decimales; el regex descarta notación exponencial y signos.
function isValidPrecio(precioBase: string): boolean {
  if (!/^\d+(\.\d{1,2})?$/.test(precioBase)) return false;
  const precio = Number(precioBase);
  return Number.isFinite(precio) && precio > 0 && precio <= MAX_PRECIO_BASE;
}

function isValidPrintHours(value: string): boolean {
  if (!/^\d+$/.test(value)) return false;
  const hours = Number(value);
  return hours >= MIN_PRINT_HOURS && hours <= MAX_PRINT_HOURS;
}

// Matches the backend's upload cap (see mec3d-back upload.service.ts).
const MAX_ARCHIVO_SIZE_BYTES = 30 * 1024 * 1024;

// Maps a filename/URL extension to the format expected by ModelViewer3D, independent of `form.formato`.
function getModelFormatFromName(name: string): string {
  const extension = name.slice(name.lastIndexOf(".")).toLowerCase();
  switch (extension) {
    case ".stl":
      return "STL";
    case ".3mf":
      return "3MF";
    case ".obj":
      return "OBJ";
    case ".step":
      return "STEP";
    case ".stp":
      return "STP";
    default:
      return "";
  }
}

export function useProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [archivoFile, setArchivoFile] = useState<File | null>(null);
  const [archivoPreviewUrl, setArchivoPreviewUrl] = useState<string>("");
  const [uploadingArchivo, setUploadingArchivo] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const archivoFileInputRef = useRef<HTMLInputElement>(null);
  const {
    tecnologiaOptions,
    materialOptions,
    loadingMateriales,
    error: catalogoError,
  } = useCatalogoDiseno(form.tecnologia);

  useEffect(() => {
    if (catalogoError) {
      addToast("No se pudo cargar el catálogo de tecnologías y materiales", "error");
    }
  }, [catalogoError, addToast]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      if (archivoPreviewUrl) URL.revokeObjectURL(archivoPreviewUrl);
    };
  }, [archivoPreviewUrl]);

  useEffect(() => {
    if (!isEdit) return;
    productService
      .getMine()
      .then((products) => {
        const product = products.find((p) => String(p.id) === id);
        if (!product) {
          setNotFound(true);
          return;
        }
        setForm({
          titulo: product.title,
          descripcion: product.description,
          categoria: product.categoria ?? "",
          precioBase: String(product.price),
          formato: product.format,
          imagenUrl: product.imageUrl ?? "",
          archivoUrl: product.archivoUrl ?? "",
          tecnologia: product.tecnologia ?? "",
          materiales: [...(product.materiales ?? [])],
          specDimensiones: product.specs?.dimensiones ?? "",
          specDificultad: product.specs?.dificultad ?? "",
          specTiempoImpresion: product.specs
            ? String(product.specs.tiempoImpresion)
            : "",
          specSoportes: product.specs?.soportes ?? "",
          specLayer: product.specs?.configuracion.layer ?? "",
          specInfill: product.specs?.configuracion.infill ?? "",
        });
        setImagePreview(product.imageUrl ?? "");
      })
      .catch((error: unknown) => {
        console.error(error);
        setNotFound(true);
      })
      .finally(() => {
        setFetching(false);
      });
  }, [id, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "tecnologia") {
      // Cada material pertenece a una única tecnología: al cambiarla ninguno de los elegidos sigue siendo válido.
      setForm((prev) => ({ ...prev, tecnologia: value, materiales: [] }));
      setErrors((prev) => ({
        ...prev,
        tecnologia: undefined,
        materiales: undefined,
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ProductForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleMaterialesChange = (materiales: string[]) => {
    setForm((prev) => ({ ...prev, materiales }));
    if (errors.materiales) {
      setErrors((prev) => ({ ...prev, materiales: undefined }));
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

  const ARCHIVO_EXTENSIONS = new Set([".stl", ".3mf", ".obj", ".step", ".stp"]);

  const handleArchivoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ARCHIVO_EXTENSIONS.has(extension)) {
      addToast("Formato no permitido. Usá STL, 3MF, OBJ, STEP o STP", "error");
      return;
    }
    if (file.size > MAX_ARCHIVO_SIZE_BYTES) {
      addToast("El archivo debe ser menor a 30MB", "error");
      return;
    }
    setArchivoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setArchivoPreviewUrl(objectUrl);
    if (errors.archivoUrl) {
      setErrors((prev) => ({ ...prev, archivoUrl: undefined }));
    }
  };

  const archivoPreviewFormat = archivoFile
    ? getModelFormatFromName(archivoFile.name)
    : getModelFormatFromName(form.archivoUrl);

  const handleImagePreviewError = () => {
    addToast("No se pudo previsualizar la imagen", "error");
  };

  const handleModelPreviewError = () => {
    addToast("No se pudo previsualizar el modelo 3D", "error");
  };

  const validate = (): boolean => {
    const newErrors: ProductFormErrors = {};
    if (!form.titulo.trim()) newErrors.titulo = "El título es obligatorio";
    if (!form.descripcion.trim())
      newErrors.descripcion = "La descripción es obligatoria";
    if (!form.categoria) newErrors.categoria = "Seleccioná una categoría";
    if (!isValidPrecio(form.precioBase))
      newErrors.precioBase = `Ingresá un precio mayor a 0 y hasta ${MAX_PRECIO_BASE.toLocaleString("es-AR")}, con máximo 2 decimales`;
    if (!form.formato) newErrors.formato = "Seleccioná un formato";
    if (!form.archivoUrl.trim() && !archivoFile)
      newErrors.archivoUrl = "Subí el archivo de diseño 3D";
    if (!form.imagenUrl && !imageFile)
      newErrors.imagenUrl = "La imagen es obligatoria";
    if (!form.tecnologia) newErrors.tecnologia = "Seleccioná una tecnología";
    if (form.materiales.length === 0) {
      newErrors.materiales = "Seleccioná al menos un material";
    } else if (form.materiales.length > MAX_MATERIALES_POR_DISENO) {
      newErrors.materiales = `Podés elegir hasta ${MAX_MATERIALES_POR_DISENO} materiales`;
    } else if (
      materialOptions.length > 0 &&
      form.materiales.some((m) => !materialOptions.some((o) => o.value === m))
    ) {
      newErrors.materiales =
        "Hay materiales que no corresponden a la tecnología elegida";
    }
    if (!form.specDimensiones.trim())
      newErrors.specDimensiones = "Las dimensiones son obligatorias";
    if (!form.specDificultad)
      newErrors.specDificultad = "Seleccioná la dificultad";
    if (!isValidPrintHours(form.specTiempoImpresion))
      newErrors.specTiempoImpresion = `Ingresá un número entero de horas entre ${MIN_PRINT_HOURS} y ${MAX_PRINT_HOURS}`;
    if (!form.specSoportes)
      newErrors.specSoportes = "Seleccioná la opción de soportes";
    if (!form.specLayer) newErrors.specLayer = "Seleccioná la altura de capa";
    if (!form.specInfill) newErrors.specInfill = "Seleccioná el relleno";
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
      let archivoUrl = form.archivoUrl;
      if (archivoFile) {
        setUploadingArchivo(true);
        try {
          archivoUrl = await uploadModel(archivoFile);
        } catch {
          addToast("Error al subir el archivo 3D", "error");
          return;
        } finally {
          setUploadingArchivo(false);
        }
      }
      const especificaciones = {
        dimensiones: form.specDimensiones,
        dificultad: form.specDificultad,
        tiempoImpresion: Number(form.specTiempoImpresion),
        soportes: form.specSoportes,
        configuracion: {
          layer: form.specLayer,
          infill: form.specInfill,
        },
      };
      if (isEdit && id) {
        const payload: UpdateProductPayload = {
          titulo: form.titulo,
          descripcion: form.descripcion,
          imagenUrl: imageUrl,
          archivoUrl,
          precioBase: Number(form.precioBase),
          formato: form.formato,
          categoria: form.categoria,
          tecnologia: form.tecnologia,
          materiales: form.materiales,
          especificaciones,
        };
        await productService.update(id, payload);
        navigate("/dashboard", {
          state: { successToast: "Cambios guardados exitosamente" },
        });
      } else {
        await productService.create({
          titulo: form.titulo,
          descripcion: form.descripcion,
          imagenUrl: imageUrl,
          archivoUrl,
          precioBase: Number(form.precioBase),
          formato: form.formato,
          categoria: form.categoria,
          tecnologia: form.tecnologia,
          materiales: form.materiales,
          especificaciones,
        });
        navigate("/dashboard", {
          state: { successToast: "Diseño publicado exitosamente" },
        });
      }
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Error al guardar el diseño",
        "error",
      );
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return {
    id,
    isEdit,
    form,
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
    archivoPreviewUrl,
    archivoPreviewFormat,
    uploadingArchivo,
    archivoFileInputRef,
    handleArchivoFileChange,
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
  };
}
