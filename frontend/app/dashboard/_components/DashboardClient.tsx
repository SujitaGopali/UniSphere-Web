"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clearAuthCookies } from "@/lib/cookies";
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";

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
    label: "Feed", href: "/dashboard/feed",
    icon: <SVG><path d="M4 6h16M4 10h16M4 14h10" /></SVG>,
  },
  {
    label: "Discover", href: "/dashboard/discover",
    icon: <SVG><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></SVG>,
  },
  {
    label: "Dashboard", href: "/dashboard",
    icon: <SVG><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></SVG>,
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
  const { user: contextUser } = useAuth();

  const user     = contextUser || serverUser;
  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

  const handleLogout = async () => {
    await clearAuthCookies();
    router.push("/login");
    router.refresh();
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
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white text-sm font-semibold overflow-hidden">
              {user.profileImage
                ? <Image src={user.profileImage} alt="Avatar" fill sizes="36px" className="object-cover" />
                : initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{fullName}</p>
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
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {user.firstName || "User"}! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your events</p>
        </div>


        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-3">{stat.icon}</div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
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
            <h2 className="text-sm font-semibold text-slate-700">Recommended For You</h2>
            <Link href="/dashboard/discover" className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors">
              Explore More →
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-slate-200 mb-3">
              <rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18" /><path d="M8 2.5v4M16 2.5v4" />
            </svg>
            <p className="text-sm text-slate-400">No events to show yet.</p>
            <p className="text-xs text-slate-300 mt-1">Check back soon or explore upcoming events.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
