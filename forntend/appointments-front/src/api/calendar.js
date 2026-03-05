import { http } from "./http";

export const getProviderCalendar = async ({
  providerId,
  from, // "YYYY-MM-DD"
  to,   // "YYYY-MM-DD"
  includeSlots = true,
  durationMinutes = 30,
  statuses, // array opcional: ["PENDING","CONFIRMED"]
}) =>
  (await http.get(`/providers/${providerId}/calendar`, {
    params: { from, to, includeSlots, durationMinutes, statuses },
  })).data;