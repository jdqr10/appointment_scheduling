import { useEffect, useState } from "react";
import { myAppointments, cancelAppointment, rescheduleAppointment } from "../api/appointments";
import { getSlots } from "../api/availability";

function startOfDayISO(dateStr) {
  return `${dateStr}T00:00:00-05:00`;
}

function endOfDayISO(dateStr) {
  return `${dateStr}T23:59:59-05:00`;
}

function statusBadge(status) {
  switch (status) {
    case "COMPLETED":
      return { label: "Completada", classes: "bg-emerald-100 text-emerald-700" };
    case "CANCELLED":
      return { label: "Cancelada", classes: "bg-rose-100 text-rose-700" };
    case "PENDING":
      return { label: "Pendiente", classes: "bg-amber-100 text-amber-700" };
    case "CONFIRMED":
      return { label: "Confirmada", classes: "bg-sky-100 text-sky-700" };
    default:
      return { label: status, classes: "bg-slate-100 text-slate-700" };
  }
}

export default function MyAppointments() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleLoadingSlots, setRescheduleLoadingSlots] = useState(false);
  const [rescheduleSlotError, setRescheduleSlotError] = useState("");
  const [newStartAt, setNewStartAt] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [actionError, setActionError] = useState("");

  async function load({ useFilter = false } = {}) {
    setLoading(true);
    setError("");
    setActionMsg("");
    setActionError("");

    try {
      let data;
      if (useFilter) {
        if (!fromDate || !toDate) {
          throw new Error("Para filtrar por fecha debes seleccionar 'Desde' y 'Hasta'.");
        }
        const from = startOfDayISO(fromDate);
        const to = endOfDayISO(toDate);
        data = await myAppointments({ from, to });
      } else {
        data = await myAppointments();
      }
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudieron cargar tus citas.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(id) {
    setActionMsg("");
    setActionError("");
    try {
      await cancelAppointment(id);
      setActionMsg("Cita cancelada.");
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || "No se pudo cancelar.";
      setActionError(msg);
    }
  }

  function toISODate(value) {
    return new Date(value).toISOString().slice(0, 10);
  }

  function getDurationMinutes(appointment) {
    const start = new Date(appointment.startAt).getTime();
    const end = new Date(appointment.endAt).getTime();
    return Math.max(1, Math.round((end - start) / 60000));
  }

  async function loadRescheduleSlots(appointment, date) {
    setRescheduleLoadingSlots(true);
    setRescheduleSlotError("");
    setRescheduleSlots([]);
    setNewStartAt("");
    try {
      const data = await getSlots({
        providerId: appointment.providerId,
        from: date,
        to: date,
        durationMinutes: getDurationMinutes(appointment),
      });
      setRescheduleSlots(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "No se pudieron cargar los horarios disponibles.";
      setRescheduleSlotError(msg);
    } finally {
      setRescheduleLoadingSlots(false);
    }
  }

  async function handleRescheduleConfirm() {
    setActionMsg("");
    setActionError("");

    try {
      if (!rescheduleId) throw new Error("No hay cita seleccionada");
      if (!newStartAt) throw new Error("Selecciona un horario disponible");

      await rescheduleAppointment(rescheduleId, newStartAt);
      setActionMsg("Cita reprogramada.");
      setRescheduleId(null);
      setRescheduleDate("");
      setRescheduleSlots([]);
      setRescheduleSlotError("");
      setNewStartAt("");
      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "No se pudo reprogramar.";
      setActionError(msg);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Mis citas</h2>

      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-700">Desde</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 transition focus:border-slate-400 focus:ring"
          />
        </label>

        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-700">Hasta</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 transition focus:border-slate-400 focus:ring"
          />
        </label>

        <button
          onClick={() => load({ useFilter: true })}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Filtrar
        </button>

        <button
          onClick={() => {
            setFromDate("");
            setToDate("");
            load();
          }}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Ver todas
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
          No tienes citas para mostrar.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((a) => {
            const start = new Date(a.startAt);
            const end = new Date(a.endAt);
            const badge = statusBadge(a.status);

            const canCancel = a.status === "PENDING" || a.status === "CONFIRMED";
            const canReschedule = a.status === "PENDING" || a.status === "CONFIRMED";

            return (
              <article key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-semibold text-slate-900">
                        {a.serviceName ? a.serviceName : `Servicio #${a.serviceId}`}
                      </div>
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {start.toLocaleString()} → {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      Provider: {a.providerName ? a.providerName : `#${a.providerId}`}
                    </div>
                    {a.notes && <div className="mt-2 text-sm text-slate-700">Notas: {a.notes}</div>}
                  </div>

                  <div className="flex min-w-40 flex-col gap-2">
                    <button
                      disabled={!canCancel}
                      onClick={() => handleCancel(a.id)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancelar
                    </button>

                    <button
                      disabled={!canReschedule}
                      onClick={async () => {
                        const date = toISODate(a.startAt);
                        setRescheduleId(a.id);
                        setRescheduleDate(date);
                        setRescheduleSlots([]);
                        setRescheduleSlotError("");
                        setActionMsg("");
                        setActionError("");
                        await loadRescheduleSlots(a, date);
                      }}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reprogramar
                    </button>
                  </div>
                </div>

                {rescheduleId === a.id && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <div className="mb-2 text-sm font-semibold text-slate-900">Reprogramar cita</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={async (e) => {
                          const date = e.target.value;
                          setRescheduleDate(date);
                          if (!date) return;
                          await loadRescheduleSlots(a, date);
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 transition focus:border-slate-400 focus:ring"
                      />
                    </div>

                    {rescheduleLoadingSlots && (
                      <div className="mt-3 text-sm text-slate-600">Cargando horarios...</div>
                    )}

                    {rescheduleSlotError && (
                      <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {rescheduleSlotError}
                      </div>
                    )}

                    {!rescheduleLoadingSlots && !rescheduleSlotError && rescheduleSlots.length === 0 && (
                      <div className="mt-3 text-sm text-slate-600">
                        No hay horarios disponibles para la fecha seleccionada.
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {rescheduleSlots.map((slot) => {
                        const start = slot.startAt;
                        const selected = newStartAt === start;
                        const label = new Date(start).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        return (
                          <button
                            key={start}
                            onClick={() => setNewStartAt(start)}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                              selected
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        value={
                          newStartAt
                            ? `Horario seleccionado: ${new Date(newStartAt).toLocaleString()}`
                            : "Selecciona un horario para confirmar"
                        }
                        readOnly
                        className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                      />
                      <button
                        onClick={handleRescheduleConfirm}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        Confirmar cambio
                      </button>
                      <button
                        onClick={() => {
                          setRescheduleId(null);
                          setRescheduleDate("");
                          setRescheduleSlots([]);
                          setRescheduleSlotError("");
                          setNewStartAt("");
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Nota: el backend validará disponibilidad y evitará solapamientos.
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
