import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listProviders, providerServices } from "../api/catalog";
import { myAppointments } from "../api/appointments";
import { useAuth } from "../auth/AuthProvider";

function providerInitials(name) {
  const raw = (name || "P").trim();
  const parts = raw.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "P";
}

function heroColor(id) {
  const palette = [
    "from-teal-500 to-cyan-500",
    "from-orange-500 to-amber-500",
    "from-emerald-500 to-teal-500",
    "from-sky-500 to-indigo-500",
    "from-fuchsia-500 to-pink-500",
  ];
  return palette[id % palette.length];
}

export default function Providers() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const [providers, setProviders] = useState([]);
  const [servicesByProvider, setServicesByProvider] = useState({});
  const [upcomingCount, setUpcomingCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const baseProviders = await listProviders();
        if (!mounted) return;

        const safeProviders = Array.isArray(baseProviders) ? baseProviders : [];
        setProviders(safeProviders);

        const serviceEntries = await Promise.all(
          safeProviders.map(async (p) => {
            try {
              const services = await providerServices(p.id);
              return [p.id, Array.isArray(services) ? services : []];
            } catch {
              return [p.id, []];
            }
          })
        );

        if (!mounted) return;
        setServicesByProvider(Object.fromEntries(serviceEntries));

        if (isAuthenticated && user?.role === "CLIENT") {
          try {
            const data = await myAppointments();
            if (!mounted) return;
            const now = Date.now();
            const count = (Array.isArray(data) ? data : []).filter((a) => {
              if (!["PENDING", "CONFIRMED"].includes(a.status)) return false;
              return new Date(a.startAt).getTime() >= now;
            }).length;
            setUpcomingCount(count);
          } catch {
            setUpcomingCount(0);
          }
        }
      } catch (e) {
        const msg = e?.response?.data?.message || e?.response?.data?.error || "No se pudieron cargar los providers.";
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user?.role]);

  const filteredProviders = useMemo(() => {
    if (!q) return providers;
    return providers.filter((p) => {
      const providerName = (p.name || "").toLowerCase();
      const services = servicesByProvider[p.id] || [];
      const hasServiceMatch = services.some((s) => (s.name || "").toLowerCase().includes(q));
      return providerName.includes(q) || hasServiceMatch;
    });
  }, [providers, servicesByProvider, q]);

  return (
    <section className="mx-auto w-full max-w-7xl">
      {isAuthenticated && user?.role === "CLIENT" && (
        <div className="mb-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 p-6 text-white shadow-sm sm:p-8">
          <div className="text-sm font-medium text-teal-200">{upcomingCount} citas próximas</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Bienvenido{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
            Descubre profesionales disponibles y reserva en minutos.
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Providers disponibles</h2>
          <div className="mt-1 text-sm text-slate-500">
            {filteredProviders.length} resultado(s)
            {q ? ` para "${q}"` : ""}
          </div>
        </div>
      </div>

      {loading && <div className="mt-4 text-sm text-slate-600">Cargando...</div>}

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && filteredProviders.length === 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          No hay providers que coincidan con tu búsqueda.
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {filteredProviders.map((p) => {
          const services = servicesByProvider[p.id] || [];
          return (
            <article key={p.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className={`relative h-36 bg-gradient-to-br ${heroColor(p.id)}`}>
                <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  Disponible
                </span>
                <div className="absolute bottom-3 left-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-sm font-bold text-slate-900 shadow-sm">
                  {providerInitials(p.name)}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-xl font-bold text-slate-900">{p.name || `Provider #${p.id}`}</h3>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  ID #{p.id}
                </div>

                <div className="mt-3 min-h-11 text-sm text-slate-600">
                  {services.length > 0
                    ? `${services.length} servicio(s): ${services
                        .slice(0, 2)
                        .map((s) => s.name)
                        .join(", ")}${services.length > 2 ? "..." : ""}`
                    : "Sin servicios activos configurados"}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    to={`/providers/${p.id}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Ver detalle
                  </Link>
                  <Link
                    to={`/providers/${p.id}/book`}
                    className="rounded-lg bg-teal-700 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-teal-600"
                  >
                    Reservar
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
