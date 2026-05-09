import type React from "react";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

function Layout({ children, className = "", fullWidth = false }: LayoutProps) {
  return (
    <div className={`layout-wrapper ${className}`.trim()}>
      <main className={`layout-inner${fullWidth ? " layout-inner--full" : ""}`}>
        {children}
      </main>
    </div>
  );
}

export default Layout;
