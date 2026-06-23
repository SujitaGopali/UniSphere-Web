import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
import { getTokenCookie } from "../cookies";
import { ApiResponse } from "./auth";
import { EventResponse } from "./event";

export interface RegistrationResponse {
  _id: string;
  user: string;
  event: EventResponse;
  status: "registered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export async function registerForEvent(eventId: string): Promise<ApiResponse<RegistrationResponse>> {
  const token = await getTokenCookie();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await axiosInstance.post<ApiResponse<RegistrationResponse>>(
    API.REGISTRATIONS.BASE,
    { eventId },
    { headers }
  );
  return data;
}

export async function cancelRegistration(registrationId: string): Promise<ApiResponse<null>> {
  const token = await getTokenCookie();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    API.REGISTRATIONS.BY_ID(registrationId),
    { headers }
  );
  return data;
}

export async function getMyRegistrations(): Promise<ApiResponse<RegistrationResponse[]>> {
  const token = await getTokenCookie();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await axiosInstance.get<ApiResponse<RegistrationResponse[]>>(
    API.REGISTRATIONS.MY,
    { headers }
  );
  return data;
}
