"use server";

import { cookies } from "next/headers";

const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_TOKEN_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function storeUserData(user: Record<string, unknown>) {
  const cookieStore = await cookies();
  cookieStore.set(USER_DATA_KEY, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getUserData(): Promise<Record<string, unknown> | null> {
  const cookieStore = await cookies();
  const userData = cookieStore.get(USER_DATA_KEY)?.value;

  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function getTokenCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_KEY)?.value || null;
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_TOKEN_KEY);
  cookieStore.delete(USER_DATA_KEY);
}
