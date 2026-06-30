import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getLoginHistory = async (page: number = 1, limit: number = 20, token: string) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await axiosInstance.get(`${API.LOGIN_HISTORY.BASE}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch login history");
  }
};

export const getUserLoginHistory = async (userId: string, token: string) => {
  try {
    const response = await axiosInstance.get(API.LOGIN_HISTORY.BY_USER(userId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch user login history");
  }
};
