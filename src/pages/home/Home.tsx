import React from "react";
import {
  Car,
  Bike,
  Sailboat,
  House,
  Settings2,
  Cog,
  Search,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import type { ProductCategory } from "../../types";
import "./Home.css";

interface CategoryItem {
  name: ProductCategory;
  icon: React.ReactNode;
  description: string;
}

const ICON_SIZE = 64;
const ICON_PROPS = { size: ICON_SIZE, strokeWidth: 1.5 };

const CATEGORIES: CategoryItem[] = [
  {
    name: "Autos",
    icon: <Car {...ICON_PROPS} />,
    description: "Piezas y repuestos para automóviles",
  },
  {
    name: "Motos",
    icon: <Bike {...ICON_PROPS} />,
    description: "Componentes y accesorios para motos",
  },
  {
    name: "Barcos",
    icon: <Sailboat {...ICON_PROPS} />,
    description: "Partes náuticas y marinas",
  },
  {
    name: "Casa",
    icon: <House {...ICON_PROPS} />,
    description: "Herrajes, cerraduras y más",
  },
  {
    name: "Maquinas",
    icon: <Settings2 {...ICON_PROPS} />,
    description: "Piezas industriales y de producción",
  },
  {
    name: "Engranajes",
    icon: <Cog {...ICON_PROPS} />,
    description: "Transmisiones, poleas y sistemas mecánicos",
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <Layout>
      <Header
        title="MEC3D, lo que necesitas"
        accentText="en un solo lugar"
        subtitle="El marketplace líder de piezas mecánicas en 3D. Comprá, diseñá y fabricá con los mejores proveedores."
        actions={
          <>
            <Button
              title="Explorar piezas"
              icon={<Search size={18} strokeWidth={2} />}
              variant="primary"
              size="lg"
              onClick={() => navigate("/explore")}
            />
            <Button
              title="Publicar diseño"
              icon={<Upload size={18} strokeWidth={2} />}
              variant="outline"
              size="lg"
              onClick={() => navigate("/dashboard")}
            />
          </>
        }
      />

      <section className="home-categories">
        <h2 className="home-section-title">Categorías</h2>
        <div className="home-categories__grid">
          {CATEGORIES.map((cat, index) => (
            <Card
              key={cat.name}
              className="home-category-card"
              icon={<span className="home-category-icon">{cat.icon}</span>}
              title={cat.name}
              text={cat.description}
              variant={index < 2 ? "elevated" : "elevated"}
              onClick={() => navigate(`/explore?category=${cat.name}`)}
            />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default Home;
