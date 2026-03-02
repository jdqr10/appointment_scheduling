import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #ddd" }}>
      <Link to="/providers">Providers</Link>
      {isAuthenticated && <Link to="/me/appointments">Mis citas</Link>}
      <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
        {isAuthenticated ? (
          <>
            <span style={{ fontSize: 14, opacity: 0.8 }}>
              {user?.email || user?.username || "Usuario"}
            </span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}