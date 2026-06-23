"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useTransition, useRef } from "react";
import axiosInstance from "@/lib/api/axios-instance";
import Link from "next/link";
import Image from "next/image";

// Schemas for forms
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  studentId: z.string().min(1, "Student ID is required"),
});

const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, refreshUser, isLoading } = useAuth();
  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();

  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  // Prefill profile form when user context loads
  useEffect(() => {
    if (user) {
      setProfileValue("firstName", user.firstName);
      setProfileValue("lastName", user.lastName);
      setProfileValue("username", user.username);
      setProfileValue("studentId", user.studentId);
      if (user.profileImage) {
        setImagePreview(user.profileImage);
      }
    }
  }, [user, setProfileValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onUpdateProfile = (values: ProfileFormValues) => {
    setProfileError(null);
    setProfileSuccess(null);

    startProfileTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("firstName", values.firstName);
        formData.append("lastName", values.lastName);
        formData.append("username", values.username);
        formData.append("studentId", values.studentId);

        if (imageFile) {
          formData.append("profileImage", imageFile);
        }

        const response = await axiosInstance.put("/api/v1/auth/update", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data && response.data.success) {
          setProfileSuccess("Profile updated successfully!");
          await refreshUser();
        } else {
          setProfileError(response.data?.message || "Failed to update profile");
        }
      } catch (error: any) {
        setProfileError(
          error.response?.data?.message || "An error occurred while updating profile"
        );
      }
    });
  };

  const onUpdatePassword = (values: PasswordFormValues) => {
    setPasswordError(null);
    setPasswordSuccess(null);

    startPasswordTransition(async () => {
      try {
        const response = await axiosInstance.put("/api/v1/auth/update", {
          password: values.password,
        });

        if (response.data && response.data.success) {
          setPasswordSuccess("Password updated successfully!");
          resetPasswordForm();
        } else {
          setPasswordError(response.data?.message || "Failed to update password");
        }
      } catch (error: any) {
        setPasswordError(
          error.response?.data?.message || "An error occurred while updating password"
        );
      }
    });
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-sm uppercase tracking-[1.5px] text-muted">Loading profile...</p>
      </div>
    );
  }

  // Get initials for profile picture placeholder
  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();

  return (
    <main className="min-h-screen bg-canvas text-body">
      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between border-b border-hairline pb-8">
          <div>
            <p className="text-xs uppercase tracking-[2px] text-muted">User Account</p>
            <h1 className="text-3xl font-light uppercase tracking-[1.5px] text-on-dark sm:text-4xl">
              Profile Settings
            </h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded border border-hairline px-5 text-xs uppercase tracking-[1.5px] text-body transition-colors hover:border-on-dark"
          >
            Dashboard
          </Link>
        </div>

        <div className="space-y-10">
          {/* Profile Info Form Section */}
          <section className="rounded border border-hairline bg-surface-card p-8">
            <h2 className="mb-8 text-xl font-light uppercase tracking-[1px] text-on-dark">
              Personal Information
            </h2>

            {profileError && (
              <div className="mb-6 rounded border border-m-red/20 bg-m-red/10 p-4 text-sm text-m-red">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="mb-6 rounded border border-m-blue-light/20 bg-m-blue-light/10 p-4 text-sm text-m-blue-light">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-8">
              {/* Profile Image Upload Widget */}
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas overflow-hidden">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Avatar"
                      fill
                      sizes="96px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <span className="text-2xl font-light text-muted tracking-[1px]">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-sm font-medium text-on-dark">Profile Picture</h3>
                  <p className="text-xs text-muted mb-3">
                    JPG, PNG, GIF or WebP. Max size of 5MB.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-9 items-center rounded border border-hairline px-4 text-xs uppercase tracking-[1.5px] text-on-dark hover:bg-canvas transition-colors cursor-pointer"
                  >
                    Choose Photo
                  </button>
                </div>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[1.5px] text-muted">First Name</label>
                  <input
                    {...registerProfile("firstName")}
                    type="text"
                    className="w-full h-12 rounded border border-hairline bg-canvas px-4 text-sm text-on-dark focus:border-on-dark focus:outline-none"
                  />
                  {profileErrors.firstName && (
                    <p className="text-xs text-m-red">{profileErrors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[1.5px] text-muted">Last Name</label>
                  <input
                    {...registerProfile("lastName")}
                    type="text"
                    className="w-full h-12 rounded border border-hairline bg-canvas px-4 text-sm text-on-dark focus:border-on-dark focus:outline-none"
                  />
                  {profileErrors.lastName && (
                    <p className="text-xs text-m-red">{profileErrors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[1.5px] text-muted">Username</label>
                  <input
                    {...registerProfile("username")}
                    type="text"
                    className="w-full h-12 rounded border border-hairline bg-canvas px-4 text-sm text-on-dark focus:border-on-dark focus:outline-none"
                  />
                  {profileErrors.username && (
                    <p className="text-xs text-m-red">{profileErrors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[1.5px] text-muted">Student ID</label>
                  <input
                    {...registerProfile("studentId")}
                    type="text"
                    className="w-full h-12 rounded border border-hairline bg-canvas px-4 text-sm text-on-dark focus:border-on-dark focus:outline-none"
                  />
                  {profileErrors.studentId && (
                    <p className="text-xs text-m-red">{profileErrors.studentId.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={profilePending}
                className="h-12 w-full rounded bg-on-dark text-canvas text-sm font-semibold uppercase tracking-[1.5px] hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer sm:w-auto sm:px-10"
              >
                {profilePending ? "Saving..." : "Save Profile Details"}
              </button>
            </form>
          </section>

          {/* Password Form Section */}
          <section className="rounded border border-hairline bg-surface-card p-8">
            <h2 className="mb-8 text-xl font-light uppercase tracking-[1px] text-on-dark">
              Security settings (Change Password)
            </h2>

            {passwordError && (
              <div className="mb-6 rounded border border-m-red/20 bg-m-red/10 p-4 text-sm text-m-red">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-6 rounded border border-m-blue-light/20 bg-m-blue-light/10 p-4 text-sm text-m-blue-light">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[1.5px] text-muted">New Password</label>
                  <input
                    {...registerPassword("password")}
                    type="password"
                    placeholder="Min 6 characters"
                    className="w-full h-12 rounded border border-hairline bg-canvas px-4 text-sm text-on-dark focus:border-on-dark focus:outline-none"
                  />
                  {passwordErrors.password && (
                    <p className="text-xs text-m-red">{passwordErrors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[1.5px] text-muted">Confirm New Password</label>
                  <input
                    {...registerPassword("confirmPassword")}
                    type="password"
                    placeholder="Confirm password"
                    className="w-full h-12 rounded border border-hairline bg-canvas px-4 text-sm text-on-dark focus:border-on-dark focus:outline-none"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-m-red">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordPending}
                className="h-12 w-full rounded bg-on-dark text-canvas text-sm font-semibold uppercase tracking-[1.5px] hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer sm:w-auto sm:px-10"
              >
                {passwordPending ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
