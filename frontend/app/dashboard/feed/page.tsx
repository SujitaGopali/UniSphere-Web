"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clearAuthCookies } from "@/lib/cookies";
import Image from "next/image";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import { useAuth } from "@/lib/context/AuthContext";
import { filterEventsForUser } from "@/lib/events";
import { UiEventItem, toUiEventItems } from "@/lib/event-helpers";

interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
}

interface RegistrationResponse {
  _id: string;
  event?: {
    _id?: string;
  };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload as ApiResponse<T>;
}

async function registerEventForUser(eventId: string): Promise<ApiResponse<RegistrationResponse>> {
  return fetchJson<RegistrationResponse>("/api/v1/registrations", {
    method: "POST",
    body: JSON.stringify({ eventId }),
  });
}

// ── Sidebar nav items ─────────────────────────────────────────────────────────
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

// ── Category colour palettes for event poster banners ─────────────────────────
const CATEGORY_GRADIENTS: Record<string, string> = {
  Cultural:   "from-rose-500 via-pink-600 to-purple-700",
  Technical:  "from-blue-500 via-indigo-600 to-violet-700",
  Sports:     "from-emerald-500 via-teal-600 to-cyan-700",
  Literary:   "from-amber-500 via-orange-600 to-red-600",
  Management: "from-slate-600 via-gray-700 to-zinc-800",
  Others:     "from-violet-500 via-purple-600 to-fuchsia-700",
};

