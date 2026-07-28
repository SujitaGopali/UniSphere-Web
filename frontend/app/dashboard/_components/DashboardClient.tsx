"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clearAuthCookies } from "@/lib/cookies";
import Image from "next/image";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import { useAuth } from "@/lib/context/AuthContext";
import { useState, useEffect } from "react";
import IdVerificationModal from "./IdVerificationModal";
import { filterEventsForUser } from "@/lib/events";
import { getEvents } from "@/lib/api/event";
import { handleGetMyRegistrations } from "@/lib/actions/registration-action";
import { UiEventItem, toUiEventItems } from "@/lib/event-helpers";

interface DashboardClientProps {
  user: Record<string, any>;
}

const SVG = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    {children}
  </svg>
);

const navItems = [
  {
    label: "Dashboard", href: "/dashboard",
    icon: <SVG><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></SVG>,
  },
  {
    label: "Feed", href: "/dashboard/feed",
    icon: <SVG><path d="M4 6h16M4 10h16M4 14h10" /></SVG>,
  },
  {
    label: "Discover", href: "/dashboard/discover",
    icon: <SVG><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></SVG>,
  },
  {
    label: "My Events", href: "/dashboard/my-events",
    icon: <SVG><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></SVG>,
  },
  {
    label: "Profile", href: "/dashboard/profile",
    icon: <SVG><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" /></SVG>,
  },
  {
    label: "QR Passport", href: "/dashboard/qr-passport",
    icon: <SVG><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" fill="currentColor" stroke="none" /></SVG>,
  },
];

