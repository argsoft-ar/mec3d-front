import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Home as HomeIcon, Compass, LayoutDashboard, User } from "lucide-react";
import Navbar from "./components/Navbar/Navbar";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import Account from "./pages/account/Account";
import DetailProduct from "./pages/products/DetailProduct";
import ProductFormPage from "./pages/products/ProductFormPage";
import ProductsPage from "./pages/products/ProductsPage";
import Profile from "./pages/profile/Profile";
import type { NavLink } from "./types";
import "./index.css";

const navLinks: NavLink[] = [
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
];

const AUTH_ROUTES = ["/login", "/register"];

function AppShell() {
  const location = useLocation();
  const isAuthRoute = AUTH_ROUTES.includes(location.pathname);

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
