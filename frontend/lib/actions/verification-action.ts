"use server";

import { getTokenCookie } from "../cookies";
import { getPendingVerifications, reviewVerification } from "../api/admin";

export const handleGetPendingVerifications = async (page: number = 1, limit: number = 50) => {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Unauthorized" };

    const result = await getPendingVerifications(page, limit, token);
    return { success: true, data: result.data, meta: result.meta };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to fetch verifications" };
  }
};

/**
 * Count of pending verifications for the signed-in coordinator's college.
 * Sourced from the API so the sidebar badge can never disagree with the list.
 */
export const handleGetPendingVerificationCount = async () => {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, count: 0 };

    const result = await getPendingVerifications(1, 1, token);
    const count = typeof result?.meta?.total === "number" ? result.meta.total : 0;
    return { success: true, count };
  } catch {
    return { success: false, count: 0 };
  }
};

export const handleReviewVerification = async (id: string, approved: boolean) => {
  try {
    const token = await getTokenCookie();
    if (!token) return { success: false, message: "Unauthorized" };

    const result = await reviewVerification(id, approved, token);
    return { success: true, message: `Verification ${approved ? "approved" : "rejected"}`, data: result.data };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to review verification" };
  }
};
