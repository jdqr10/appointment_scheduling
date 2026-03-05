import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/providers" className="rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          Providers
        </Link>
        {isAuthenticated && user?.role === "CLIENT" && (
          <Link to="/me/appointments" className="rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Mis citas
          </Link>
        )}
        {isAuthenticated && user?.role === "ADMIN" && (
          <Link to="/admin/appointments" className="rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Citas admin
          </Link>
        )}
        <div className="ml-auto flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span className="text-sm text-slate-500">
              {user?.email || user?.username || "Usuario"}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="rounded-md px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Register
            </Link>
          </>
        )}
        </div>
      </div>
    </header>
  );
}
