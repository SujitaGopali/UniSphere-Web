"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clearAuthCookies } from "@/lib/cookies";
import Image from "next/image";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import { useAuth } from "@/lib/context/AuthContext";
import { isEventVisibleToUser } from "@/lib/events";
import { handleGetEvents } from "@/lib/actions/event-action";
import {
  handleGetMyRegistrations,
  handleRegisterForEvent,
} from "@/lib/actions/registration-action";
import { UiEventItem, toUiEventItems } from "@/lib/event-helpers";

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

const genres = ["All", "Technical", "Cultural", "Sports", "Literary", "Management", "Others"];
const eventTypes = ["All", "Intercollegiate", "Intracollegiate"];
const dateRanges = ["All Time", "Today", "This Week", "This Month", "Next Month"];

export default function DiscoverPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDate, setSelectedDate] = useState("All Time");
  const [events, setEvents] = useState<UiEventItem[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const eventsResult = await handleGetEvents();
      if (eventsResult.success) {
        setEvents(toUiEventItems(eventsResult.data));
      }

      if (user?.email) {
        const registrationsResult = await handleGetMyRegistrations();
        if (registrationsResult.success) {
          setRegisteredIds(
            registrationsResult.data
              .map((registration) => registration.event?._id)
              .filter((id): id is string => Boolean(id))
          );
        }
      }
    };

    load();
  }, [user?.email]);

  const initials = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
  const userCollege = user?.college || "Herald College Kathmandu";

  const filteredEvents = events.filter((evt) => {
    const isVisibleToCollege = isEventVisibleToUser(evt, userCollege);
    if (!isVisibleToCollege) return false;

    const matchesSearch =
      search === "" ||
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.college.toLowerCase().includes(search.toLowerCase()) ||
      evt.category.toLowerCase().includes(search.toLowerCase());

    const matchesGenre = selectedGenre === "All" || evt.category === selectedGenre;
    const matchesType = selectedType === "All" || evt.eventType === selectedType;

    return matchesSearch && matchesGenre && matchesType;
  });

  const handleRegister = async (eventId: string) => {
    if (registeredIds.includes(eventId)) return;

    setRegisteringId(eventId);
    const result = await handleRegisterForEvent(eventId);
    setRegisteringId(null);

    if (!result.success) {
      window.alert(result.message || "Failed to register for the event.");
      return;
    }

    setRegisteredIds((prev) => (prev.includes(eventId) ? prev : [...prev, eventId]));
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? { ...event, registeredCount: (event.registeredCount || 0) + 1 }
          : event
      )
    );
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
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500" title="Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
            </svg>
          </button>
          <button onClick={() => logout()} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500" title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        {/* Page heading */}
        <div className="flex items-center gap-3 mb-1">
          <Link href="/dashboard" className="p-1.5 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Discover Events
          </h1>
        </div>
        <p className="mb-6 ml-9 text-sm text-slate-500">Explore events across colleges and genres</p>

        {/* Search bar */}
        <div className="mb-5 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event, college, or genre..."
            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {/* Filters card */}
        <div className="mb-6 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5 text-slate-700 font-semibold text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
          </div>

          {/* Genre */}
          <div className="mb-5">
            <p className="mb-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Genre / Category</p>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button key={g} onClick={() => setSelectedGenre(g)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    selectedGenre === g
                      ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Event Type */}
          <div className="mb-5">
            <p className="mb-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Event Type</p>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((t) => (
                <button key={t} onClick={() => setSelectedType(t)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    selectedType === t
                      ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <p className="mb-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date Range</p>
            <div className="relative max-w-xs">
              <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 outline-none transition-all focus:border-violet-400 appearance-none cursor-pointer">
                {dateRanges.map((d) => <option key={d}>{d}</option>)}
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-violet-500">
              <path d="m12 2 2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            <span className="font-semibold text-slate-800">Found {filteredEvents.length} events</span>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((evt) => (
                <div key={evt.id} className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-violet-500">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600 border border-violet-100">
                      {evt.category}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                      {evt.eventType}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg mb-1 leading-snug">{evt.title}</h3>
                  <p className="text-xs font-medium text-blue-600 mb-3">{evt.college}</p>
                  
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1">{evt.description}</p>
                  
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5 text-slate-400">
                        <rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9.5h18" />
                      </svg>
                      {new Date(evt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5 text-slate-400">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      {evt.location}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRegister(evt.id)}
                    disabled={registeredIds.includes(evt.id) || registeringId === evt.id}
                    className={`mt-4 w-full rounded-xl py-2.5 text-xs font-semibold text-white shadow-sm transition-colors ${
                      registeredIds.includes(evt.id)
                        ? "bg-emerald-500"
                        : "bg-violet-600 hover:bg-violet-700"
                    } disabled:cursor-not-allowed disabled:opacity-80`}
                  >
                    {registeredIds.includes(evt.id)
                      ? "Registered"
                      : registeringId === evt.id
                        ? "Registering..."
                        : "Register Now"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-slate-300">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500">No events found</p>
              <p className="mt-1 text-xs text-slate-400">Events published by admins will appear right here</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
