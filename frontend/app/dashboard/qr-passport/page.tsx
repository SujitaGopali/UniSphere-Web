"use client";

import { handleGetMyRegistrations } from "@/lib/actions/registration-action";
import { RegistrationResponse } from "@/lib/api/registration";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import { useAuth } from "@/lib/context/AuthContext";

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

interface CheckInRecord {
  id: string;
  registrationId: string;
  eventId: string;
  eventName: string;
  venue: string;
  date: string;
  time: string;
  status: "successful";
}

interface RegisteredQrPass {
  id: string;
  eventId: string;
  eventName: string;
  venue: string;
  eventDate: string;
  registeredAt: string;
  qrValue: string;
  passCode: string;
}

const CHECKIN_HISTORY_KEY = "unisphere_checkin_history";

function getPassCode(registration: RegistrationResponse) {
  const eventId = registration.event?._id || "event";
  const eventPart = eventId.slice(-4).toUpperCase().padStart(4, "0");
  const registrationPart = registration._id.slice(-6).toUpperCase().padStart(6, "0");
  return `UNI-${eventPart}-${registrationPart}`;
}

function createQrValue(registration: RegistrationResponse, userId: string) {
  return JSON.stringify({
    registrationId: registration._id,
    eventId: registration.event?._id,
    userId,
    type: "event-registration",
  });
}

function buildQrCells(value: string) {
  const size = 21;
  const reserved = new Set<string>();
  const cells: { x: number; y: number }[] = [];

  const addFinder = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const absoluteX = startX + x;
        const absoluteY = startY + y;
        reserved.add(`${absoluteX}-${absoluteY}`);

        const isOuter = x === 0 || x === 6 || y === 0 || y === 6;
        const isInner = x >= 2 && x <= 4 && y >= 2 && y <= 4;

        if (isOuter || isInner) {
          cells.push({ x: absoluteX, y: absoluteY });
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(size - 7, 0);
  addFinder(0, size - 7);

  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (reserved.has(`${x}-${y}`)) continue;

      hash = (hash * 1664525 + 1013904223) >>> 0;
      if ((hash & 1) === 1) {
        cells.push({ x, y });
      }
    }
  }

  return cells;
}

