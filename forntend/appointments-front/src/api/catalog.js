import { http } from "./http";

export const listProviders = async () => (await http.get("/providers")).data;
export const getProvider = async (id) => (await http.get(`/providers/${id}`)).data;
export const providerServices = async (id) => (await http.get(`/providers/${id}/services`)).data;
export const listServices = async () => (await http.get("/services")).data;