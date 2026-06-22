import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Card from "../../components/Card/Card";
import DesignerHeroCard from "../../components/DesignerHeroCard/DesignerHeroCard";
import ProductCard from "../../components/ProductCard/ProductCard";
import ProductCardSkeleton from "../../components/ProductCard/ProductCardSkeleton";
import { productService } from "../../services/product.service";
import type { Product } from "../../interfaces/product.interface";
import type { UsuarioPublico } from "../../interfaces/user.interface";
import "./Account.css";

function deriveDisplayName(email: string): string {
  const local = email.split("@")[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function deriveInitials(email: string): string {
  return email.charAt(0).toUpperCase();
}

function Account() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const rawUser = localStorage.getItem("auth_user");
  const user: UsuarioPublico | null = rawUser
    ? (JSON.parse(rawUser) as UsuarioPublico)
    : null;

  const displayName = user ? deriveDisplayName(user.email) : "Usuario";
  const initials = user ? deriveInitials(user.email) : "U";

  useEffect(() => {
    productService
      .getAll()
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const totalDownloads = products.reduce((sum, p) => sum + p.downloads, 0);
  const avgRating =
    products.length > 0
      ? products.reduce((sum, p) => sum + p.rating, 0) / products.length
      : 0;

  return (
    <Layout>
      <div className="account">
        <Card variant="default" disableHover>
          <DesignerHeroCard
            initials={initials}
            name={displayName}
            tagline={user?.email ?? ""}
            stats={{
              designs: products.length,
              downloads: totalDownloads,
              avgRating,
            }}
          />
        </Card>

        <section className="account__section">
          <h2 className="account__section-title">Mis diseños</h2>
          <div className="account__grid">
            {loading
              ? Array.from({ length: 6 }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : products.map((p) => (
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

export default Account;
