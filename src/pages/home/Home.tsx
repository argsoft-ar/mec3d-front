import React, { useState, useEffect } from "react";
import {
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
import PageLoader from "../../components/PageLoader/PageLoader";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { CATEGORIAS } from "../../utils/categoria.util";
import "./Home.css";

const ICON_SIZE = 64;
const ICON_PROPS = { size: ICON_SIZE, strokeWidth: 1.5 };

interface ServiceItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SERVICES: ServiceItem[] = [
  {
    icon: <Grid2X2 size={32} strokeWidth={1.5} />,
    title: `${CATEGORIAS.length} Categorías`,
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
  const { requireAuth } = useRequireAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getAll()
      .then((res) => setProducts(res.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <Header
        title="MEC3D, todos los repuestos mecánicos o derivados que necesitas "
        accentText="en un solo lugar"
        subtitle="Encuentra el repuesto de tu maquina o el accesorio de tu moto o auto o lo que creas que ya no existe, descargala y fabricala a la vuelta de tu casa"
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
              onClick={() => {
                if (requireAuth("/dashboard")) navigate("/dashboard");
              }}
            />
          </>
        }
      />

      <section className="home-categories">
        <h2 className="home-section-title">Categorías</h2>
        <div className="home-categories__grid">
          {CATEGORIAS.map(
            ({ nombre, etiqueta, descripcion, icon: Icon }, index) => (
              <Card
                key={nombre}
                className="home-category-card"
                icon={
                  <span className="home-category-icon">
                    <Icon {...ICON_PROPS} />
                  </span>
                }
                title={etiqueta}
                text={descripcion}
                variant={index < 2 ? "elevated" : "elevated"}
                onClick={() =>
                  navigate(`/explore?category=${encodeURIComponent(nombre)}`)
                }
              />
            ),
          )}
        </div>
      </section>

      <section className="home-services">
        <h2 className="home-section-title">¿Por qué MEC3D?</h2>
        <div className="home-services__grid">
          {SERVICES.map((service) => (
            <Card
              key={service.title}
              icon={service.icon}
              title={service.title}
              text={service.description}
              variant="elevated"
              disableHover
            />
          ))}
        </div>
      </section>

      <section className="home-featured">
        <h2 className="home-section-title">
          Plantillas destacadas{" "}
          <ChartNoAxesCombined size={24} strokeWidth={1.5} />
        </h2>
        {loading ? (
          <PageLoader />
        ) : (
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
                tecnologia={product.tecnologia}
                materiales={product.materiales}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

export default Home;