export default function QrPassportPage() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isVerified = user?.verificationStatus === "approved";
  const [scanFlash, setScanFlash] = useState(false);
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([]);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRegistrations = async () => {
      setIsLoading(true);
      const result = await handleGetMyRegistrations();

      if (!isMounted) return;

      const registeredItems = (result.success ? result.data : []).filter(
        (registration) => registration.status === "registered" && registration.event?._id
      );

      setRegistrations(registeredItems);
      setSelectedRegistrationId((current) => {
        if (current && registeredItems.some((registration) => registration._id === current)) {
          return current;
        }

        return registeredItems[0]?._id || "";
      });
      setIsLoading(false);
    };

    const history = localStorage.getItem(CHECKIN_HISTORY_KEY);
    if (history) {
      try { setCheckInHistory(JSON.parse(history)); } catch { /* ignore */ }
    }

    loadRegistrations();

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  const registeredPasses = useMemo<RegisteredQrPass[]>(() => {
    const userId = String(user?._id || user?.id || user?.email || "anonymous");

    return registrations.map((registration) => ({
      id: registration._id,
      eventId: registration.event._id,
      eventName: registration.event.title || "Untitled event",
      venue: registration.event.location || "Venue not available",
      eventDate: registration.event.date,
      registeredAt: registration.createdAt,
      qrValue: createQrValue(registration, userId),
      passCode: getPassCode(registration),
    }));
  }, [registrations, user?._id, user?.email, user?.id]);

  const activePass =
    registeredPasses.find((pass) => pass.id === selectedRegistrationId) || registeredPasses[0] || null;
  const activePassHistory = activePass
    ? checkInHistory.filter((record) => record.registrationId === activePass.id)
    : [];
  const qrCells = useMemo(() => (activePass ? buildQrCells(activePass.qrValue) : []), [activePass]);

  const initials = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase() || "S";
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Student";

  const handleSimulateScan = () => {
    if (!activePass) {
      window.alert("Register for an event first to generate a QR pass.");
      return;
    }

    setScanFlash(true);
    const now = new Date();
    const newRecord: CheckInRecord = {
      id: `checkin_${Date.now()}`,
      registrationId: activePass.id,
      eventId: activePass.eventId,
      eventName: activePass.eventName,
      venue: activePass.venue,
      date: now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      status: "successful",
    };

    setCheckInHistory((prev) => {
      const updated = [newRecord, ...prev];
      localStorage.setItem(CHECKIN_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });

    setTimeout(() => setScanFlash(false), 3500);
  };

  const handleClearHistory = () => {
    if (!activePass) return;

    setCheckInHistory((prev) => {
      const updated = prev.filter((record) => record.registrationId !== activePass.id);
      localStorage.setItem(CHECKIN_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">

      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-slate-100 bg-white min-h-screen">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 text-white text-sm font-bold">U</span>
            <span className="text-base font-bold text-slate-800 tracking-tight">UniSphere</span>
          </Link>
          <span className="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 uppercase tracking-wide">
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
                    ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-sm [&_svg]:stroke-white"
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
      <main className="flex-1 px-8 py-8 overflow-y-auto">

        {/* Top-right icons */}
        <div className="flex justify-end items-center gap-1 mb-6">
          <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500" title="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button onClick={() => logout()} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500" title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-1">
          <Link href="/dashboard" className="p-1.5 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900">QR Event Passport</h1>
        </div>
        <p className="mb-6 ml-9 text-sm text-slate-500">Your digital entry pass for seamless event check-ins</p>

        {/* Not-verified warning banner */}
        {!isVerified && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">Student ID Not Verified</p>
                <p className="text-xs text-amber-700 mt-0.5">Your QR Passport is active, but please verify your student ID for priority access at events.</p>
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              className="shrink-0 rounded-xl bg-amber-500 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
            >
              Verify ID →
            </Link>
          </div>
        )}

        {/* Scan success flash */}
        {scanFlash && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white font-bold text-lg">✓</div>
            <div>
              <p className="font-bold text-sm">Venue Check-in Successful!</p>
              <p className="text-xs text-green-700 mt-0.5">Organizer scanned your QR Passport. Welcome to the venue! Attendance recorded.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Digital Passport Card */}
          <div className="lg:col-span-1">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
              {/* Decorative blobs */}
              <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-violet-600/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-blue-600/20 blur-2xl" />

              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-blue-500 text-xs font-bold">U</span>
                  <span className="font-bold tracking-tight text-sm">UniSphere Pass</span>
                </div>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.3 14.7L6.5 12.5l1.4-1.4 2.8 2.8 6.8-6.8 1.4 1.4-8.2 8.2z" /></svg>
                    Verified
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-500/30">
                    Pending ID
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-sm text-slate-300">
                  Loading your registered event QR...
                </div>
              ) : !activePass ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-white">No event QR available yet</p>
                  <p className="mt-2 text-xs text-slate-300">
                    Your QR pass is created only after you complete an event registration.
                  </p>
                  <Link
                    href="/dashboard/discover"
                    className="mt-4 inline-flex rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-colors"
                  >
                    Register for an event
                  </Link>
                </div>
              ) : (
                <>
                  {/* QR Code Container */}
                  <div className={`mx-auto mb-5 flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-3 shadow-inner transition-all duration-300 ${scanFlash ? "ring-4 ring-emerald-400 scale-105" : ""}`}>
                    <svg viewBox="0 0 210 210" className="h-full w-full">
                      <rect width="210" height="210" fill="white" rx="24" />
                      {qrCells.map((cell) => (
                        <rect
                          key={`${cell.x}-${cell.y}`}
                          x={cell.x * 10}
                          y={cell.y * 10}
                          width="10"
                          height="10"
                          rx="1.5"
                          fill={cell.x > 7 && cell.x < 13 && cell.y > 7 && cell.y < 13 ? "#6d28d9" : "#111827"}
                        />
                      ))}
                    </svg>
                  </div>

                  <div className="text-center mb-5">
                    <p className="text-lg font-bold">{fullName}</p>
                    <p className="text-xs text-indigo-300 mt-0.5">Pass: {activePass.passCode}</p>
                    <p className="text-xs text-white mt-2 font-medium">{activePass.eventName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{activePass.venue}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(activePass.eventDate).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-3 text-xs text-slate-500">
                      <span>Check-ins: <span className="font-bold text-white">{activePassHistory.length}</span></span>
                      <span className="text-slate-700">|</span>
                      <span>Status: <span className={`font-bold ${isVerified ? "text-emerald-400" : "text-amber-400"}`}>{isVerified ? "Verified" : "Unverified"}</span></span>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handleSimulateScan}
                disabled={!activePass}
                className="w-full rounded-xl bg-violet-600 py-3 text-xs font-semibold text-white shadow-md hover:bg-violet-500 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                Simulate Venue Check-in Scan
              </button>

              <p className="mt-3 text-center text-[10px] text-slate-600">
                Only completed event registrations generate a scannable QR pass
              </p>
            </div>

            {/* Download / Share card (UI only) */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                title="Download QR (demo only)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </button>
              <button
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                title="Share QR (demo only)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share
              </button>
            </div>
          </div>

          {/* Details & History */}
          <div className="lg:col-span-2 space-y-6">

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Registered event QR passes</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Admin QR check-in only receives passes from your completed registrations.
                  </p>
                </div>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                  {registeredPasses.length} pass{registeredPasses.length !== 1 ? "es" : ""}
                </span>
              </div>

              {registeredPasses.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {registeredPasses.map((pass) => {
                    const isActive = activePass?.id === pass.id;

                    return (
                      <button
                        key={pass.id}
                        onClick={() => setSelectedRegistrationId(pass.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                          isActive
                            ? "border-violet-200 bg-violet-50 shadow-sm"
                            : "border-slate-100 bg-slate-50 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{pass.eventName}</p>
                            <p className="mt-1 text-xs text-slate-500">{pass.venue}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              Registered {new Date(pass.registeredAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs font-semibold text-violet-700">{pass.passCode}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(pass.eventDate).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  No registered events yet. Once you register for an event, its QR pass will appear here and be eligible for admin check-in simulation.
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-4">How QR Check-in Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 text-xs font-bold">1</div>
                  <p className="text-xs font-semibold text-slate-800">Register First</p>
                  <p className="text-xs text-slate-500 mt-1">A QR pass is created only after your event registration is completed successfully.</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 text-xs font-bold">2</div>
                  <p className="text-xs font-semibold text-slate-800">Show Event QR</p>
                  <p className="text-xs text-slate-500 mt-1">Open the QR for the specific event you registered for and present it at entry.</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 text-xs font-bold">3</div>
                  <p className="text-xs font-semibold text-slate-800">Admin Sees Only Registered Users</p>
                  <p className="text-xs text-slate-500 mt-1">The admin scanner uses the registration list, so unregistered users never appear as valid QR scans.</p>
                </div>
              </div>
            </div>

            {/* Passport Privileges */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-800 mb-4">Passport Privileges</h2>
              <div className="space-y-3">
                {[
                  { label: "Instant venue entry — no paper tickets needed", active: true },
                  { label: "Automatic attendance tracking", active: true },
                  { label: "Priority seating at limited-capacity events", active: isVerified },
                  { label: "Certificate eligibility after event attendance", active: isVerified },
                  { label: "Exclusive verified-only event access", active: isVerified },
                ].map((priv) => (
                  <div key={priv.label} className="flex items-center gap-3">
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${priv.active ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300"}`}>
                      {priv.active ? (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" /></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3"><path d="M18 6 6 18M6 6l12 12" /></svg>
                      )}
                    </div>
                    <span className={`text-xs ${priv.active ? "text-slate-700" : "text-slate-400"}`}>{priv.label}</span>
                    {!priv.active && (
                      <span className="ml-auto text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Verify ID</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Check-in History */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800">Venue Entry History</h2>
                {activePassHistory.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Clear current pass history
                  </button>
                )}
              </div>

              {!activePass ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">No active event QR selected</p>
                  <p className="text-xs text-slate-400 mt-1">Register for an event to generate a QR and start tracking check-ins.</p>
                </div>
              ) : activePassHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
                      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">No venue entries recorded for this event yet</p>
                  <p className="text-xs text-slate-400 mt-1">Try the "Simulate Venue Check-in Scan" button on your registered event pass to test how it works.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activePassHistory.map((record) => (
                    <div key={record.id} className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.3 14.7L6.5 12.5l1.4-1.4 2.8 2.8 6.8-6.8 1.4 1.4-8.2 8.2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{record.eventName}</p>
                        <p className="text-xs text-slate-500 truncate">{record.venue}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-slate-700">{record.date}</p>
                        <p className="text-xs text-slate-400">{record.time}</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                        Entered
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
