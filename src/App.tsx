import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Home as HomeIcon, Compass, LayoutDashboard, User } from "lucide-react";
import Navbar from "./components/Navbar/Navbar";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
import DetailProduct from "./pages/products/DetailProduct";
import AddProduct from "./pages/products/AddProduct";
import EditProduct from "./pages/products/EditProduct";
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
      {!isAuthRoute && <Navbar links={navLinks} />}
      <main
        style={
          !isAuthRoute ? { marginLeft: "var(--sidebar-width)" } : undefined
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account" element={<Dashboard />} />
            <Route path="/product/:id" element={<DetailProduct />} />
            <Route path="/dashboard/products/new" element={<AddProduct />} />
            <Route
              path="/dashboard/products/:id/edit"
              element={<EditProduct />}
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
