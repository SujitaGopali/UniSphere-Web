"use client";

import { useEffect, useMemo, useState } from "react";
import { getEvents } from "@/lib/api/event";
import { handleGetRegistrationsByEvent } from "@/lib/actions/registration-action";
import { RegistrationResponse } from "@/lib/api/registration";
import { toUiEventItems, UiEventItem } from "@/lib/event-helpers";

interface AdminQrCheckinClientProps {
  user: Record<string, any>;
}

interface CheckInRecord {
  id: string;
  registrationId: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  checkedInAt: string;
}

const CHECKIN_STORAGE_KEY = "unisphere_admin_checkins";

function getPassCode(registration: RegistrationResponse) {
  const eventId = registration.event?._id || "event";
  const eventPart = eventId.slice(-4).toUpperCase().padStart(4, "0");
  const registrationPart = registration._id.slice(-6).toUpperCase().padStart(6, "0");
  return `UNI-${eventPart}-${registrationPart}`;
}

function getAttendeeName(user: RegistrationResponse["user"]) {
  if (typeof user === "string") {
    return "Student";
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.username || "Student";
}

function getAttendeeEmail(user: RegistrationResponse["user"]) {
  if (typeof user === "string") {
    return "";
  }

  return user.email || "";
}

function readStoredCheckIns() {
  if (typeof window === "undefined") return [] as CheckInRecord[];

  const raw = localStorage.getItem(CHECKIN_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AdminQrCheckinClient({ user }: AdminQrCheckinClientProps) {
  const [events, setEvents] = useState<UiEventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [registrationsByEvent, setRegistrationsByEvent] = useState<Record<string, RegistrationResponse[]>>({});
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [passCode, setPassCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingRegistrationsFor, setLoadingRegistrationsFor] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const result = await getEvents();
        const currentUserId = String(user._id || user.id || "");
        const ownEvents = result.success
          ? toUiEventItems(result.data || []).filter(
              (event) => !currentUserId || event.organizerId === currentUserId
            )
          : [];

        setEvents(ownEvents);
        setSelectedEventId((current) => current || ownEvents[0]?.id || "");
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    setCheckIns(readStoredCheckIns());
    loadEvents();
  }, [user._id, user.id]);

  useEffect(() => {
    if (!selectedEventId || registrationsByEvent[selectedEventId]) return;

    const loadRegistrations = async () => {
      setLoadingRegistrationsFor(selectedEventId);
      const result = await handleGetRegistrationsByEvent(selectedEventId);
      setLoadingRegistrationsFor(null);

      setRegistrationsByEvent((prev) => ({
        ...prev,
        [selectedEventId]: result.success ? result.data.filter((item) => item.status === "registered") : [],
      }));
    };

    loadRegistrations();
  }, [selectedEventId, registrationsByEvent]);

  const selectedEvent = events.find((event) => event.id === selectedEventId) || null;
  const registrations = registrationsByEvent[selectedEventId] || [];

  const attendeeRows = useMemo(() => {
    return registrations.map((registration) => {
      const checkedInRecord = checkIns.find(
        (item) => item.registrationId === registration._id && item.eventId === selectedEventId
      );

      return {
        registration,
        passCode: getPassCode(registration),
        attendeeName: getAttendeeName(registration.user),
        attendeeEmail: getAttendeeEmail(registration.user),
        checkedInRecord,
      };
    });
  }, [checkIns, registrations, selectedEventId]);

  const recentCheckIns = checkIns
    .filter((item) => item.eventId === selectedEventId)
    .sort((a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime())
    .slice(0, 6);

  const checkedInCount = attendeeRows.filter((row) => row.checkedInRecord).length;

  const handleCheckIn = (submittedCode?: string) => {
    const normalizedCode = (submittedCode ?? passCode).trim().toUpperCase();

    if (!selectedEventId) {
      setFeedback({ type: "error", message: "Select an event first." });
      return;
    }

    if (!normalizedCode) {
      setFeedback({ type: "error", message: "Enter a pass code." });
      return;
    }

    const matchedRow = attendeeRows.find((row) => row.passCode === normalizedCode);

    if (!matchedRow) {
      setFeedback({ type: "error", message: "Pass code not found for this event." });
      return;
    }

    if (matchedRow.checkedInRecord) {
      setFeedback({
        type: "error",
        message: `${matchedRow.attendeeName} has already checked in.`,
      });
      return;
    }

    const nextRecord: CheckInRecord = {
      id: `checkin_${Date.now()}`,
      registrationId: matchedRow.registration._id,
      eventId: selectedEventId,
      attendeeName: matchedRow.attendeeName,
      attendeeEmail: matchedRow.attendeeEmail,
      checkedInAt: new Date().toISOString(),
    };

    setCheckIns((prev) => {
      const updated = [nextRecord, ...prev];
      localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    setPassCode("");
    setFeedback({
      type: "success",
      message: `${matchedRow.attendeeName} checked in successfully.`,
    });
  };

  return (
    <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-800">QR Check-in</h1>
          <p className="mt-1 text-sm text-slate-500">Select an event and enter the student pass code to mark attendance.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_180px]">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Event</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setFeedback(null);
                  }}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-400"
                >
                  {events.length === 0 && <option value="">No events available</option>}
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Checked in</p>
                <p className="mt-1 text-2xl font-semibold text-slate-800">{checkedInCount}</p>
                <p className="text-xs text-slate-500">of {attendeeRows.length}</p>
              </div>
            </div>

            {selectedEvent && (
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm font-medium text-slate-800">{selectedEvent.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedEvent.location} • {new Date(selectedEvent.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            )}

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">Pass code</label>
              <div className="flex gap-3">
                <input
                  value={passCode}
                  onChange={(e) => setPassCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCheckIn();
                    }
                  }}
                  placeholder="UNI-XXXX-XXXXXX"
                  className="h-11 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={() => handleCheckIn()}
                  disabled={!selectedEventId || loadingRegistrationsFor === selectedEventId}
                  className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Check in
                </button>
              </div>
            </div>

            {feedback && (
              <div
                className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                  feedback.type === "success"
                    ? "border border-green-200 bg-green-50 text-green-700"
                    : "border border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {feedback.message}
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-sm font-medium text-slate-800">Recent check-ins</h2>
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
                {recentCheckIns.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {recentCheckIns.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{item.attendeeName}</p>
                          <p className="text-xs text-slate-500">{item.attendeeEmail || "No email available"}</p>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(item.checkedInAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-sm text-slate-500">No one has checked in for this event yet.</div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-slate-800">Registered students</h2>
                <p className="mt-1 text-xs text-slate-500">Click a code to fill the input quickly.</p>
              </div>
              {loading && <span className="text-xs text-slate-400">Loading...</span>}
              {loadingRegistrationsFor === selectedEventId && <span className="text-xs text-slate-400">Loading list...</span>}
            </div>

            <div className="space-y-3">
              {attendeeRows.length > 0 ? (
                attendeeRows.map((row) => (
                  <div key={row.registration._id} className="rounded-xl border border-slate-100 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{row.attendeeName}</p>
                        <p className="text-xs text-slate-500">{row.attendeeEmail || "No email available"}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          row.checkedInRecord
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {row.checkedInRecord ? "Checked in" : "Pending"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setPassCode(row.passCode)}
                        className="rounded-md bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-700 hover:bg-slate-200"
                      >
                        {row.passCode}
                      </button>

                      {!row.checkedInRecord && (
                        <button
                          type="button"
                          onClick={() => handleCheckIn(row.passCode)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          Mark present
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-slate-100 px-4 py-8 text-sm text-slate-500">
                  {selectedEventId ? "No registered students found for this event." : "Select an event to view attendees."}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
  );
}
