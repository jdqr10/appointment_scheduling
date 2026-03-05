import { useEffect, useState } from "react";
import {
  adminListAppointments,
  adminConfirmAppointment,
  adminCancelAppointment,
} from "../api/adminAppointments";

function statusBadge(status) {
  switch (status) {
    case "PENDING":
      return { label: "Pendiente", classes: "bg-amber-100 text-amber-700" };
    case "CONFIRMED":
      return { label: "Confirmada", classes: "bg-sky-100 text-sky-700" };
    case "COMPLETED":
      return { label: "Completada", classes: "bg-emerald-100 text-emerald-700" };
    case "CANCELLED":
      return { label: "Cancelada", classes: "bg-rose-100 text-rose-700" };
    default:
      return { label: status, classes: "bg-slate-100 text-slate-700" };
  }
}

export default function AdminAppointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionMsg, setActionMsg] = useState("");
  const [actionError, setActionError] = useState("");
  const [actingId, setActingId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await adminListAppointments();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "No se pudieron cargar las citas de admin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAccept(id) {
    setActionMsg("");
    setActionError("");
    setActingId(id);
    try {
      await adminConfirmAppointment(id);
      setActionMsg("Cita aceptada correctamente.");
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "No se pudo aceptar la cita.";
      setActionError(msg);
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id) {
    setActionMsg("");
    setActionError("");
    setActingId(id);
    try {
      await adminCancelAppointment(id);
      setActionMsg("Cita rechazada/cancelada correctamente.");
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "No se pudo rechazar la cita.";
      setActionError(msg);
    } finally {
      setActingId(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Gestión de citas (Admin)</h2>
        <button
          onClick={load}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Refrescar
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {actionError && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {actionError}
        </div>
      )}

      {actionMsg && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {actionMsg}
        </div>
      )}

      {loading ? (
        <div className="mt-4 text-sm text-slate-600">Cargando...</div>
      ) : items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          No hay citas para mostrar.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((a) => {
            const start = new Date(a.startAt);
            const end = new Date(a.endAt);
            const badge = statusBadge(a.status);

            const canAccept = a.status === "PENDING";
            const canReject = a.status === "PENDING" || a.status === "CONFIRMED";
            const busy = actingId === a.id;

            return (
              <article key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-semibold text-slate-900">Cita #{a.id}</div>
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="mt-1 text-sm text-slate-600">
                      {start.toLocaleString()} → {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      Provider #{a.providerId} · Service #{a.serviceId} · User #{a.userId}
                    </div>
                    {a.notes && <div className="mt-2 text-sm text-slate-700">Notas: {a.notes}</div>}
                  </div>

                  <div className="flex min-w-44 flex-col gap-2">
                    <button
                      disabled={!canAccept || busy}
                      onClick={() => handleAccept(a.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Aceptar
                    </button>

                    <button
                      disabled={!canReject || busy}
                      onClick={() => handleReject(a.id)}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
