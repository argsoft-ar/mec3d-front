import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home as HomeIcon, Compass, LayoutDashboard, User } from "lucide-react";
import Navbar from "./components/Navbar/Navbar";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import Dashboard from "./pages/dashboard/Dashboard";
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

function App() {
  return (
    <BrowserRouter>
      <Navbar links={navLinks} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
