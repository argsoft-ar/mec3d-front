import React, { useState, useEffect } from "react";
import {
  Car,
  Bike,
  Sailboat,
  House,
  Settings2,
  Cog,
  Search,
  Upload,
  Grid2X2,
  Users,
  Download,
  ChartNoAxesCombined,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { productService } from "../../services/product.service";
import type { Product } from "../../interfaces/product.interface";
import Layout from "../../components/Layout/Layout";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import ProductCard from "../../components/ProductCard/ProductCard";
import type { ProductCategory } from "../../types";
import "./Home.css";

interface CategoryItem {
  name: ProductCategory;
  icon: React.ReactNode;
  description: string;
}

const ICON_SIZE = 64;
const ICON_PROPS = { size: ICON_SIZE, strokeWidth: 1.5 };

interface ServiceItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

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

const SERVICES: ServiceItem[] = [
  {
    icon: <Grid2X2 size={32} strokeWidth={1.5} />,
    title: "12 Categorías",
    description:
      "Desde mecánica hasta tecnología, encuentra la pieza perfecta para tu proyecto",
  },
  {
    icon: <Users size={32} strokeWidth={1.5} />,
    title: "Comunidad de Diseñadores",
    description:
      "Comparte tus diseños y descubre plantillas creadas por profesionales",
  },
  {
    icon: <Download size={32} strokeWidth={1.5} />,
    title: "Descarga Instantánea",
    description:
      "Archivos STL y OBJ listos para imprimir en tu impresora 3D favorita",
  },
];

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productService.getAll().then(setProducts);
  }, []);

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

      <section className="home-services">
        <h2 className="home-section-title">¿Por qué MEC3D?</h2>
        <div className="home-services__grid">
          {SERVICES.map((service) => (
            <div key={service.title} className="home-service-card">
              <span className="home-service-card__icon">{service.icon}</span>
              <h3 className="home-service-card__title">{service.title}</h3>
              <p className="home-service-card__description">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-featured">
        <h2 className="home-section-title">
          Plantillas destacadas{" "}
          <ChartNoAxesCombined size={24} strokeWidth={1.5} />
        </h2>
        <div className="home-featured__grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              title={product.title}
              description={product.description}
              imageUrl={product.imageUrl}
              rating={product.rating}
              downloads={product.downloads}
              price={product.price}
              onClick={() => navigate(`/product/${product.id}`)}
            />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export default Home;
