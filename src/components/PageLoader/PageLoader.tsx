import "./PageLoader.css";

interface PageLoaderProps {
  label?: string;
}

export default function PageLoader({ label = "Cargando..." }: PageLoaderProps) {
  return (
    <div className="page-loader" role="status" aria-label={label}>
      <div className="page-loader__spinner" aria-hidden="true" />
      <span className="page-loader__label">{label}</span>
    </div>
  );
}
