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
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Registro falló. Revisa los datos.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "32px auto", padding: 16 }}>
      <h2>Register</h2>

      {error && (
        <div style={{ background: "#ffe5e5", padding: 10, border: "1px solid #ffb3b3", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label>
          Nombre completo (opcional)
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={120}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

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
            minLength={8}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <button disabled={submitting} type="submit" style={{ padding: 10 }}>
          {submitting ? "Creando..." : "Crear cuenta"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        ¿Ya tienes cuenta? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
