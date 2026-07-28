"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/api/axios-instance";
import { API } from "@/lib/api/endpoints";
import { getEvents } from "@/lib/api/event";
import { UiEventItem, toUiEventItems } from "@/lib/event-helpers";

interface AdminDashboardClientProps {
  user: Record<string, any>;
}

const quickActions = [
  {
    label: "Create Event",
    href: "/dashboard/admin/events/create",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-slate-500">
        <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    label: "Manage Events",
    href: "/dashboard/admin/events",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-blue-500">
        <rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      </svg>
    ),
    activeColor: true,
  },
  {
    label: "Review Verifications",
    href: "/dashboard/admin/verifications",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-amber-500">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    label: "QR Check-in",
    href: "/dashboard/admin/qr-checkin",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-slate-500">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
];

export default function AdminDashboardClient({ user }: AdminDashboardClientProps) {
  const [events, setEvents] = useState<UiEventItem[]>([]);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState(0);

  const loadData = async () => {
    try {
      const result = await getEvents();
      if (result.success) {
        const currentUserId = String(user._id || user.id || "");
        const ownEvents = toUiEventItems(result.data || []).filter(
          (event) => !currentUserId || event.organizerId === currentUserId
        );
        setEvents(ownEvents);
        setTotalRegistrations(
          ownEvents.reduce((sum, event) => sum + (event.registeredCount || 0), 0)
        );
      }
    } catch {
      // keep previous data
    }

    try {
      const { data } = await axiosInstance.get(API.ADMIN_USERS.VERIFICATIONS, {
        params: { page: 1, limit: 1 },
      });
      setPendingVerifications(typeof data?.meta?.total === "number" ? data.meta.total : 0);
    } catch {
      // keep previous data
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = [
    {
      label: "Total Events",
      value: events.length,
      sub: events.length > 0 ? `+${events.length} created` : "0 this month",
      subColor: events.length > 0 ? "text-green-600" : "text-slate-400",
      color: "text-slate-800",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-400">
          <rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
        </svg>
      ),
    },
    {
      label: "Pending Verifications",
      value: pendingVerifications,
      sub: pendingVerifications > 0 ? "Needs your review" : "All clear",
      subColor: pendingVerifications > 0 ? "text-amber-600" : "text-slate-400",
      color: "text-slate-800",
      href: "/dashboard/admin/verifications",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-amber-400">
          <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
        </svg>
      ),
    },
    {
      label: "Total Registrations",
      value: totalRegistrations,
      sub: `${totalRegistrations} student signup${totalRegistrations !== 1 ? "s" : ""}`,
      subColor: totalRegistrations > 0 ? "text-green-600" : "text-slate-400",
      color: "text-slate-800",
      href: "/dashboard/admin/events",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500">
          <circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17" cy="9" r="2.4" /><path d="M15.5 14.2c2.4.3 4.5 2.4 4.5 5.3" />
        </svg>
      ),
    },
    {
      label: "Attendance Rate",
      value: "0%",
      sub: "Average rate",
      subColor: "text-slate-400",
      color: "text-slate-800",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-400">
          <path d="M3 12l4-4 4 4 4-6 4 6" />
        </svg>
      ),
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Event Coordinator Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Manage events and review student ID verifications</p>
          </div>
          <Link
            href="/dashboard/admin/events/create"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-400/30 transition-all hover:bg-blue-600 hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create New Event
          </Link>
        </div>

        <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={(stat as { href?: string }).href || "#"}
              className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md ${(stat as { href?: string }).href ? "hover:border-blue-200 cursor-pointer" : ""}`}
            >
              <div className="mb-3">{stat.icon}</div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
              <p className={`mt-1 text-xs font-medium ${stat.subColor}`}>{stat.sub}</p>
            </Link>
          ))}
        </div>

        <div className="mb-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-slate-800">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex flex-col items-center gap-2.5 rounded-xl border border-dashed px-4 py-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md group
                  ${action.activeColor
                    ? "border-blue-200 bg-blue-50/50 hover:border-blue-400"
                    : "border-slate-200 bg-white hover:border-slate-400"}`}
              >
                <span className="group-hover:scale-110 transition-transform">{action.icon}</span>
                <span className={`text-xs font-medium ${action.activeColor ? "text-blue-600" : "text-slate-600 group-hover:text-slate-900"}`}>
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-800">Recent Events</h2>
            <Link href="/dashboard/admin/events" className="text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors">
              View All →
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {events.slice(0, 3).map((evt) => (
                <div key={evt.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{evt.title}</p>
                    <p className="text-xs text-slate-500">{evt.college} • {evt.category}</p>
                    {evt.cashPrize && (
                      <p className="text-xs text-amber-700 font-medium mt-0.5">Prize: {evt.cashPrize}</p>
                    )}
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
                    Active
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                  <rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">No events yet</p>
              <p className="text-xs text-slate-400 mb-6">Create your first event to get started</p>
              <Link
                href="/dashboard/admin/events/create"
                className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-400/30 hover:bg-blue-600 transition-colors"
              >
                Create Event
              </Link>
            </div>
          )}
        </div>
      </main>
  );
}
