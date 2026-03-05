import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProvider, providerServices } from "../api/catalog";

export default function ProviderDetails() {
  const { id } = useParams();

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const p = await getProvider(id);
        const s = await providerServices(id);

        if (mounted) {
          setProvider(p);
          setServices(Array.isArray(s) ? s : []);
        }
      } catch (e) {
        const msg = e?.response?.data?.message || "No se pudo cargar el provider.";
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="mx-auto w-full max-w-6xl text-sm text-slate-600">Cargando...</div>;

  if (error) {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4">
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
        <Link to="/providers" className="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900">
          Volver
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{provider?.name || `Provider #${id}`}</h2>
          <div className="mt-1 text-sm text-slate-500">ID: {provider?.id ?? id}</div>
        </div>

        <Link
          to={`/providers/${id}/book`}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Reservar cita
        </Link>
      </div>

      <h3 className="mt-6 text-lg font-semibold text-slate-900">Servicios</h3>

      {services.length === 0 ? (
        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Este provider no tiene servicios activos.
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <article key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-base font-semibold text-slate-900">{s.name || `Service #${s.id}`}</div>
              <div className="mt-2 text-sm text-slate-600">
                Duración: <span className="font-semibold text-slate-900">{s.durationMinutes ?? s.durationMin ?? "?"}</span> min
              </div>

              <div className="mt-3">
                <Link
                  to={`/providers/${id}/book?serviceId=${s.id}`}
                  className="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                >
                  Reservar este servicio
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-5">
        <Link to="/providers" className="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900">
          ← Volver a Providers
        </Link>
      </div>
    </section>
  );
}
