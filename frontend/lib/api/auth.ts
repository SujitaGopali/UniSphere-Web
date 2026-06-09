import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  studentId: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
}

export async function register(payload: RegisterPayload) {
  const { data } = await axiosInstance.post<ApiResponse>(
    API.AUTH.REGISTER,
    payload
  );
  return data;
}

export async function login(payload: LoginPayload) {
  const { data } = await axiosInstance.post<
    ApiResponse<{ token: string; user: Record<string, unknown> }>
  >(API.AUTH.LOGIN, payload);
  return data;
}
