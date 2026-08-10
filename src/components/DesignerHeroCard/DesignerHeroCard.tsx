import "./DesignerHeroCard.css";

interface DesignerStats {
  designs: number;
  downloads: number;
  avgRating: number;
}

interface DesignerHeroCardProps {
  readonly initials: string;
  readonly name: string;
  readonly tagline: string;
  readonly stats?: DesignerStats;
  readonly onViewProfile?: () => void;
  readonly role?: string;
  readonly score?: number;
  readonly onEdit?: () => void;
}

function formatDownloads(n: number): string {
  return n >= 1000
    ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
    : String(n);
}

const ROLE_LABELS: Record<string, string> = {
  disenador: "Diseñador",
  fabricante: "Fabricante",
  comprador: "Comprador",
  admin: "Admin",
};

function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role.charAt(0).toUpperCase() + role.slice(1);
}

function DesignerHeroCard({
  initials,
  name,
  tagline,
  stats,
  onViewProfile,
  role,
  score,
  onEdit,
}: DesignerHeroCardProps) {
  if (stats) {
    return (
      <div className="designer-hero-card">
        <div className="designer-hero-card__header">
          <div className="designer-hero-card__avatar">{initials}</div>
          <div className="designer-hero-card__info">
            <h1 className="designer-hero-card__name">
              {name}
              {role && (
                <span className="designer-hero-card__role-badge">
                  {getRoleLabel(role)}
                </span>
              )}
            </h1>
            <p className="designer-hero-card__tagline">{tagline}</p>
            {score !== undefined && (
              <span className="designer-hero-card__score">
                ★ {score.toFixed(1)}
              </span>
            )}
          </div>
          {onViewProfile && (
            <button
              className="designer-hero-card__profile-btn"
              type="button"
              onClick={onViewProfile}
            >
              Ver perfil
            </button>
          )}
          {onEdit && (
            <button
              className="designer-hero-card__profile-btn"
              type="button"
              onClick={onEdit}
            >
              Editar perfil
            </button>
          )}
        </div>
        <div className="designer-hero-card__stats">
          <div className="designer-hero-card__stat">
            <span className="designer-hero-card__stat-value">
              {stats.designs}
            </span>
            <span className="designer-hero-card__stat-label">
              Diseños publicados
            </span>
          </div>
          <div className="designer-hero-card__stat">
            <span className="designer-hero-card__stat-value">
              {formatDownloads(stats.downloads)}
            </span>
            <span className="designer-hero-card__stat-label">
              Descargas totales
            </span>
          </div>
          <div className="designer-hero-card__stat">
            <span className="designer-hero-card__stat-value">
              {stats.avgRating.toFixed(1)}
            </span>
            <span className="designer-hero-card__stat-label">
              Reputación media
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="designer-hero-card designer-hero-card--compact">
      <div className="designer-hero-card__header">
        <div className="designer-hero-card__avatar designer-hero-card__avatar--sm">
          {initials}
        </div>
        <div className="designer-hero-card__info">
          <h4 className="designer-hero-card__name designer-hero-card__name--sm">
            {name}
            {role && (
              <span className="designer-hero-card__role-badge">
                {getRoleLabel(role)}
              </span>
            )}
          </h4>
          <p className="designer-hero-card__tagline">{tagline}</p>
          {score !== undefined && (
            <span className="designer-hero-card__score">
              ★ {score.toFixed(1)}
            </span>
          )}
        </div>
        {onViewProfile && (
          <button
            className="designer-hero-card__profile-btn"
            type="button"
            onClick={onViewProfile}
          >
            Ver perfil
          </button>
        )}
        {onEdit && (
          <button
            className="designer-hero-card__profile-btn"
            type="button"
            onClick={onEdit}
          >
            Editar perfil
          </button>
        )}
      </div>
    </div>
  );
}

export default DesignerHeroCard;
