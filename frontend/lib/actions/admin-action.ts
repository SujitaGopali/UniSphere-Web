"use server";

import { revalidatePath } from "next/cache";
import { getTokenCookie } from "../cookies";
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from "../api/admin";

export const handleGetAdminUsers = async (page: number, limit: number, search: string) => {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Unauthorized" };

    const result = await getAdminUsers(page, limit, search, token);
    return { success: true, data: result.data, meta: result.meta };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch users" };
  }
};

export const handleCreateAdminUser = async (data: any) => {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Unauthorized" };

    const result = await createAdminUser(data, token);
    revalidatePath("/dashboard/admin/users");
    return { success: true, message: "User created successfully", data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to create user" };
  }
};

export const handleUpdateAdminUser = async (id: string, data: any) => {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Unauthorized" };

    const result = await updateAdminUser(id, data, token);
    revalidatePath("/dashboard/admin/users");
    return { success: true, message: "User updated successfully", data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update user" };
  }
};

export const handleDeleteAdminUser = async (id: string) => {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Unauthorized" };

    const result = await deleteAdminUser(id, token);
    revalidatePath("/dashboard/admin/users");
    return { success: true, message: "User deleted successfully" };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to delete user" };
  }
};
