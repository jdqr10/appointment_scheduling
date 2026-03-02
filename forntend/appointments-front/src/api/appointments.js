import { http } from "./http";

export const createAppointment = async (payload) => (await http.post("/appointments", payload)).data;
export const myAppointments = async ({ from, to }) =>
  (await http.get("/appointments/me", { params: { from, to } })).data;

export const cancelAppointment = async (id) => (await http.post(`/appointments/${id}/cancel`)).data;
export const rescheduleAppointment = async (id, newStartAt) =>
  (await http.post(`/appointments/${id}/reschedule`, { newStartAt })).data;