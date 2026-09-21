import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import {
  Home as HomeIcon,
  Compass,
  LayoutDashboard,
  User,
  ShoppingBag,
  MessageSquare,
  Hammer,
} from "lucide-react";
import Navbar from "./components/Navbar/Navbar";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import Account from "./pages/account/Account";
import DetailProduct from "./pages/products/DetailProduct";
import ProductPreview3D from "./pages/products/ProductPreview3D";
import ProductFormPage from "./pages/products/ProductFormPage";
import ProductsPage from "./pages/products/ProductsPage";
import PurchaseDecision from "./pages/products/PurchaseDecision";
import FabricanteSelection from "./pages/fabricacion/FabricanteSelection";
import MisSolicitudesFabricacion from "./pages/fabricacion/MisSolicitudesFabricacion";
import PurchasesPage from "./pages/account/PurchasesPage";
import ChatPage from "./pages/chat/ChatPage";
import Profile from "./pages/profile/Profile";
import type { NavLink } from "./types";
import type { RolUsuario } from "./interfaces";
import "./index.css";

const BASE_NAV_LINKS: NavLink[] = [
  { label: "Home", path: "/", icon: <HomeIcon size={18} strokeWidth={1.5} /> },
  {
    label: "Explorar",
    path: "/explore",
    icon: <Compass size={18} strokeWidth={1.5} />,
  },
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={18} strokeWidth={1.5} />,
  },
  {
    label: "Mi Cuenta",
    path: "/account",
    icon: <User size={18} strokeWidth={1.5} />,
  },
  {
    label: "Mis Compras",
    path: "/account/purchases",
    icon: <ShoppingBag size={18} strokeWidth={1.5} />,
  },
  {
    label: "Chat",
    path: "/chat",
    icon: <MessageSquare size={18} strokeWidth={1.5} />,
  },
];

const FABRICANTE_NAV_LINK: NavLink = {
  label: "Mis Solicitudes",
  path: "/fabricacion/mis-solicitudes",
  icon: <Hammer size={18} strokeWidth={1.5} />,
};

const AUTH_ROUTES = ["/login", "/register"];

function getCurrentUserRole(): RolUsuario | null {
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try {
    return (
      (JSON.parse(raw) as { rolPrincipal?: RolUsuario }).rolPrincipal ?? null
    );
  } catch {
    return null;
  }
}

function AppShell() {
  const location = useLocation();
  const isAuthRoute = AUTH_ROUTES.includes(location.pathname);
  const navLinks =
    getCurrentUserRole() === "fabricante"
      ? [...BASE_NAV_LINKS, FABRICANTE_NAV_LINK]
      : BASE_NAV_LINKS;

  return (
    <>
      {isAuthRoute ? null : <Navbar links={navLinks} />}
      <main className={isAuthRoute ? undefined : "main--with-sidebar"}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ProductsPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account" element={<Account />} />
            <Route path="/product/:id" element={<DetailProduct />} />
            <Route path="/product/:id/preview" element={<ProductPreview3D />} />
            <Route
              path="/product/:id/purchase"
              element={<PurchaseDecision />}
            />
            <Route
              path="/product/:id/fabricantes"
              element={<FabricanteSelection />}
            />
            <Route
              path="/fabricacion/mis-solicitudes"
              element={<MisSolicitudesFabricacion />}
            />
            <Route path="/account/purchases" element={<PurchasesPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:conversacionId" element={<ChatPage />} />
            <Route path="/profile/:designerName" element={<Profile />} />
            <Route
              path="/dashboard/products/new"
              element={<ProductFormPage />}
            />
            <Route
              path="/dashboard/products/:id/edit"
              element={<ProductFormPage />}
            />
          </Route>
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
