import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 16 }}>Cargando sesión…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  // roles opcional: si tu /auth/me devuelve role: "CLIENT"/"ADMIN"
  if (roles?.length) {
    const role = user?.role; // ajusta si tu backend usa otro campo
    if (!roles.includes(role)) return <div style={{ padding: 16 }}>No autorizado</div>;
  }

  return children;
}