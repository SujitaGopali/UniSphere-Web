import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getAdminUsers = async (page: number = 1, limit: number = 10, search: string = "", token: string) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (search) params.append("search", search);

    const response = await axiosInstance.get(`${API.ADMIN_USERS.BASE}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch users");
  }
};

export const createAdminUser = async (data: any, token: string) => {
  try {
    const response = await axiosInstance.post(API.ADMIN_USERS.BASE, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to create user");
  }
};

export const updateAdminUser = async (id: string, data: any, token: string) => {
  try {
    const response = await axiosInstance.put(API.ADMIN_USERS.BY_ID(id), data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update user");
  }
};

export const deleteAdminUser = async (id: string, token: string) => {
  try {
    const response = await axiosInstance.delete(API.ADMIN_USERS.BY_ID(id), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete user");
  }
};
