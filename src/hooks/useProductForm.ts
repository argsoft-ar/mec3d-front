import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "./useToast";
import { productService, uploadImage } from "../services/product.service";
import type { UpdateProductPayload, ProductForm } from "../interfaces";

const INITIAL_FORM: ProductForm = {
  titulo: "",
  descripcion: "",
  categoria: "",
  precioBase: "",
  formato: "",
  imagenUrl: "",
  archivoUrl: "",
  specMaterial: "",
  specDimensiones: "",
  specDificultad: "",
  specTiempoImpresion: "",
  specSoportes: "",
  specLayer: "",
  specInfill: "",
};

export function useProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<ProductForm>>({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

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
          specMaterial: product.specs?.material ?? "",
          specDimensiones: product.specs?.dimensiones ?? "",
          specDificultad: product.specs?.dificultad ?? "",
          specTiempoImpresion: product.specs?.tiempoImpresion ?? "",
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
      Number.isNaN(Number(form.precioBase)) ||
      Number(form.precioBase) <= 0
    )
      newErrors.precioBase = "Ingresá un precio válido";
    if (!form.formato) newErrors.formato = "Seleccioná un formato";
    if (!form.archivoUrl.trim() || !/^https?:\/\/.+/.test(form.archivoUrl))
      newErrors.archivoUrl = "Ingresá una URL válida para el archivo";
    if (!form.imagenUrl && !imageFile)
      newErrors.imagenUrl = "La imagen es obligatoria";
    if (!form.specMaterial) newErrors.specMaterial = "Seleccioná un material";
    if (!form.specDimensiones.trim())
      newErrors.specDimensiones = "Las dimensiones son obligatorias";
    if (!form.specDificultad)
      newErrors.specDificultad = "Seleccioná la dificultad";
    if (!form.specTiempoImpresion.trim())
      newErrors.specTiempoImpresion = "El tiempo de impresión es obligatorio";
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
      const especificaciones = {
        material: form.specMaterial,
        dimensiones: form.specDimensiones,
        dificultad: form.specDificultad,
        tiempoImpresion: form.specTiempoImpresion,
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
          archivoUrl: form.archivoUrl,
          precioBase: Number(form.precioBase),
          formato: form.formato,
          categoria: form.categoria,
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
          archivoUrl: form.archivoUrl,
          precioBase: Number(form.precioBase),
          formato: form.formato,
          categoria: form.categoria,
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
    imageFile,
    imagePreview,
    uploadingImage,
    fileInputRef,
    handleFileChange,
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
