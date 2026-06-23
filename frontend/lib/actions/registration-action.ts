"use server";

import { registerForEvent, cancelRegistration, getMyRegistrations } from "@/lib/api/registration";
import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";

export async function handleRegisterForEvent(eventId: string) {
  try {
    const response = await registerForEvent(eventId);
    revalidatePath("/dashboard");
    return {
      success: response.success,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data) {
      const data = error.response.data as { message?: string };
      return {
        success: false,
        message: data.message || "Failed to register for event",
        data: null,
      };
    }
    return {
      success: false,
      message: "Failed to register for event.",
      data: null,
    };
  }
}

export async function handleCancelRegistration(registrationId: string) {
  try {
    const response = await cancelRegistration(registrationId);
    revalidatePath("/dashboard");
    return {
      success: response.success,
      message: response.message,
      data: null,
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data) {
      const data = error.response.data as { message?: string };
      return {
        success: false,
        message: data.message || "Failed to cancel registration",
        data: null,
      };
    }
    return {
      success: false,
      message: "Failed to cancel registration.",
      data: null,
    };
  }
}

export async function handleGetMyRegistrations() {
  try {
    const response = await getMyRegistrations();
    return {
      success: response.success,
      message: response.message,
      data: response.data || [],
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to retrieve your registrations.",
      data: [],
    };
  }
}
