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
}

function formatDownloads(n: number): string {
  return n >= 1000
    ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
    : String(n);
}

function DesignerHeroCard({
  initials,
  name,
  tagline,
  stats,
  onViewProfile,
}: DesignerHeroCardProps) {
  if (stats) {
    return (
      <div className="designer-hero-card">
        <div className="designer-hero-card__header">
          <div className="designer-hero-card__avatar">{initials}</div>
          <div className="designer-hero-card__info">
            <h1 className="designer-hero-card__name">{name}</h1>
            <p className="designer-hero-card__tagline">{tagline}</p>
          </div>
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
        {onViewProfile && (
          <div className="designer-hero-card__footer">
            <button
              className="designer-hero-card__profile-btn"
              type="button"
              onClick={onViewProfile}
            >
              Ver perfil
            </button>
          </div>
        )}
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
          </h4>
          <p className="designer-hero-card__tagline">{tagline}</p>
        </div>
      </div>
      {onViewProfile && (
        <div className="designer-hero-card__footer">
          <button
            className="designer-hero-card__profile-btn"
            type="button"
            onClick={onViewProfile}
          >
            Ver perfil
          </button>
        </div>
      )}
    </div>
  );
}

export default DesignerHeroCard;
