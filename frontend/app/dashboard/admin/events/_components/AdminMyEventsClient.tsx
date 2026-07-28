"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getEvents } from "@/lib/api/event";
import { handleGetRegistrationsByEvent } from "@/lib/actions/registration-action";
import { RegistrationResponse } from "@/lib/api/registration";
import { UiEventItem, toUiEventItems } from "@/lib/event-helpers";

interface AdminMyEventsClientProps {
  user: Record<string, any>;
}

export default function AdminMyEventsClient({ user }: AdminMyEventsClientProps) {
  const [events, setEvents] = useState<UiEventItem[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [registrationsByEvent, setRegistrationsByEvent] = useState<Record<string, RegistrationResponse[]>>({});
  const [loadingRegistrationsFor, setLoadingRegistrationsFor] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getEvents();
        if (!result.success) return;

        const currentUserId = String(user._id || user.id || "");
        const ownEvents = toUiEventItems(result.data || []).filter(
          (event) => !currentUserId || event.organizerId === currentUserId
        );
        setEvents(ownEvents);
      } catch {
        // keep empty
      }
    };

    load();
  }, [user._id, user.id]);

  const toggleExpandedEvent = async (eventId: string) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      return;
    }

    setExpandedEventId(eventId);

    if (registrationsByEvent[eventId]) {
      return;
    }

    setLoadingRegistrationsFor(eventId);
    const result = await handleGetRegistrationsByEvent(eventId);
    setLoadingRegistrationsFor(null);

    if (result.success) {
      setRegistrationsByEvent((prev) => ({ ...prev, [eventId]: result.data }));
    }
  };

  return (
    <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Events</h1>
            <p className="mt-1 text-sm text-slate-500">All events created by you ({events.length})</p>
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

        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 gap-4 border-b border-slate-100 px-6 py-3 bg-slate-50/70">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider col-span-2">Event</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prize</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registrations</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Status</span>
          </div>

          {events.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {events.map((evt) => {
                const regs = registrationsByEvent[evt.id] || [];
                const count = regs.length || evt.registeredCount || 0;
                const isExpanded = expandedEventId === evt.id;

                return (
                  <div key={evt.id}>
                    <div className="grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors">
                      <div className="col-span-2">
                        <p className="text-sm font-bold text-slate-800">{evt.title}</p>
                        <p className="text-xs text-blue-600">{evt.college} • {evt.eventType}</p>
                      </div>
                      <div>
                        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {evt.category}
                        </span>
                      </div>
                      <div className="text-xs text-amber-700 font-medium">
                        {evt.cashPrize || "—"}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {new Date(evt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => toggleExpandedEvent(evt.id)}
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          {count} / {evt.capacity} registered {count > 0 ? (isExpanded ? "▲" : "▼") : ""}
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
                          Active
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Registered Students</p>
                        {loadingRegistrationsFor === evt.id ? (
                          <p className="text-sm text-slate-500">Loading registrations...</p>
                        ) : regs.length > 0 ? (
                          <div className="space-y-2">
                            {regs.map((reg) => {
                              const attendee =
                                typeof reg.user === "string"
                                  ? null
                                  : reg.user;

                              return (
                                <div key={reg._id} className="flex items-center justify-between rounded-lg bg-white border border-slate-100 px-4 py-2.5 text-sm">
                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {[attendee?.firstName, attendee?.lastName].filter(Boolean).join(" ") || attendee?.username || "Student"}
                                    </p>
                                    <p className="text-xs text-slate-500">{attendee?.email || "No email available"}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-mono text-violet-700">{reg._id}</p>
                                    <p className="text-[10px] text-slate-400">{new Date(reg.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No students have registered yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                  <rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">No events created yet</p>
              <p className="text-xs text-slate-400 mb-6 max-w-xs">Events you create will appear here with prize, registration count, date, and status.</p>
              <Link
                href="/dashboard/admin/events/create"
                className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-400/30 hover:bg-blue-600 transition-colors"
              >
                Create Your First Event
              </Link>
            </div>
          )}
        </div>
      </main>
  );
}
