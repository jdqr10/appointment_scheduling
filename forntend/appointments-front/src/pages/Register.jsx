import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRegister } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await apiRegister({
        email,
        password,
        fullName: fullName.trim() || undefined,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      const fieldErrors = err?.response?.data?.fields;
      const fieldMsg = fieldErrors && Object.values(fieldErrors).join(" | ");
      const msg =
        err?.response?.data?.message ||
        fieldMsg ||
        err?.response?.data?.error ||
        err?.message ||
        "Registro falló. Revisa los datos.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Register</h2>

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Nombre completo (opcional)</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={120}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 transition focus:border-slate-400 focus:ring"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 transition focus:border-slate-400 focus:ring"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={8}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 transition focus:border-slate-400 focus:ring"
          />
        </label>

        <button
          disabled={submitting}
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creando..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900">
          Login
        </Link>
      </p>
    </section>
  );
}
