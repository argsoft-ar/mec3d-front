import { PencilRuler, Package, Star, Clock } from "lucide-react";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import "./Dashboard.css";

const MOCK_USER_NAME = "Miguel";

const RECENT_ACTIVITY = [
  "Nuevo pedido recibido: Engranaje cónico #4821",
  "Tu diseño 'Soporte de motor' fue aprobado",
  "Comentario en 'Polea de 12cm': ¡Excelente calidad!",
  "Pago procesado: $12.500 ARS",
  "Nuevo seguidor: juan_mecanica",
];

function Dashboard() {
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
          <Button title="Publicar diseño" variant="primary" size="md" />
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

        <section className="dashboard__activity">
          <Card
            title="Actividad reciente"
            icon={<Clock size={20} strokeWidth={1.5} />}
            list={RECENT_ACTIVITY}
            variant="default"
          />
        </section>
      </div>
    </Layout>
  );
}

export default Dashboard;
