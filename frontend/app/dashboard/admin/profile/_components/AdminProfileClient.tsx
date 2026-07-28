"use client";

import { ChangeEvent, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosInstance from "@/lib/api/axios-instance";
import SecuritySettings from "../../../_components/SecuritySettings";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import { resolveProfileImageUrl } from "@/lib/profile-image";
import { useAuth } from "@/lib/context/AuthContext";
import { getCollegeOptions } from "@/lib/colleges";

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  college: z.string().min(1, "College is required"),
  department: z.string().optional(),
  phoneNumber: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface AdminProfileClientProps {
  user: Record<string, any>;
}

export default function AdminProfileClient({ user: initialUser }: AdminProfileClientProps) {
  const router = useRouter();
  const { user: authUser, refreshUser } = useAuth();
  const activeUser = authUser ?? initialUser;

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    resolveProfileImageUrl(activeUser?.profileImage)
  );
  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();
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

  useEffect(() => {
    if (!activeUser) return;

    const fullName = `${activeUser.firstName || ""} ${activeUser.lastName || ""}`.trim();
    setProfileValue("fullName", fullName || "Coordinator");
    setProfileValue("email", activeUser.email || "");
    setProfileValue("college", activeUser.college || "");
    setProfileValue("department", activeUser.department || "");
    setProfileValue("phoneNumber", activeUser.phoneNumber || "");
    setImagePreview(resolveProfileImageUrl(activeUser.profileImage));
  }, [activeUser, setProfileValue]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setImageFile(null);
    setProfileError(null);
    setProfileSuccess(null);
    if (!activeUser) return;

    const fullName = `${activeUser.firstName || ""} ${activeUser.lastName || ""}`.trim();
    setProfileValue("fullName", fullName || "Coordinator");
    setProfileValue("email", activeUser.email || "");
    setProfileValue("college", activeUser.college || "");
    setProfileValue("department", activeUser.department || "");
    setProfileValue("phoneNumber", activeUser.phoneNumber || "");
    setImagePreview(resolveProfileImageUrl(activeUser.profileImage));
  };

  const initials =
    `${activeUser?.firstName?.charAt(0) || ""}${activeUser?.lastName?.charAt(0) || ""}`.toUpperCase() || "C";
  const collegeOptions = getCollegeOptions(activeUser?.college);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onUpdateProfile = (values: ProfileFormValues) => {
    setProfileError(null);
    setProfileSuccess(null);

    const [firstName, ...lastNameParts] = values.fullName.trim().split(" ");
    const lastName = lastNameParts.join(" ") || "Coordinator";

    startProfileTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("college", values.college);
        if (values.department) formData.append("department", values.department);
        if (values.phoneNumber) formData.append("phoneNumber", values.phoneNumber);
        if (imageFile) formData.append("profileImage", imageFile);

        const response = await axiosInstance.put("/api/v1/auth/update", formData);

        if (!response.data?.success) {
          setProfileError(response.data?.message || "Failed to update profile");
          return;
        }

        const savedImage = response.data.data?.profileImage;
        if (savedImage) {
          setImagePreview(resolveProfileImageUrl(savedImage));
        }

        setProfileSuccess("Profile updated successfully.");
        await refreshUser();
        router.refresh();
        setIsEditing(false);
        setImageFile(null);
      } catch (error: any) {
        setProfileError(error.response?.data?.message || "An error occurred while updating profile");
      }
    });
  };

  const onUpdatePassword = (values: PasswordFormValues) => {
    setPasswordError(null);
    setPasswordSuccess(null);

    startPasswordTransition(async () => {
      try {
        const response = await axiosInstance.put("/api/v1/auth/update", {
          currentPassword: values.currentPassword,
          password: values.password,
        });

        if (!response.data?.success) {
          setPasswordError(response.data?.message || "Failed to update password");
          return;
        }

        setPasswordSuccess("Password updated successfully.");
        resetPasswordForm();
        setTimeout(() => setShowPasswordForm(false), 1500);
      } catch (error: any) {
        setPasswordError(error.response?.data?.message || "An error occurred while updating password");
      }
    });
  };

  return (
    <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Coordinator Profile</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your coordinator account without leaving the admin workspace.
            </p>
          </div>

          <button
            onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-blue-500 px-5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-slate-800">Personal Information</h2>

            {profileError && (
              <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleProfileSubmit(onUpdateProfile)}>
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={`relative ${isEditing ? "cursor-pointer" : ""}`}
                    onClick={() => isEditing && fileInputRef.current?.click()}
                  >
                    <ProfileAvatar
                      src={imagePreview}
                      initials={initials}
                      size="md"
                      bgClassName="bg-sky-100 text-sky-700"
                    />
                    {isEditing && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-xs font-medium text-white">
                        Change
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Upload photo
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Full Name</label>
                    <input
                      {...registerProfile("fullName")}
                      type="text"
                      disabled={!isEditing}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-400 focus:bg-white disabled:opacity-85"
                    />
                    {profileErrors.fullName && (
                      <p className="mt-1 text-xs text-red-600">{profileErrors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Email</label>
                    <input
                      {...registerProfile("email")}
                      type="email"
                      disabled
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none disabled:opacity-60"
                    />
                    {profileErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{profileErrors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">College</label>
                    <select
                      {...registerProfile("college")}
                      disabled={!isEditing}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-400 focus:bg-white disabled:opacity-85"
                    >
                      <option value="">Select your college</option>
                      {collegeOptions.map((college) => (
                        <option key={college} value={college}>
                          {college}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-400">
                      Determines which students&apos; ID verifications you review.
                    </p>
                    {profileErrors.college && (
                      <p className="mt-1 text-xs text-red-600">{profileErrors.college.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Department</label>
                    <input
                      {...registerProfile("department")}
                      type="text"
                      disabled={!isEditing}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-400 focus:bg-white disabled:opacity-85"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Phone Number</label>
                    <input
                      {...registerProfile("phoneNumber")}
                      type="text"
                      disabled={!isEditing}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-400 focus:bg-white disabled:opacity-85"
                    />
                  </div>

                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="h-10 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profilePending}
                    className="h-10 rounded-lg bg-blue-500 px-6 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    {profilePending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </section>

          <SecuritySettings />

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Password</h2>
                <p className="mt-1 text-sm text-slate-500">Change the password for your coordinator account.</p>
              </div>
              <button
                onClick={() => setShowPasswordForm((prev) => !prev)}
                className="h-10 rounded-lg border border-blue-500 px-5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
              >
                {showPasswordForm ? "Hide" : "Change Password"}
              </button>
            </div>

            {showPasswordForm && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                {passwordError && (
                  <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                    {passwordSuccess}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Current Password</label>
                    <input
                      {...registerPassword("currentPassword")}
                      type="password"
                      className="h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-400"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">New Password</label>
                    <input
                      {...registerPassword("password")}
                      type="password"
                      className="h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-400"
                    />
                    {passwordErrors.password && (
                      <p className="mt-1 text-xs text-red-600">{passwordErrors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Confirm Password</label>
                    <input
                      {...registerPassword("confirmPassword")}
                      type="password"
                      className="h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-400"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="h-10 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passwordPending}
                      className="h-10 rounded-lg bg-blue-500 px-6 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                      {passwordPending ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </div>
      </main>
  );
}
