import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function RequireAuth({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        Cargando sesión...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;

  if (roles?.length) {
    const role = user?.role;
    if (!roles.includes(role)) {
      return (
        <div className="mx-auto w-full max-w-6xl rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 shadow-sm">
          No autorizado
        </div>
      );
    }
  }

  return children;
}
