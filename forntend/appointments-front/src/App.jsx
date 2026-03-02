import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/providers" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* estas páginas las hacemos en el siguiente paso */}
        <Route path="/providers" element={<div style={{ padding: 16 }}>Providers (pendiente)</div>} />
        <Route path="/me/appointments" element={<div style={{ padding: 16 }}>Mis citas (pendiente)</div>} />
      </Routes>
    </BrowserRouter>
  );
}