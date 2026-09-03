import "./PageLoader.css";

interface PageLoaderProps {
  label?: string;
}

export default function PageLoader({
  label = "Cargando...",
}: Readonly<PageLoaderProps>) {
  return (
    <output className="page-loader" aria-label={label}>
      <div className="page-loader__spinner" aria-hidden="true" />
      <span className="page-loader__label">{label}</span>
    </output>
  );
}
