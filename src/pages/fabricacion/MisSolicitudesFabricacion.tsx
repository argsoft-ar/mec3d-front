import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import FormField from "../../components/Form/FormField";
import ToastContainer from "../../components/Toast/ToastContainer";
import { useToast } from "../../hooks/useToast";
import { ordenFabricacionService } from "../../services/orden-fabricacion.service";
import type { OrdenFabricacion } from "../../interfaces";
import { formatPrice } from "../../utils/format.util";
import "./MisSolicitudesFabricacion.css";

interface LocationState {
  ordenes?: OrdenFabricacion[];
}

const ESTADO_LABELS: Record<string, string> = {
  solicitado: "Solicitado",
  en_negociacion: "En negociación",
  trato_cerrado: "Trato cerrado",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
  completado: "Completado",
};

const BREADCRUMB_ITEMS = [
  { label: "Inicio", path: "/" },
  { label: "Mis solicitudes de fabricación" },
];

function MisSolicitudesFabricacion() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const initialOrdenes =
    (location.state as LocationState | null)?.ordenes ?? [];

  const [ordenes, setOrdenes] = useState<OrdenFabricacion[]>(initialOrdenes);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [conversationInputs, setConversationInputs] = useState<
    Record<string, string>
  >({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  function updatePrice(ordenId: string, value: string) {
    setPriceInputs((prev) => ({ ...prev, [ordenId]: value }));
  }

  function updateConversationId(ordenId: string, value: string) {
    setConversationInputs((prev) => ({ ...prev, [ordenId]: value }));
  }

  async function handleProponerPrecio(ordenId: string) {
    const precio = Number.parseFloat(priceInputs[ordenId] ?? "");
    if (Number.isNaN(precio) || precio <= 0) {
      addToast("Ingresá un precio válido", "warning");
      return;
    }
    setSubmittingId(ordenId);
    try {
      const res = await ordenFabricacionService.proponerPrecio(ordenId, precio);
      if (!res.data) throw new Error("Respuesta inválida");
      const updated = res.data;
      setOrdenes((prev) => prev.map((o) => (o.id === ordenId ? updated : o)));
      addToast("Precio propuesto", "success");
    } catch {
      addToast("No se pudo proponer el precio", "error");
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleCerrarTrato(ordenId: string) {
    const precio = Number.parseFloat(priceInputs[ordenId] ?? "");
    if (Number.isNaN(precio) || precio <= 0) {
      addToast("Ingresá el precio a confirmar", "warning");
      return;
    }
    setSubmittingId(ordenId);
    try {
      const res = await ordenFabricacionService.cerrarTrato(ordenId, precio);
      if (!res.data) throw new Error("Respuesta inválida");
      const updated = res.data;
      setOrdenes((prev) => prev.map((o) => (o.id === ordenId ? updated : o)));
      addToast(
        updated.estado === "trato_cerrado"
          ? "¡Trato cerrado!"
          : "Cierre registrado, esperando confirmación de la otra parte",
        "success",
      );
    } catch {
      addToast("No se pudo cerrar el trato", "error");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <Layout>
      <Breadcrumb items={BREADCRUMB_ITEMS} />
      <Header
        title="Mis solicitudes de"
        accentText="fabricación"
        subtitle="Negociá el precio y cerrá el trato con tus fabricantes."
      />

      {ordenes.length === 0 ? (
        <p className="mis-solicitudes__empty">
          No hay solicitudes para mostrar en esta sesión. La API todavía no
          expone un listado histórico de órdenes de fabricación: esta vista solo
          muestra las que acabás de crear.
        </p>
      ) : (
        <div className="mis-solicitudes__list">
          {ordenes.map((orden) => {
            const isClosed = orden.estado === "trato_cerrado";
            return (
              <Card
                key={orden.id}
                variant="default"
                className="mis-solicitudes__card"
              >
                <div className="mis-solicitudes__row">
                  <span
                    className={`mis-solicitudes__badge mis-solicitudes__badge--${orden.estado}`}
                  >
                    {ESTADO_LABELS[orden.estado] ?? orden.estado}
                  </span>
                  <span className="mis-solicitudes__price">
                    {orden.precioAcordado !== null
                      ? `Acordado: ${formatPrice(orden.precioAcordado)}`
                      : "Sin acordar"}
                  </span>
                </div>

                {!isClosed && (
                  <div className="mis-solicitudes__negotiation">
                    <FormField
                      label="Precio"
                      name={`precio-${orden.id}`}
                      type="number"
                      value={priceInputs[orden.id] ?? ""}
                      onChange={(e) => updatePrice(orden.id, e.target.value)}
                      placeholder="Precio a proponer/confirmar"
                    />
                    <div className="mis-solicitudes__negotiation-actions">
                      <Button
                        title="Proponer precio"
                        variant="outline"
                        loading={submittingId === orden.id}
                        onClick={() => handleProponerPrecio(orden.id)}
                      />
                      <Button
                        title="Cerrar trato"
                        variant="primary"
                        loading={submittingId === orden.id}
                        onClick={() => handleCerrarTrato(orden.id)}
                      />
                    </div>
                  </div>
                )}

                <div className="mis-solicitudes__chat">
                  <FormField
                    label="ID de conversación"
                    name={`conv-${orden.id}`}
                    value={conversationInputs[orden.id] ?? ""}
                    onChange={(e) =>
                      updateConversationId(orden.id, e.target.value)
                    }
                    placeholder="Pegá el ID de conversación para abrir el chat"
                  />
                  <Button
                    title="Abrir chat"
                    variant="ghost"
                    disabled={!conversationInputs[orden.id]}
                    onClick={() =>
                      navigate(`/chat/${conversationInputs[orden.id]}`, {
                        state: { ordenFabricacionId: orden.id },
                      })
                    }
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </Layout>
  );
}

export default MisSolicitudesFabricacion;
