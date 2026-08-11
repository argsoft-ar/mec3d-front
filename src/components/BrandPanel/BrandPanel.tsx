import "./BrandPanel.css";

function BrandPanel() {
  return (
    <div className="login-brand" aria-hidden="true">
      <div className="login-brand__blob login-brand__blob--blue" />
      <div className="login-brand__blob login-brand__blob--orange" />
      <div className="login-brand__blob login-brand__blob--purple" />
      <div className="login-brand__grid" />
      <div className="login-brand__gear login-brand__gear--1" />
      <div className="login-brand__gear login-brand__gear--2" />
      <div className="login-brand__gear login-brand__gear--3" />
      <div className="login-brand__hex login-brand__hex--1" />
      <div className="login-brand__hex login-brand__hex--2" />
      <div className="login-brand__content">
        <h1 className="login-brand__logo">MEC3D</h1>
        <p className="login-brand__tagline">
          Marketplace de piezas mecánicas 3D
        </p>
        <div className="login-brand__divider" />
        <ul className="login-brand__features">
          <li>Impresión 3D bajo demanda</li>
          <li>Piezas mecánicas certificadas</li>
          <li>Entrega rápida en todo el país</li>
        </ul>
      </div>
    </div>
  );
}

export default BrandPanel;