function getPosterGradient(category: string) {
  return CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS["Others"];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? "s" : ""} ago`;
}

// ── Simple QR visual (CSS grid pattern representing a QR) ────────────────────
function QRCode({ value }: { value: string }) {
  // Generate a deterministic 7×7 boolean grid from the string hash
  const hash = value.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const grid = Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => {
      // Corner finder patterns
      if ((r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2)) return true;
      return ((hash * (r + 1) * (c + 2)) % 3) !== 0;
    })
  );
  return (
    <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
      {grid.flat().map((on, i) => (
        <div key={i} className={`h-4 w-4 rounded-sm ${on ? "bg-slate-900" : "bg-white"}`} />
      ))}
    </div>
  );
}

// ── Registration Modal ────────────────────────────────────────────────────────
function RegisterModal({
  event,
  user,
  onClose,
  onRegistered,
}: {
  event: UiEventItem;
  user: Record<string, any>;
  onClose: () => void;
  onRegistered: () => void;
}) {
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState(`UNI-${event.id.slice(-4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Student";

  const handleConfirm = async () => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await registerEventForUser(event.id);
      if (!result.success) {
        setSubmitting(false);
        setErrorMessage(result.message || "Failed to register for the event.");
        return;
      }

      const registrationId = result.data?._id || ticketId;
      setTicketId(registrationId);
      onRegistered();
      setSubmitting(false);
      setStep("success");
    } catch (error) {
      setSubmitting(false);
      setErrorMessage(error instanceof Error ? error.message : "Failed to register for the event.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {step === "confirm" ? (
          <>
            {/* Modal header */}
            <div className={`bg-linear-to-r ${getPosterGradient(event.category)} p-6 text-white`}>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">{event.eventType}</p>
              <h2 className="text-2xl font-black leading-tight">{event.title}</h2>
              <p className="text-sm opacity-80 mt-1">{event.college}</p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                You are registering as <strong className="text-slate-900">{fullName}</strong> for this event. Please review the details below.
              </p>

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Details */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 divide-y divide-slate-100 text-sm">
                <div className="flex items-center gap-3 px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-violet-500 shrink-0"><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></svg>
                  <span className="text-slate-700 font-medium">{new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-violet-500 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span className="text-slate-700 font-medium">{event.location}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-violet-500 shrink-0"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  <span className="text-slate-700 font-medium">{event.capacity} total seats</span>
                </div>
                {event.cashPrize && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-amber-500 shrink-0"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    <span className="text-slate-700 font-medium">Prize: <strong className="text-amber-700">{event.cashPrize}</strong></span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400">By registering, you confirm your attendance and agree to the event terms.</p>

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/30 hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Processing...</>
                  ) : "Confirm Registration"}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ── Success / Ticket view ── */
          <div className="p-6 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">You&apos;re Registered!</h2>
            <p className="text-sm text-slate-500 mb-6">Your spot at <strong>{event.title}</strong> is confirmed.</p>

            {/* Ticket card */}
            <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 p-6 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-3">Your Ticket</p>

              <div className="flex justify-center mb-4">
                <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-100">
                  <QRCode value={ticketId} />
                </div>
              </div>

              <p className="text-lg font-black text-slate-900">{event.title}</p>
              <p className="text-xs text-slate-500 mt-1 mb-3">{event.college}</p>

              <div className="rounded-lg bg-white border border-violet-100 px-4 py-2 inline-block">
                <span className="text-xs text-slate-400 mr-2">Ticket ID</span>
                <span className="font-mono text-sm font-bold text-violet-700">{ticketId}</span>
              </div>

              <p className="text-xs text-slate-400 mt-3">
                {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {event.location}
              </p>
            </div>

            <p className="text-xs text-slate-400 mb-5">
              This ticket has been added to your <strong>QR Passport</strong>. Present it at the event entrance.
            </p>

            <div className="flex gap-3">
              <Link href="/dashboard/qr-passport" className="flex-1 rounded-xl border border-violet-200 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50 transition-colors">
                View QR Passport
              </Link>
              <button onClick={onClose} className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors">
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Feed Page ─────────────────────────────────────────────────────────────
export default function FeedPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [rawEvents, setRawEvents] = useState<UiEventItem[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [registeringEvent, setRegisteringEvent] = useState<UiEventItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const userCollege = user?.college || "Herald College Kathmandu";

  const reloadEvents = async () => {
    try {
      const result = await fetchJson<UiEventItem[]>("/api/v1/events");
      if (!result.success || !result.data) return;

      const events = toUiEventItems(result.data as any).sort(
        (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
      );
      setRawEvents(events);
    } catch {
      setRawEvents([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      await reloadEvents();
      if (user?.email) {
        try {
          const registrationsResult = await fetchJson<RegistrationResponse[]>("/api/v1/registrations/my");
          if (registrationsResult.success) {
            setRegisteredIds(
              (registrationsResult.data || [])
                .map((registration) => registration.event?._id)
                .filter((id): id is string => Boolean(id))
            );
          }
        } catch {
          setRegisteredIds([]);
        }
      }
    };

    load();
    window.addEventListener("focus", load);
    return () => {
      window.removeEventListener("focus", load);
    };
  }, [user?.email]);

  const initials = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";

  const handleLogout = async () => {
    await clearAuthCookies();
    router.push("/login");
    router.refresh();
  };

  const visibleFeedEvents = filterEventsForUser(rawEvents, userCollege);

  const handleRegister = (evt: UiEventItem) => {
    if (registeredIds.includes(evt.id)) {
      showToast("You are already registered!");
      return;
    }
    setRegisteringEvent(evt);
  };

  const handleRegistrationClose = () => {
    setRegisteringEvent(null);
  };

  const handleRegistered = async () => {
    if (registeringEvent) {
      setRegisteredIds((prev) =>
        prev.includes(registeringEvent.id) ? prev : [...prev, registeringEvent.id]
      );
    }
    await reloadEvents();
    showToast("Registration successful. Admin can now see it.");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">

      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-slate-200 bg-white min-h-screen fixed top-0 left-0 h-full z-10">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-blue-500 text-white text-sm font-bold">U</span>
            <span className="text-base font-bold text-slate-800 tracking-tight">UniSphere</span>
          </Link>
          <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 uppercase tracking-wide">
            Participant
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-linear-to-r from-violet-500 to-blue-500 text-white shadow-sm [&_svg]:stroke-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

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
      <main className="flex-1 ml-60 px-4 sm:px-6 py-6 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto">
          <h1 className="text-2xl font-extrabold text-slate-900">Event Feed</h1>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500" title="Notifications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500" title="Profile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" /></svg>
            </button>
            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500" title="Logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-emerald-400"><polyline points="20 6 9 17 4 12" /></svg>
            {toastMessage}
          </div>
        )}

        {/* Feed stream */}
        <div className="mx-auto max-w-5xl pb-16">
          {visibleFeedEvents.length > 0 ? (
            <div className="space-y-4">
              {visibleFeedEvents.map((evt) => {
                const isRegistered = registeredIds.includes(evt.id);

                return (
                  <article key={evt.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className={`bg-linear-to-r ${getPosterGradient(evt.category)} p-5 text-white`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
                              {evt.category}
                            </span>
                            <span className="rounded-full bg-black/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
                              {evt.eventType}
                            </span>
                          </div>
                          <h2 className="text-xl font-black leading-snug">{evt.title}</h2>
                          <p className="mt-2 text-sm font-medium text-white/80">{evt.college}</p>
                        </div>
                        <button
                          onClick={() => handleRegister(evt)}
                          disabled={isRegistered}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                            isRegistered
                              ? "bg-emerald-500/90 text-white"
                              : "bg-white/15 text-white hover:bg-white/25"
                          }`}
                        >
                          {isRegistered ? "Registered" : "Register"}
                        </button>
                      </div>
                    </div>

                    <div className="p-5">
                      {evt.brochureImage ? (
                        <div className="mb-4 overflow-hidden rounded-[20px] border border-slate-200 bg-slate-100 shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={evt.brochureImage}
                            alt={evt.title}
                            className="h-72 w-full object-cover bg-white"
                          />
                        </div>
                      ) : null}

                      <p className="text-sm text-slate-600">{evt.description}</p>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-slate-400">
                            <rect x="3" y="4.5" width="18" height="16" rx="2" />
                            <path d="M3 9.5h18" />
                          </svg>
                          {new Date(evt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-slate-400">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {evt.location}
                        </span>
                        {evt.cashPrize && (
                          <span className="flex items-center gap-1.5 font-medium text-amber-700">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-amber-500">
                              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            {evt.cashPrize}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7"><path d="M4 6h16M4 10h16M4 14h10" /></svg>
              </div>
              <h2 className="mb-1 text-base font-bold text-slate-800">No events yet</h2>
              <p className="text-sm text-slate-400">Events for {userCollege} will appear here.</p>
            </div>
          )}
        </div>
      </main>

      {/* ── Registration Modal ── */}
      {registeringEvent && (
        <RegisterModal
          event={registeringEvent}
          user={user as Record<string, any>}
          onClose={handleRegistrationClose}
          onRegistered={handleRegistered}
        />
      )}
    </div>
  );
}
