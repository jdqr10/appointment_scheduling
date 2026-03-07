import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("q") || "");
  }, [location.search]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/providers?q=${encodeURIComponent(q)}` : "/providers");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/providers" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
            G
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">Glow</span>
        </Link>

        {isAuthenticated && user?.role === "CLIENT" && (
          <form onSubmit={handleSearchSubmit} className="hidden flex-1 lg:block">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar providers o servicios..."
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none ring-teal-200 transition focus:border-teal-500 focus:ring"
            />
          </form>
        )}

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            to="/providers"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Home
          </Link>

          {isAuthenticated && user?.role === "CLIENT" && (
            <Link
              to="/me/appointments"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Mis citas
            </Link>
          )}

          {isAuthenticated && user?.role === "ADMIN" && (
            <Link
              to="/admin/appointments"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Citas admin
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <span className="hidden rounded-full bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white sm:inline-block">
                {(user?.fullName || user?.email || "U").slice(0, 2).toUpperCase()}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Login
              </Link>
              <Link to="/register" className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
