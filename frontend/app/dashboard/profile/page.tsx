"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useTransition, useRef } from "react";
import axiosInstance from "@/lib/api/axios-instance";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clearAuthCookies } from "@/lib/cookies";
import IdVerificationModal from "../_components/IdVerificationModal";
import SecuritySettings from "../_components/SecuritySettings";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import { resolveProfileImageUrl } from "@/lib/profile-image";
import { getCollegeOptions } from "@/lib/colleges";

// Schemas for forms
const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  college: z.string().min(1, "College is required"),
  department: z.string().optional(),
  year: z.string().optional(),
  phoneNumber: z.string().optional(),
  interests: z.string().optional(),
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

// ── Sidebar nav items ────────────────────────────────────────────────────────
const navItems = [
  {
    label: "Dashboard", href: "/dashboard",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  },
  {
    label: "Feed", href: "/dashboard/feed",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 6h16M4 10h16M4 14h10" /></svg>,
  },
  {
    label: "Discover", href: "/dashboard/discover",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
  },
  {
    label: "My Events", href: "/dashboard/my-events",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  },
  {
    label: "Profile", href: "/dashboard/profile",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" /></svg>,
  },
  {
    label: "QR Passport", href: "/dashboard/qr-passport",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" fill="currentColor" stroke="none" /></svg>,
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, refreshUser, isLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [notificationPreferencesMsg, setNotificationPreferencesMsg] = useState<string | null>(null);

  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // Read from the account record rather than local storage so the badge matches
  // the coordinator's review queue.
  const verificationStatus = user?.verificationStatus || "none";

  const isVerified = verificationStatus === "approved";
  const isPendingVerification = verificationStatus === "pending";

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
      const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      setProfileValue("fullName", full || "User");
      setProfileValue("email", user.email || "");
      setProfileValue("college", user.college || "");
      setProfileValue("department", user.department || "");
      setProfileValue("year", user.year || "");
      setProfileValue("phoneNumber", user.phoneNumber || "");
      setProfileValue("interests", user.interests || "");
      if (user.profileImage) {
        setImagePreview(resolveProfileImageUrl(user.profileImage));
      } else {
        setImagePreview(null);
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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setImageFile(null);
    setProfileError(null);
    setProfileSuccess(null);
    if (user) {
      const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      setProfileValue("fullName", full || "User");
      setProfileValue("email", user.email || "");
      setProfileValue("college", user.college || "");
      setProfileValue("department", user.department || "");
      setProfileValue("year", user.year || "");
      setProfileValue("phoneNumber", user.phoneNumber || "");
      setProfileValue("interests", user.interests || "");
      setImagePreview(resolveProfileImageUrl(user.profileImage));
    }
  };

  const onUpdateProfile = (values: ProfileFormValues) => {
    setProfileError(null);
    setProfileSuccess(null);

    const [firstName, ...lastNameParts] = values.fullName.trim().split(" ");
    const lastName = lastNameParts.join(" ") || "User";

    startProfileTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("college", values.college);
        if (values.department) formData.append("department", values.department);
        if (values.year) formData.append("year", values.year);
        if (values.phoneNumber) formData.append("phoneNumber", values.phoneNumber);
        if (values.interests) formData.append("interests", values.interests);

        if (imageFile) {
          formData.append("profileImage", imageFile);
        }

        const response = await axiosInstance.put("/api/v1/auth/update", formData);

        if (response.data && response.data.success) {
          const savedImage = response.data.data?.profileImage;
          if (savedImage) {
            setImagePreview(resolveProfileImageUrl(savedImage));
          }
          setProfileSuccess("Profile updated successfully!");
          setImageFile(null);
          await refreshUser();
          setIsEditing(false);
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
          currentPassword: values.currentPassword,
          password: values.password,
        });

        if (response.data && response.data.success) {
          setPasswordSuccess("Password updated successfully!");
          resetPasswordForm();
          setTimeout(() => setShowPasswordForm(false), 2000);
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

  const handleLogout = async () => {
    await clearAuthCookies();
    router.push("/login");
    router.refresh();
  };

  const handleManageNotifications = () => {
    setNotificationPreferencesMsg("Notification settings updated successfully!");
    setTimeout(() => setNotificationPreferencesMsg(null), 3000);
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <p className="text-sm uppercase tracking-[1.5px] text-muted">Loading profile...</p>
      </div>
    );
  }

  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  const fullNameStr = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const collegeOptions = getCollegeOptions(user.college);

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">

      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-slate-100 bg-white min-h-screen">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 text-white text-sm font-bold">U</span>
            <span className="text-base font-bold text-slate-800 tracking-tight">UniSphere</span>
          </Link>
          <span className="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 uppercase tracking-wide">
            Participant
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-sm [&_svg]:stroke-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-slate-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              src={user.profileImage}
              initials={initials}
              size="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{fullNameStr}</p>
              <p className="truncate text-xs text-slate-400">{user.email || ""}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 px-8 py-8 overflow-y-auto">

        {/* Top-right icons */}
        <div className="flex justify-end items-center gap-3 mb-6">
          <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500" title="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500" title="Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500" title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V19a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" />
            </svg>
          </button>
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500" title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        {/* Page heading */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-1.5 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">
                My Profile
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage your profile and verify your student ID</p>
            </div>
          </div>
          <button
            onClick={() => (isEditing ? handleCancelEdit() : setIsEditing(true))}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-blue-500 px-5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="space-y-6 max-w-5xl">
          {/* Personal Information Section */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-slate-800">Personal Information</h2>

            {profileError && (
              <div className="mb-6 rounded-xl border border-m-red/20 bg-m-red/5 px-4 py-3 text-sm text-m-red">{profileError}</div>
            )}
            {profileSuccess && (
              <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{profileSuccess}</div>
            )}

            <form onSubmit={handleProfileSubmit(onUpdateProfile)}>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Image Column */}
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
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                  />
                </div>

                {/* Form fields column */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Full Name</label>
                    <input
                      {...registerProfile("fullName")}
                      type="text"
                      disabled={!isEditing}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-400 focus:bg-white disabled:opacity-85"
                    />
                    {profileErrors.fullName && <p className="mt-1 text-xs text-m-red">{profileErrors.fullName.message}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Email</label>
                    <input
                      {...registerProfile("email")}
                      type="email"
                      disabled={true} // email is generally fixed
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none disabled:opacity-60"
                    />
                    {profileErrors.email && <p className="mt-1 text-xs text-m-red">{profileErrors.email.message}</p>}
                  </div>

                  {/* College */}
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
                    {profileErrors.college && <p className="mt-1 text-xs text-m-red">{profileErrors.college.message}</p>}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Department</label>
                    <input
                      {...registerProfile("department")}
                      type="text"
                      disabled={!isEditing}
                      placeholder="e.g., Computer Science"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-400 focus:bg-white disabled:opacity-85"
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Year</label>
                    <input
                      {...registerProfile("year")}
                      type="text"
                      disabled={!isEditing}
                      placeholder="1-4"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-400 focus:bg-white disabled:opacity-85"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Phone Number</label>
                    <input
                      {...registerProfile("phoneNumber")}
                      type="text"
                      disabled={!isEditing}
                      placeholder="+91 1234567890"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-800 outline-none transition-all focus:border-blue-400 focus:bg-white disabled:opacity-85"
                    />
                  </div>

                  {/* Interests */}
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Interests (comma-separated)</label>
                    <input
                      {...registerProfile("interests")}
                      type="text"
                      disabled={!isEditing}
                      placeholder="e.g., Coding, Dance, Sports"
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
          </div>

          {/* ID Verification Section */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">ID Verification</h2>
              <p className="text-sm text-slate-500">
                Status: {isVerified ? (
                  <span className="font-semibold text-emerald-600 inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-emerald-500">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.3 14.7L6.5 12.5l1.4-1.4 2.8 2.8 6.8-6.8 1.4 1.4-8.2 8.2z" />
                    </svg>
                    Verified Student
                  </span>
                ) : isPendingVerification ? (
                  <span className="font-semibold text-amber-600">Awaiting Coordinator Review</span>
                ) : verificationStatus === "rejected" ? (
                  <span className="font-semibold text-red-600">Rejected — please resubmit</span>
                ) : (
                  <span className="font-semibold text-slate-500">Not Verified</span>
                )}
              </p>
            </div>
            {isVerified ? (
              <button disabled className="h-10 shrink-0 rounded-xl bg-emerald-50 border border-emerald-200 px-5 text-sm font-semibold text-emerald-700 inline-flex items-center gap-1.5 cursor-default">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-emerald-600">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.3 14.7L6.5 12.5l1.4-1.4 2.8 2.8 6.8-6.8 1.4 1.4-8.2 8.2z" />
                </svg>
                Verified
              </button>
            ) : isPendingVerification ? (
              <button disabled className="h-10 shrink-0 rounded-xl bg-amber-50 border border-amber-200 px-5 text-sm font-semibold text-amber-700 cursor-default">
                Under Review
              </button>
            ) : (
              <button 
                onClick={() => setIsVerifyModalOpen(true)}
                className="h-10 shrink-0 rounded-xl border border-blue-500 px-5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Upload ID & Verify
              </button>
            )}
          </div>

          {/* Security Section */}
          <SecuritySettings />

          {/* Settings Section */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-slate-800">Settings</h2>

            {notificationPreferencesMsg && (
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-2.5 text-sm text-emerald-600">
                {notificationPreferencesMsg}
              </div>
            )}

            <div className="space-y-4">
              {/* Row 1: Change Password */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Change Password</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Update your account password</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="h-10 shrink-0 rounded-lg border border-blue-500 px-5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {showPasswordForm ? "Hide" : "Change"}
                  </button>
                </div>

                {/* Password form drawer/modal inline */}
                {showPasswordForm && (
                  <div className="mt-4 border-t border-slate-50 pt-4 max-w-xl">
                    <h4 className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">Update Account Password</h4>
                    {passwordError && (
                      <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{passwordError}</div>
                    )}
                    {passwordSuccess && (
                      <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-2.5 text-sm text-emerald-600">{passwordSuccess}</div>
                    )}
                    <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Current Password</label>
                        <input
                          {...registerPassword("currentPassword")}
                          type="password"
                          placeholder="Enter current password"
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-blue-400"
                        />
                        {passwordErrors.currentPassword && (
                          <p className="mt-1 text-xs text-m-red">{passwordErrors.currentPassword.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">New Password</label>
                          <input
                            {...registerPassword("password")}
                            type="password"
                            placeholder="Min 6 characters"
                            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-blue-400"
                          />
                          {passwordErrors.password && <p className="mt-1 text-xs text-m-red">{passwordErrors.password.message}</p>}
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">Confirm Password</label>
                          <input
                            {...registerPassword("confirmPassword")}
                            type="password"
                            placeholder="Confirm password"
                            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-blue-400"
                          />
                          {passwordErrors.confirmPassword && <p className="mt-1 text-xs text-m-red">{passwordErrors.confirmPassword.message}</p>}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPasswordForm(false)}
                          className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={passwordPending}
                          className="h-9 rounded-lg bg-blue-500 px-4 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                        >
                          {passwordPending ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Row 2: Notification Preferences */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Notification Preferences</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Manage email and push notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={handleManageNotifications}
                    className="h-10 shrink-0 rounded-lg border border-blue-500 px-5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Manage
                  </button>
                </div>
              </div>

              {/* Row 3: Logout */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Logout</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Sign out of your account</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="h-10 shrink-0 rounded-lg border border-blue-500 px-5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>

      <IdVerificationModal 
        isOpen={isVerifyModalOpen} 
        onClose={() => setIsVerifyModalOpen(false)} 
        onSubmitted={async () => {
          await refreshUser();
          setIsVerifyModalOpen(false);
        }}
        user={user || {}}
      />
    </div>
  );
}
