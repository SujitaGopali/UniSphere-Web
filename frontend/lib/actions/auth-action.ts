"use server";

import { login, register, RegisterPayload, LoginPayload } from "@/lib/api/auth";
import { setTokenCookie, storeUserData } from "@/lib/cookies";
import { isAxiosError } from "axios";

export async function handleRegisterUser(payload: RegisterPayload) {
  try {
    const response = await register(payload);

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
        message: data.message || "Registration failed",
        data: null,
      };
    }

    return {
      success: false,
      message: "Registration failed. Please try again.",
      data: null,
    };
  }
}

export async function handleLoginUser(payload: LoginPayload) {
  try {
    const response = await login(payload);

    if (response.success && response.data) {
      await setTokenCookie(response.data.token);
      await storeUserData(response.data.user);
    }

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
        message: data.message || "Login failed",
        data: null,
      };
    }

    return {
      success: false,
      message: "Login failed. Please try again.",
      data: null,
    };
  }
}
