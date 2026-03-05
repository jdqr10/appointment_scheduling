import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Providers from "./pages/Providers";
import ProviderDetails from "./pages/ProviderDetails";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import AdminAppointments from "./pages/AdminAppointments";
import RequireAuth from "./auth/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Navigate to="/providers" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/providers" element={<Providers />} />
            <Route path="/providers/:id" element={<ProviderDetails />} />

            

            <Route
              path="/providers/:id/book"
              element={
                <RequireAuth roles={["CLIENT"]}>
                  <BookAppointment />
                </RequireAuth>
              }
            />

            <Route
              path="/me/appointments"
              element={
                <RequireAuth roles={["CLIENT"]}>
                  <MyAppointments />
                </RequireAuth>
              }
            />

            <Route
              path="/admin/appointments"
              element={
                <RequireAuth roles={["ADMIN"]}>
                  <AdminAppointments />
                </RequireAuth>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
