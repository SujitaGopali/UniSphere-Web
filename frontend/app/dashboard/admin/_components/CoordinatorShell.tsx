"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import { useAuth } from "@/lib/context/AuthContext";
import axiosInstance from "@/lib/api/axios-instance";
import { API } from "@/lib/api/endpoints";
import { coordinatorNavItems, isCoordinatorNavItemActive } from "./coordinator-nav";

interface CoordinatorShellProps {
  user: Record<string, any>;
  children: React.ReactNode;
}

// Keep badge snappy — don't hit the server on every page click.
let pendingCountCache: { count: number; at: number } | null = null;
const PENDING_TTL_MS = 60_000;

async function loadPendingCount(): Promise<number> {
  if (pendingCountCache && Date.now() - pendingCountCache.at < PENDING_TTL_MS) {
    return pendingCountCache.count;
  }

  try {
    const { data } = await axiosInstance.get(API.ADMIN_USERS.VERIFICATIONS, {
      params: { page: 1, limit: 1 },
    });
    const count = typeof data?.meta?.total === "number" ? data.meta.total : 0;
    pendingCountCache = { count, at: Date.now() };
    return count;
  } catch {
    return pendingCountCache?.count ?? 0;
  }
}

export default function CoordinatorShell({ user: serverUser, children }: CoordinatorShellProps) {
  const pathname = usePathname();
  const { user: contextUser, logout } = useAuth();
  const user = contextUser || serverUser;
  const [pendingVerifications, setPendingVerifications] = useState(
    () => pendingCountCache?.count ?? 0
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const count = await loadPendingCount();
      if (!cancelled) setPendingVerifications(count);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const initials =
    `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "C";
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Coordinator";

  return (
    <div className="flex h-screen bg-[#f4f5f7] overflow-hidden">
      <aside className="w-56 shrink-0 flex flex-col border-r border-slate-100 bg-white h-full">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
          <Link href="/" prefetch className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-linear-to-br from-violet-500 to-blue-500 text-white text-xs font-bold">
              U
            </span>
            <span className="text-sm font-bold text-slate-800 tracking-tight">UniSphere</span>
          </Link>
          <span className="ml-auto rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-semibold text-pink-600 uppercase tracking-wide">
            Coordinator
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {coordinatorNavItems.map((item) => {
            const isActive = isCoordinatorNavItemActive(pathname, item);
            const badgeCount = item.badge === "pendingVerifications" ? pendingVerifications : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-linear-to-r from-violet-500 to-blue-500 text-white shadow-sm [&_svg]:stroke-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              src={user.profileImage}
              initials={initials}
              size="sm"
              bgClassName="bg-indigo-600 text-white"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{fullName}</p>
              <p className="truncate text-xs text-slate-400">{user.email || ""}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-end gap-1 bg-white border-b border-slate-100 px-6 py-3">
          {pendingVerifications > 0 && (
            <Link
              href="/dashboard/admin/verifications"
              prefetch
              className="mr-auto inline-flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              {pendingVerifications} pending verification
              {pendingVerifications !== 1 ? "s" : ""}
            </Link>
          )}
          <button
            onClick={() => logout()}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
            title="Logout"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}
