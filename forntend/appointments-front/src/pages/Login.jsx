import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ email, password });

      // si venías de una ruta protegida, vuelve ahí
      const next = location.state?.from?.pathname || "/providers";
      navigate(next, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Login falló. Verifica credenciales.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "32px auto", padding: 16 }}>
      <h2>Login</h2>

      {error && (
        <div style={{ background: "#ffe5e5", padding: 10, border: "1px solid #ffb3b3", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <label>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <button disabled={submitting} type="submit" style={{ padding: 10 }}>
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
}