"use server";

import { revalidatePath } from "next/cache";
import { getTokenCookie } from "../cookies";
import { getLoginHistory } from "../api/login-history";

export const handleGetLoginHistory = async (page: number = 1, limit: number = 20) => {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Unauthorized" };

    const result = await getLoginHistory(page, limit, token);
    return { success: true, data: result.data, meta: result.meta };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch login history" };
  }
};
