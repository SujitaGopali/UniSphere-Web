"use server";

import { cookies } from "next/headers";

const AUTH_TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";

export interface StoredUserData {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  studentId?: string;
  profileImage?: string;
  role?: string | null;
  college?: string;
  department?: string;
  year?: string;
  phoneNumber?: string;
  interests?: string;
  verificationStatus?: string;
  [key: string]: unknown;
}

function toStoredUser(user: StoredUserData): StoredUserData {
  return {
    _id: (user._id || user.id) as string | undefined,
    id: (user.id || user._id) as string | undefined,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
    studentId: user.studentId,
    profileImage: user.profileImage,
    role: user.role,
    college: user.college,
    department: user.department,
    year: user.year,
    phoneNumber: user.phoneNumber,
    interests: user.interests,
    verificationStatus: user.verificationStatus as string | undefined,
  };
}

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

export async function storeUserData(user: StoredUserData) {
  const cookieStore = await cookies();
  const slim = toStoredUser(user);
  let value = JSON.stringify(slim);

  // Browsers reject cookies over ~4KB. Drop optional fields if needed.
  if (value.length > 3500) {
    delete slim.profileImage;
    value = JSON.stringify(slim);
  }

  cookieStore.set(USER_DATA_KEY, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getUserData(): Promise<StoredUserData | null> {
  const cookieStore = await cookies();
  const userData = cookieStore.get(USER_DATA_KEY)?.value;

  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData) as StoredUserData;
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
