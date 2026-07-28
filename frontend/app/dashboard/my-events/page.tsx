"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clearAuthCookies } from "@/lib/cookies";
import Image from "next/image";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import { useAuth } from "@/lib/context/AuthContext";
import {
  handleCancelRegistration,
  handleGetMyRegistrations,
} from "@/lib/actions/registration-action";
import { RegistrationResponse } from "@/lib/api/registration";

// ── Sidebar nav items (same as dashboard) ─────────────────────────────────────
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

export default function MyEventsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"registered" | "saved">("registered");
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const initials = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";

  const handleLogout = async () => {
    await clearAuthCookies();
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const result = await handleGetMyRegistrations();
      setRegistrations(result.success ? result.data : []);
      setIsLoading(false);
    };

    load();
  }, []);

  const handleCancel = async (registrationId: string) => {
    setCancellingId(registrationId);
    const result = await handleCancelRegistration(registrationId);
    setCancellingId(null);

    if (!result.success) {
      window.alert(result.message || "Failed to cancel registration.");
      return;
    }

    setRegistrations((prev) => prev.filter((registration) => registration._id !== registrationId));
  };

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
            <ProfileAvatar src={user?.profileImage} initials={initials} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{fullName}</p>
              <p className="truncate text-xs text-slate-400">{user?.email || ""}</p>
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
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="p-1.5 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900">
            My Events
          </h1>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("registered")}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative ${
              activeTab === "registered"
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Registered
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
              activeTab === "registered" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
            }`}>
              {registrations.length}
            </span>
            {activeTab === "registered" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold transition-all relative ml-8 ${
              activeTab === "saved"
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Saved
            <span className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
              activeTab === "saved" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
            }`}>
              0
            </span>
            {activeTab === "saved" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Container for content */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm max-w-4xl mx-auto min-h-[350px]">
          {activeTab === "registered" ? (
            isLoading ? (
              <div className="flex min-h-[260px] items-center justify-center text-sm text-slate-500">
                Loading your registrations...
              </div>
            ) : registrations.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-slate-400">
                    <rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18" /><path d="M8 2.5v4M16 2.5v4" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">No registrations yet</h2>
                <p className="text-sm text-slate-500 mb-6 max-w-md">
                  Start exploring events and register to participate.
                </p>
                <Link
                  href="/dashboard/discover"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-500 px-6 text-sm font-semibold text-white hover:bg-blue-600 transition-colors shadow-sm"
                >
                  Explore Events
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <div
                    key={registration._id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-800">
                          {registration.event?.title || "Untitled event"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {registration.event?.college || registration.event?.organizer?.username || "Unknown organizer"}
                        </p>
                        <div className="mt-3 space-y-1 text-sm text-slate-600">
                          <p>
                            {registration.event?.date
                              ? new Date(registration.event.date).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Date not available"}
                          </p>
                          <p>{registration.event?.location || "Location not available"}</p>
                          <p className="text-xs text-slate-400">
                            Registered on {new Date(registration.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Registered
                        </span>
                        <button
                          onClick={() => handleCancel(registration._id)}
                          disabled={cancellingId === registration._id}
                          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          {cancellingId === registration._id ? "Cancelling..." : "Cancel Registration"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-slate-400">
                  <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">Saved events are not wired yet</h2>
              <p className="text-sm text-slate-500 max-w-md">
                The real registration flow now works. Saved events can be added next if you want.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