const stats = [
  {
    label: "Registered Events", value: 0, color: "text-blue-600",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500"><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18" /><path d="M8 2.5v4M16 2.5v4" /><path d="M12 13v5M9.5 15.5h5" /></svg>,
  },
  {
    label: "Saved Events", value: 0, color: "text-purple-500",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-400"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  },
  {
    label: "Events Attended", value: 0, color: "text-green-600",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>,
  },
  {
    label: "Certificates", value: 0, color: "text-orange-500",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-orange-400"><circle cx="12" cy="9" r="5.5" /><path d="M9 13.8 7.5 21l4.5-2.5 4.5 2.5-1.5-7.2" /></svg>,
  },
];

const quickActions = [
  {
    label: "Explore Events", href: "/dashboard/discover",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-slate-500"><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18" /><path d="M8 2.5v4M16 2.5v4" /><path d="M12 13v5M9.5 15.5h5" /></svg>,
  },
  {
    label: "My Events", href: "/dashboard/my-events",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-slate-500"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
  },
  {
    label: "QR Passport", href: "/dashboard/qr-passport",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-slate-500"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" fill="currentColor" stroke="none" /></svg>,
  },
  {
    label: "Certificates", href: "/dashboard/certificates",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-slate-500"><circle cx="12" cy="9" r="5.5" /><path d="M9 13.8 7.5 21l4.5-2.5 4.5 2.5-1.5-7.2" /></svg>,
  },
];

export default function DashboardClient({ user: serverUser }: DashboardClientProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user: contextUser, logout, refreshUser } = useAuth();

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const [recommendedEvents, setRecommendedEvents] = useState<UiEventItem[]>([]);
  const [registeredCount, setRegisteredCount] = useState(0);

  const user     = contextUser || serverUser;
  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const userCollege = user.college || "Herald College Kathmandu";
  // Comes straight from the account record, so it always matches what the
  // coordinator sees in their review queue.
  const verificationStatus = user.verificationStatus || "none";

  useEffect(() => {
    const load = async () => {
      if (user?.email) {
        const registrationsResult = await handleGetMyRegistrations();
        if (registrationsResult.success) {
          setRegisteredCount(registrationsResult.data.length);
        }
      }

      const eventsResult = await getEvents();
      if (eventsResult.success) {
        const events = toUiEventItems(eventsResult.data || []);
        setRecommendedEvents(filterEventsForUser(events, userCollege));
      }
    };

    load();
  }, [userCollege, user?.email]);

  const isVerified = verificationStatus === "approved";
  const isPendingVerification = verificationStatus === "pending";

  const handleLogout = async () => {
    await logout();
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
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-sm [&_svg]:stroke-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-slate-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <ProfileAvatar src={user.profileImage} initials={initials} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="truncate text-sm font-semibold text-slate-800">{fullName}</p>
                {isVerified && (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-blue-500">
                    <title>Verified Student</title>
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.3 14.7L6.5 12.5l1.4-1.4 2.8 2.8 6.8-6.8 1.4 1.4-8.2 8.2z" />
                  </svg>
                )}
              </div>
              <p className="truncate text-xs text-slate-400">{user.email || ""}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 px-8 py-8 overflow-y-auto">

        {/* Top-right icons */}
        <div className="flex justify-end items-center gap-1 mb-6">
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

        {/* Welcome */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">
              Welcome back, {user.firstName || "User"}!
            </h1>
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.3 14.7L6.5 12.5l1.4-1.4 2.8 2.8 6.8-6.8 1.4 1.4-8.2 8.2z" /></svg>
                Verified Student
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your events</p>
        </div>

        {/* Verification Banner */}
        {!isVerified && (
          <div className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 shadow-sm ${
            isPendingVerification
              ? "border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50"
              : "border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50"
          }`}>
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 ${isPendingVerification ? "text-amber-600" : "text-blue-600"}`}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                {isPendingVerification ? "Verification Pending" : "Verify your Student ID"}
              </h3>
              <p className="text-sm text-slate-600 mt-1 max-w-xl">
                {isPendingVerification
                  ? "Your ID is under review by your event coordinator. You'll get access to priority registration once approved."
                  : "Upload your college ID card to get verified. Verified students get priority access to limited-seat events and exclusive campus updates."}
              </p>
            </div>
            {!isPendingVerification && (
              <button 
                onClick={() => setIsVerifyModalOpen(true)}
                className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
              >
                Verify Now
              </button>
            )}
          </div>
        )}


        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-3">{stat.icon}</div>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.label === "Registered Events" ? registeredCount : stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-5 text-center hover:border-violet-300 hover:bg-violet-50/30 transition-all group">
                <span className="group-hover:scale-110 transition-transform [&_svg]:group-hover:stroke-violet-600">{action.icon}</span>
                <span className="text-xs font-medium text-slate-600 group-hover:text-violet-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recommended For You */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Recommended For You</h2>
              <p className="text-xs text-slate-400">Events from {userCollege} & Intercollege events</p>
            </div>
            <Link href="/dashboard/discover" className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors">
              Explore More →
            </Link>
          </div>

          {recommendedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedEvents.slice(0, 4).map((evt) => (
                <div key={evt.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:border-violet-200 transition-all border-l-4 border-l-violet-500 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-600 border border-violet-100">
                        {evt.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        {evt.eventType}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">{evt.title}</h3>
                    <p className="text-xs font-medium text-blue-600 mb-2">{evt.college}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{evt.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{new Date(evt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <Link href="/dashboard/feed" className="font-semibold text-violet-600 hover:underline">View in Feed</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-slate-200 mb-3">
                <rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18" /><path d="M8 2.5v4M16 2.5v4" />
              </svg>
              <p className="text-sm text-slate-400">No events to show yet.</p>
              <p className="text-xs text-slate-300 mt-1">Check back soon or explore upcoming events.</p>
            </div>
          )}
        </div>
      </main>

      <IdVerificationModal 
        isOpen={isVerifyModalOpen} 
        onClose={() => setIsVerifyModalOpen(false)} 
        onSubmitted={async () => {
          await refreshUser();
          setIsVerifyModalOpen(false);
        }}
        user={user}
      />
    </div>
  );
}
