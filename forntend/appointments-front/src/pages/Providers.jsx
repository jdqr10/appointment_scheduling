import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProviders } from "../api/catalog";

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await listProviders();
        if (mounted) setProviders(Array.isArray(data) ? data : []);
      } catch (e) {
        const msg = e?.response?.data?.message || "No se pudieron cargar los providers.";
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Providers</h2>

      {loading && <div className="mt-4 text-sm text-slate-600">Cargando...</div>}

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && providers.length === 0 && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          No hay providers activos.
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => (
          <article key={p.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-base font-semibold text-slate-900">{p.name || `Provider #${p.id}`}</div>
            <div className="mt-1 text-sm text-slate-500">ID: {p.id}</div>

            <div className="mt-4 flex items-center gap-3 text-sm">
              <Link to={`/providers/${p.id}`} className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900">
                Ver detalle
              </Link>
              <Link to={`/providers/${p.id}/book`} className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900">
                Reservar
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
