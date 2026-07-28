import axiosInstance from "./axios-instance";
import { API } from "./endpoints";
import { getTokenCookie } from "../cookies";
import { ApiResponse } from "./auth";

export interface EventPayload {
  title: string;
  description: string;
  date: string;
  location: string;
  category:
    | "Sports"
    | "Technical"
    | "Cultural"
    | "Workshop"
    | "Other"
    | "Literary"
    | "Management"
    | "Others";
  eventType?: "Intercollegiate" | "Intracollegiate";
  college?: string;
  capacity: number;
  cashPrize?: string;
  brochureImage?: string;
}

export interface EventResponse {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category:
    | "Sports"
    | "Technical"
    | "Cultural"
    | "Workshop"
    | "Other"
    | "Literary"
    | "Management"
    | "Others";
  eventType?: "Intercollegiate" | "Intracollegiate";
  college?: string;
  capacity: number;
  registeredCount: number;
  cashPrize?: string;
  brochureImage?: string;
  organizer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export async function getEvents(): Promise<ApiResponse<EventResponse[]>> {
  const { data } = await axiosInstance.get<ApiResponse<EventResponse[]>>(API.EVENTS.BASE);
  return data;
}

export async function getEventById(id: string): Promise<ApiResponse<EventResponse>> {
  const { data } = await axiosInstance.get<ApiResponse<EventResponse>>(API.EVENTS.BY_ID(id));
  return data;
}

export async function createEvent(payload: EventPayload): Promise<ApiResponse<EventResponse>> {
  const token = await getTokenCookie();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await axiosInstance.post<ApiResponse<EventResponse>>(
    API.EVENTS.BASE,
    payload,
    { headers }
  );
  return data;
}

export async function deleteEvent(id: string): Promise<ApiResponse<null>> {
  const token = await getTokenCookie();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    API.EVENTS.BY_ID(id),
    { headers }
  );
  return data;
}
