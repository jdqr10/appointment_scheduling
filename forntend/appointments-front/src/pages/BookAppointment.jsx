import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { providerServices } from "../api/catalog";
import { getSlots } from "../api/availability";
import { createAppointment } from "../api/appointments";
import { toISODate } from "../utils/date";

function StepTitle({ number, title }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-teal-900 text-sm font-bold text-white">
        {number}
      </span>
      <h3 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h3>
    </div>
  );
}

function formatDateLabel(value) {
  if (!value) return "-";
  const parsed = new Date(`${value}T12:00:00`);
  return parsed.toLocaleDateString("es-CO", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTimeLabel(value) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isoToLocalDate(value) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function addDays(baseDate, days) {
  const next = new Date(baseDate);
  next.setDate(next.getDate() + days);
  return next;
}

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
  const minBookingDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);
  const maxBookingDate = useMemo(() => addDays(minBookingDate, 30), [minBookingDate]);
  const selectedDate = useMemo(() => isoToLocalDate(date), [date]);

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
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <Link
          to={`/providers/${providerId}`}
          className="inline-flex items-center gap-2 text-base font-medium text-teal-900 transition hover:text-teal-700"
        >
          <span aria-hidden>←</span>
          Volver al provider
        </Link>
      </div>

      <header>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Reservar cita</h1>
        <p className="mt-2 text-2xl text-slate-500">Selecciona tu servicio, fecha y horario preferido</p>
      </header>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <StepTitle number={1} title="Seleccionar servicio" />

        {services.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-700">
            Este proveedor no tiene servicios asignados o están inactivos.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {services.map((s) => {
              const duration = s.durationMinutes ?? s.durationMin ?? "?";
              const active = s.id === serviceId;
              return (
                <button
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    active
                      ? "border-teal-700 bg-teal-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-teal-300"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
                        active ? "bg-teal-200 text-teal-900" : "bg-cyan-100 text-cyan-900"
                      }`}
                    >
                      ✂
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-2xl font-semibold text-slate-900">{s.name}</span>
                      <span className="mt-1 block text-lg text-slate-600">
                        {duration} min
                        <span className="ml-3 font-semibold text-slate-900">
                          ${Number(s.price ?? 0).toLocaleString("en-US")}
                        </span>
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </article>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <StepTitle number={2} title="Elegir fecha" />

          <div className="mt-6 grid gap-4 md:grid-cols-[minmax(250px,300px)_1fr]">
            <div className="rounded-2xl border border-slate-200 p-4">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(value) => {
                  if (!value) return;
                  setDate(toISODate(value));
                }}
                showOutsideDays
                weekStartsOn={1}
                disabled={[
                  { dayOfWeek: [0] },
                  { before: minBookingDate },
                  { after: maxBookingDate },
                ]}
                className="text-base"
                classNames={{
                  months: "w-full",
                  month: "w-full",
                  caption: "mb-3 flex items-center justify-between text-slate-900",
                  caption_label: "text-lg font-semibold",
                  nav: "flex items-center gap-1",
                  button_previous:
                    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100",
                  button_next:
                    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100",
                  table: "w-full border-collapse",
                  weekdays: "text-slate-500",
                  weekday: "py-2 text-sm font-medium",
                  week: "w-full",
                  day: "text-center",
                  day_button:
                    "mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl text-base text-slate-800 transition hover:bg-slate-100",
                  selected: "bg-teal-900 text-white hover:bg-teal-900",
                  today: "border border-teal-300",
                  disabled: "text-slate-300 line-through opacity-60",
                  outside: "text-slate-300",
                }}
              />
              <div className="mt-4 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">
                Fecha seleccionada: <span className="font-semibold text-slate-900">{formatDateLabel(date)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-base text-slate-600">
                Elige una fecha para ver los horarios disponibles.
              </div>
              <div className="rounded-2xl bg-cyan-100 px-4 py-4 text-base text-slate-700">
                Los domingos no están disponibles. Las citas se pueden reservar con hasta 30 días de anticipación.
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-4 text-base text-slate-700">
                Duración del servicio: <span className="font-semibold text-slate-900">{durationMinutes ?? "-"}</span> min
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <StepTitle number={3} title="Horarios disponibles" />

          {slotLoading && <div className="mt-6 text-base text-slate-600">Cargando horarios...</div>}

          {slotError && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-700">
              {slotError}
            </div>
          )}

          {!slotLoading && !slotError && slots.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-lg text-slate-500">
              No hay horarios disponibles para esta fecha.
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {slots.map((s) => {
              const start = s.startAt;
              const active = selectedStartAt === start;

              return (
                <button
                  key={start}
                  onClick={() => setSelectedStartAt(start)}
                  className={`rounded-xl border px-4 py-3 text-base font-semibold transition ${
                    active
                      ? "border-teal-900 bg-teal-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-teal-400"
                  }`}
                >
                  {formatTimeLabel(start)}
                </button>
              );
            })}
          </div>
        </article>
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <StepTitle number={4} title="Confirmar reserva" />

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <label className="block space-y-2">
            <span className="text-lg font-medium text-slate-700">Notas adicionales</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Corte + barba, prefiero desvanecido a los lados..."
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base text-slate-900 outline-none ring-slate-300 transition focus:border-slate-400 focus:ring"
            />
          </label>

          <div className="space-y-3">
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-base text-slate-600">
              <div>Servicio: <span className="font-semibold text-slate-900">{selectedService?.name || "-"}</span></div>
              <div className="mt-1">Fecha: <span className="font-semibold text-slate-900">{formatDateLabel(date)}</span></div>
              <div className="mt-1">Hora: <span className="font-semibold text-slate-900">{formatTimeLabel(selectedStartAt)}</span></div>
            </div>

            <button
              disabled={submitting || !serviceId || !selectedStartAt}
              onClick={handleCreate}
              className="w-full rounded-2xl bg-teal-900 px-5 py-3 text-xl font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creando..." : "Reservar cita"}
            </button>
          </div>
        </div>

        {submitError && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-700">
            {submitError}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base text-emerald-700">
            {successMsg}
          </div>
        )}
      </article>
    </section>
  );
}
