"use server";

import { createEvent, getEvents, getEventById, deleteEvent, EventPayload } from "@/lib/api/event";
import { isAxiosError } from "axios";
import { revalidatePath } from "next/cache";

export async function handleCreateEvent(payload: EventPayload) {
  try {
    const response = await createEvent(payload);
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
        message: data.message || "Failed to create event",
        data: null,
      };
    }
    return {
      success: false,
      message: "Failed to create event. Please try again.",
      data: null,
    };
  }
}

export async function handleGetEvents() {
  try {
    const response = await getEvents();
    return {
      success: response.success,
      message: response.message,
      data: response.data || [],
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to retrieve events.",
      data: [],
    };
  }
}

export async function handleDeleteEvent(id: string) {
  try {
    const response = await deleteEvent(id);
    revalidatePath("/dashboard");
    return {
      success: response.success,
      message: response.message,
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.data) {
      const data = error.response.data as { message?: string };
      return {
        success: false,
        message: data.message || "Failed to delete event",
      };
    }
    return {
      success: false,
      message: "Failed to delete event.",
    };
  }
}
