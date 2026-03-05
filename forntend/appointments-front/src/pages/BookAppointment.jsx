import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { providerServices } from "../api/catalog";
import { getSlots } from "../api/availability";
import { createAppointment } from "../api/appointments";
import { toISODate } from "../utils/date";

export default function BookAppointment() {
  const { id } = useParams();
  const providerId = Number(id);

  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get("serviceId");

  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState(preselectedServiceId ? Number(preselectedServiceId) : null);
  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [services, serviceId]
  );

  const [date, setDate] = useState(() => toISODate(new Date()));

  const durationMinutes = useMemo(() => {
    if (!selectedService) return null;
    return selectedService.durationMinutes ?? selectedService.durationMin ?? null;
  }, [selectedService]);

  const [slots, setSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState("");

  const [selectedStartAt, setSelectedStartAt] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await providerServices(providerId);
        if (!mounted) return;
        setServices(Array.isArray(data) ? data : []);

        if (!serviceId && Array.isArray(data) && data.length > 0) {
          setServiceId(data[0].id);
        }
      } catch {
        setServices([]);
      }
    }
    load();
    return () => (mounted = false);
  }, [providerId]);

  useEffect(() => {
    let mounted = true;

    async function loadSlots() {
      setSlots([]);
      setSelectedStartAt("");
      setSlotError("");
      setSuccessMsg("");

      if (!serviceId || !durationMinutes) return;

      setSlotLoading(true);
      try {
        const data = await getSlots({
          providerId,
          from: date,
          to: date,
          durationMinutes,
        });

        if (!mounted) return;
        setSlots(Array.isArray(data) ? data : []);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          "No se pudieron cargar los horarios disponibles.";
        if (mounted) setSlotError(msg);
      } finally {
        if (mounted) setSlotLoading(false);
      }
    }

    loadSlots();
    return () => (mounted = false);
  }, [providerId, serviceId, durationMinutes, date]);

  async function handleCreate() {
    setSubmitting(true);
    setSubmitError("");
    setSuccessMsg("");

    try {
      if (!serviceId) throw new Error("Selecciona un servicio");
      if (!selectedStartAt) throw new Error("Selecciona un horario (slot)");

      await createAppointment({
        providerId,
        serviceId,
        startAt: selectedStartAt,
        notes: notes || null,
      });

      setSuccessMsg("Cita creada correctamente.");
      const data = await getSlots({ providerId, from: date, to: date, durationMinutes });
      setSlots(Array.isArray(data) ? data : []);
      setSelectedStartAt("");
      setNotes("");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo crear la cita.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4">
      <div>
        <Link
          to={`/providers/${providerId}`}
          className="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
        >
          ← Volver al Provider
        </Link>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reservar cita</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">1) Servicio</h3>

          <select
            value={serviceId || ""}
            onChange={(e) => setServiceId(Number(e.target.value))}
            disabled={services.length === 0}
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 transition focus:border-slate-400 focus:ring"
          >
            <option value="" disabled>
              Selecciona un servicio...
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.durationMinutes ?? s.durationMin ?? "?"} min)
              </option>
            ))}
          </select>

          {services.length === 0 && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Este provedor no tiene servicios asignados o están inactivos.
            </div>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">2) Fecha</h3>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 transition focus:border-slate-400 focus:ring"
          />

          <div className="mt-3 text-sm text-slate-600">
            Duración: <span className="font-semibold text-slate-900">{durationMinutes ?? "-"}</span> min
          </div>
        </article>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">3) Horarios disponibles</h3>

        {slotLoading && <div className="mt-3 text-sm text-slate-600">Cargando slots...</div>}

        {slotError && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {slotError}
          </div>
        )}

        {!slotLoading && !slotError && slots.length === 0 && (
          <div className="mt-3 text-sm text-slate-600">No hay slots disponibles para esta fecha.</div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {slots.map((s) => {
            const start = s.startAt;
            const label = new Date(start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const active = selectedStartAt === start;

            return (
              <button
                key={start}
                onClick={() => setSelectedStartAt(start)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">4) Confirmar</h3>

        <label className="mt-3 block space-y-1">
          <span className="text-sm font-medium text-slate-700">Notas (opcional)</span>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Corte + barba"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 transition focus:border-slate-400 focus:ring"
          />
        </label>

        {submitError && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {submitError}
          </div>
        )}

        {successMsg && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMsg}
          </div>
        )}

        <button
          disabled={submitting}
          onClick={handleCreate}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creando..." : "Crear cita"}
        </button>

        <div className="mt-3 text-sm text-slate-600">
          Slot seleccionado:{" "}
          <span className="font-semibold text-slate-900">
            {selectedStartAt ? new Date(selectedStartAt).toString() : "-"}
          </span>
        </div>
      </article>
    </section>
  );
}
