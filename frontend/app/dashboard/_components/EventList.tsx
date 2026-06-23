"use client";

import { useTransition, useState } from "react";
import { handleRegisterForEvent, handleCancelRegistration } from "@/lib/actions/registration-action";
import { handleDeleteEvent } from "@/lib/actions/event-action";
import { EventResponse } from "@/lib/api/event";
import { RegistrationResponse } from "@/lib/api/registration";

interface EventListProps {
  events: EventResponse[];
  registrations: RegistrationResponse[];
  currentUserId: string;
}

export default function EventList({ events, registrations, currentUserId }: EventListProps) {
  const [isPending, startTransition] = useTransition();
  const [actionEventId, setActionEventId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getEventRegistration = (eventId: string) => {
    return registrations.find(
      (r) => r.event?._id === eventId && r.status === "registered"
    );
  };

  const onRegister = (eventId: string) => {
    setErrorMsg(null);
    setActionEventId(eventId);
    startTransition(async () => {
      const result = await handleRegisterForEvent(eventId);
      setActionEventId(null);
      if (!result.success) {
        setErrorMsg(result.message);
      }
    });
  };

  const onCancel = (registrationId: string, eventId: string) => {
    setErrorMsg(null);
    setActionEventId(eventId);
    startTransition(async () => {
      const result = await handleCancelRegistration(registrationId);
      setActionEventId(null);
      if (!result.success) {
        setErrorMsg(result.message);
      }
    });
  };

  const onDelete = (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setErrorMsg(null);
    setActionEventId(eventId);
    startTransition(async () => {
      const result = await handleDeleteEvent(eventId);
      setActionEventId(null);
      if (!result.success) {
        setErrorMsg(result.message);
      }
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Sports":
        return "bg-m-red/10 text-m-red border-m-red/20";
      case "Technical":
        return "bg-m-blue-light/10 text-m-blue-light border-m-blue-light/20";
      case "Cultural":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Workshop":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      default:
        return "bg-muted/10 text-muted border-hairline";
    }
  };

  if (events.length === 0) {
    return (
      <div className="rounded border border-hairline bg-surface-card p-10 text-center text-muted">
        No events found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="rounded border border-m-red/20 bg-m-red/10 p-4 text-sm text-m-red">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {events.map((event) => {
          const registration = getEventRegistration(event._id);
          const isRegistered = !!registration;
          const isOrganizer = event.organizer?._id === currentUserId;
          const isFull = event.registeredCount >= event.capacity;
          const loading = isPending && actionEventId === event._id;

          const fillPercentage = Math.min(
            100,
            Math.round((event.registeredCount / event.capacity) * 100)
          );

          return (
            <div
              key={event._id}
              className="flex flex-col justify-between rounded border border-hairline bg-surface-card p-6 transition-all hover:border-muted"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`inline-block rounded border px-2.5 py-0.5 text-xs uppercase tracking-[1px] ${getCategoryBadgeClass(
                      event.category
                    )}`}
                  >
                    {event.category}
                  </span>
                </div>

                <h3 className="mb-2 text-xl font-light text-on-dark uppercase tracking-[0.5px]">
                  {event.title}
                </h3>
                <p className="mb-4 text-sm font-light text-body line-clamp-3">
                  {event.description}
                </p>

                <div className="mb-6 space-y-2 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <span className="text-on-dark">Date:</span>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-on-dark">Location:</span>
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-on-dark">Organizer:</span>
                    <span>
                      {event.organizer
                        ? `${event.organizer.firstName} ${event.organizer.lastName}`
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 space-y-1">
                  <div className="flex justify-between text-xs text-muted">
                    <span>
                      {event.registeredCount} / {event.capacity} registered
                    </span>
                    <span>{fillPercentage}% filled</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-canvas overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isRegistered
                          ? "bg-m-blue-light"
                          : isFull
                          ? "bg-m-red"
                          : "bg-on-dark"
                      }`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  {isRegistered ? (
                    <button
                      disabled={loading}
                      onClick={() => onCancel(registration._id, event._id)}
                      className="flex-1 h-10 rounded border border-m-red/30 bg-m-red/10 text-xs font-semibold uppercase tracking-[1.5px] text-m-red transition-all hover:bg-m-red/20 disabled:opacity-50"
                    >
                      {loading ? "Cancelling..." : "Cancel Register"}
                    </button>
                  ) : (
                    <button
                      disabled={loading || isFull}
                      onClick={() => onRegister(event._id)}
                      className={`flex-1 h-10 rounded text-xs font-semibold uppercase tracking-[1.5px] transition-all disabled:opacity-50 ${
                        isFull
                          ? "border border-hairline text-muted cursor-not-allowed"
                          : "bg-on-dark text-canvas hover:opacity-90"
                      }`}
                    >
                      {loading
                        ? "Registering..."
                        : isFull
                        ? "Sold Out"
                        : "Register"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
