import { http } from "./http";

export const createAppointment = async (payload) => (await http.post("/appointments", payload)).data;
export const myAppointments = async (filters = {}) => {
  const params = {};
  if (filters?.from && filters?.to) {
    params.from = filters.from;
    params.to = filters.to;
  }
  return (await http.get("/appointments/me", { params })).data;
};

export const cancelAppointment = async (id) => (await http.post(`/appointments/${id}/cancel`)).data;
export const rescheduleAppointment = async (id, newStartAt) =>(await http.post(`/appointments/${id}/reschedule`, { newStartAt })).data;
