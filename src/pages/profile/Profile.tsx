import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Card/Card";
import DesignerHeroCard from "../../components/DesignerHeroCard/DesignerHeroCard";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import ProductCard from "../../components/ProductCard/ProductCard";
import { productService } from "../../services/product.service";
import type {
  Product,
  ProductDesigner,
} from "../../interfaces/product.interface";
import type { BreadcrumbItem } from "../../components/Breadcrumb/Breadcrumb";
import "./Profile.css";

const BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { label: "Home", path: "/" },
  { label: "Explorar", path: "/explore" },
];

function Profile() {
  const { designerName: encodedName } = useParams<{ designerName: string }>();
  const navigate = useNavigate();
  const designerName = decodeURIComponent(encodedName ?? "");

  const [products, setProducts] = useState<Product[]>([]);
  const [designer, setDesigner] = useState<ProductDesigner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getAll().then((all) => {
      const filtered = all.filter((p) => p.designer.name === designerName);
      setProducts(filtered);
      setDesigner(filtered.length > 0 ? filtered[0].designer : null);
      setLoading(false);
    });
  }, [designerName]);

  if (loading) {
    return (
      <Layout>
        <p>Cargando...</p>
      </Layout>
    );
  }

  if (!designer) {
    return (
      <Layout>
        <p>Diseñador no encontrado.</p>
      </Layout>
    );
  }

  const totalDownloads = products.reduce((sum, p) => sum + p.downloads, 0);
  const avgRating =
    products.reduce((sum, p) => sum + p.rating, 0) / products.length;

  const breadcrumbItems: BreadcrumbItem[] = [
    ...BREADCRUMB_ITEMS,
    { label: designerName },
  ];

  return (
    <Layout>
      <div className="profile">
        <Breadcrumb items={breadcrumbItems} />

        <Card variant="default" disableHover>
          <DesignerHeroCard
            initials={designer.initials}
            name={designer.name}
            tagline={designer.tagline}
            stats={{
              designs: products.length,
              downloads: totalDownloads,
              avgRating,
            }}
          />
        </Card>

        <section className="profile__section">
          <h2 className="profile__section-title">Diseños de {designer.name}</h2>
          <div className="profile__grid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                imageUrl={p.imageUrl}
                title={p.title}
                description={p.description}
                rating={p.rating}
                downloads={p.downloads}
                price={p.price}
                onClick={() => navigate(`/product/${p.id}`)}
              />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Profile;
