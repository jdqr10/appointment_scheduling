import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getProviderCalendar } from "../api/calendar";
import { weekRangeISO, addDays } from "../utils/week";

function fmtDayTitle(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "2-digit" });
}

function timeLabel(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ProviderCalendar() {
  const { id } = useParams();
  const providerId = Number(id);

  const [searchParams] = useSearchParams();
  const defaultDuration = Number(searchParams.get("durationMinutes") || 30);

  const [durationMinutes, setDurationMinutes] = useState(defaultDuration);
  const [anchor, setAnchor] = useState(() => new Date());
  const range = useMemo(() => weekRangeISO(anchor), [anchor]);

  const [statusFilter, setStatusFilter] = useState(["PENDING", "CONFIRMED"]); // típico para agenda
  const [days, setDays] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const data = await getProviderCalendar({
        providerId,
        from: range.from,
        to: range.to,
        includeSlots: true,
        durationMinutes,
        statuses: statusFilter,
      });
      setDays(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "No se pudo cargar el calendario.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, range.from, range.to, durationMinutes, statusFilter.join(",")]);

  const dayMap = useMemo(() => {
    const m = new Map();
    days.forEach((d) => m.set(d.date, d));
    return m;
  }, [days]);

  const weekDays = useMemo(() => {
    const out = [];
    for (let i = 0; i < 7; i++) {
      out.push(addDays(range.monday, i));
    }
    return out;
  }, [range.monday]);

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <Link to={`/providers/${providerId}`}>← Volver al Provider</Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Calendario del Provider #{providerId}</h2>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => setAnchor(addDays(anchor, -7))}>← Semana</button>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            {range.from} → {range.to}
          </div>
          <button onClick={() => setAnchor(addDays(anchor, 7))}>Semana →</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
        <label>
          Duración (min)
          <select
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            style={{ marginLeft: 8, padding: 6 }}
          >
            {[15, 30, 45, 60, 90].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={statusFilter.includes("PENDING")}
            onChange={(e) =>
              setStatusFilter((prev) =>
                e.target.checked ? Array.from(new Set([...prev, "PENDING"])) : prev.filter((x) => x !== "PENDING")
              )
            }
          />
          PENDING
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={statusFilter.includes("CONFIRMED")}
            onChange={(e) =>
              setStatusFilter((prev) =>
                e.target.checked ? Array.from(new Set([...prev, "CONFIRMED"])) : prev.filter((x) => x !== "CONFIRMED")
              )
            }
          />
          CONFIRMED
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={statusFilter.includes("COMPLETED")}
            onChange={(e) =>
              setStatusFilter((prev) =>
                e.target.checked ? Array.from(new Set([...prev, "COMPLETED"])) : prev.filter((x) => x !== "COMPLETED")
              )
            }
          />
          COMPLETED
        </label>

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={statusFilter.includes("CANCELLED")}
            onChange={(e) =>
              setStatusFilter((prev) =>
                e.target.checked ? Array.from(new Set([...prev, "CANCELLED"])) : prev.filter((x) => x !== "CANCELLED")
              )
            }
          />
          CANCELLED
        </label>

        <button onClick={load}>Refrescar</button>
      </div>

      {error && (
        <div style={{ background: "#ffe5e5", padding: 10, border: "1px solid #ffb3b3", marginTop: 12 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ marginTop: 12 }}>Cargando...</div>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
          {weekDays.map((d) => {
            const dateISO = d.toISOString().slice(0, 10); // YYYY-MM-DD
            const day = dayMap.get(dateISO);

            const appts = day?.appointments || [];
            const slots = day?.availableSlots || [];
            const summary = day?.summary;

            return (
              <div key={dateISO} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10, minHeight: 240 }}>
                <div style={{ fontWeight: 800 }}>{fmtDayTitle(dateISO)}</div>

                {summary && (
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                    Total: {summary.total} | P:{summary.pending} C:{summary.confirmed} X:{summary.cancelled} ✓:{summary.completed}
                  </div>
                )}

                <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>Citas</div>
                {appts.length === 0 ? (
                  <div style={{ fontSize: 13, opacity: 0.7 }}>—</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                    {appts.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: 8,
                          padding: 8,
                          background: "#fafafa",
                          fontSize: 12,
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>
                          {timeLabel(a.startAt)} - {a.status}
                        </div>
                        <div style={{ opacity: 0.85 }}>
                          {a.serviceName ? a.serviceName : `Service #${a.serviceId}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700 }}>Slots</div>
                {slots.length === 0 ? (
                  <div style={{ fontSize: 13, opacity: 0.7 }}>—</div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                    {slots.slice(0, 12).map((s) => (
                      <span
                        key={s.startAt}
                        title={`${s.startAt} → ${s.endAt}`}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: 999,
                          padding: "4px 8px",
                          fontSize: 12,
                          background: "white",
                        }}
                      >
                        {timeLabel(s.startAt)}
                      </span>
                    ))}
                    {slots.length > 12 && (
                      <span style={{ fontSize: 12, opacity: 0.7 }}>+{slots.length - 12} más</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
