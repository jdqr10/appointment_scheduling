import { http } from "./http";

export const getSlots = async ({ providerId, from, to, durationMinutes }) =>
  (await http.get(`/providers/${providerId}/availability/slots`, { params: { from, to, durationMinutes } })).data;

export const getCalendar = async ({ providerId, from, to, includeSlots, durationMinutes, statuses }) =>
  (await http.get(`/providers/${providerId}/calendar`, {
    params: { from, to, includeSlots, durationMinutes, statuses },
  })).data;