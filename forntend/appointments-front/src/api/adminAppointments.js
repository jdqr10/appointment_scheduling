import { http } from "./http";

export const adminListAppointments = async () =>
  (await http.get("/admin/appointments")).data;

export const adminConfirmAppointment = async (id) =>
  (await http.post(`/admin/appointments/${id}/confirm`)).data;

export const adminCompleteAppointment = async (id) =>
  (await http.post(`/admin/appointments/${id}/complete`)).data;

export const adminCancelAppointment = async (id) =>
  (await http.post(`/admin/appointments/${id}/cancel`)).data;
