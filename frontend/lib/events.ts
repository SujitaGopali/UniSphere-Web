export interface EventItem {
  id: string;
  title: string;
  category: string;
  eventType: string; // "Intercollegiate" | "Intracollegiate"
  college: string;
  date: string;
  location: string;
  capacity: number;
  registeredCount: number;
  description: string;
  createdAt: string;
  brochureImage?: string; // base64 data URL of uploaded brochure/poster
  cashPrize?: string;     // e.g. "NPR 10,000" or "USD 500"
}

export interface Registration {
  id: string;         // unique registration ID e.g. UNI-xxxx-1234
  eventId: string;
  eventTitle: string;
  userId: string;     // user email used as unique identifier
  userName: string;
  userCollege: string;
  registeredAt: string; // ISO date
}

const REGISTRATIONS_KEY = "unisphere_registrations";
const VERIFICATIONS_KEY = "unisphere_verifications";

function normalizeCollegeName(value?: string): string {
  return (value || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Single initial event as requested by the user
export const SEED_EVENTS: EventItem[] = [
  {
    id: "evt_seed_1",
    title: "Dance Competition 2026",
    category: "Cultural",
    eventType: "Intercollegiate",
    college: "Islington College",
    date: "2026-08-09T14:00",
    location: "Islington Main Auditorium",
    capacity: 100,
    registeredCount: 0,
    description: "Grand intercollege dance competition open to all college students in Nepal. Show off your talent and compete for top prizes!",
    cashPrize: "NPR 15,000 + Trophy",
    createdAt: "2026-07-23T10:00:00.000Z",
  },
];

// Increment this whenever the seed data changes to force-clear old cached events
const CACHE_VERSION = "v7";
const CACHE_VER_KEY = "unisphere_events_version";

/**
 * Gets events stored in localStorage. If none exist, initializes localStorage with SEED_EVENTS.
 * Also cleans up any old extra seed dummy events and version-resets stale caches.
 */
export function getStoredEvents(): EventItem[] {
  if (typeof window === "undefined") return SEED_EVENTS;

  // If the cache version doesn't match, wipe old data and start fresh
  const storedVersion = localStorage.getItem(CACHE_VER_KEY);
  if (storedVersion !== CACHE_VERSION) {
    localStorage.setItem("unisphere_events", JSON.stringify(SEED_EVENTS));
    localStorage.setItem(CACHE_VER_KEY, CACHE_VERSION);
    return SEED_EVENTS;
  }

  const saved = localStorage.getItem("unisphere_events");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Remove ALL legacy seed events except evt_seed_1
        const cleaned = parsed.filter((evt) => {
          if (typeof evt.id === "string" && evt.id.startsWith("evt_seed_") && evt.id !== "evt_seed_1") {
            return false;
          }
          return true;
        });

        // If nothing left after purge, restore the single seed
        if (cleaned.length === 0) {
          localStorage.setItem("unisphere_events", JSON.stringify(SEED_EVENTS));
          return SEED_EVENTS;
        }

        // Ensure evt_seed_1 always exists in the list
        const hasSeed1 = cleaned.some((e) => e.id === "evt_seed_1");
        const final = hasSeed1 ? cleaned : [...SEED_EVENTS, ...cleaned];

        localStorage.setItem("unisphere_events", JSON.stringify(final));
        return final;
      }
    } catch (e) {
      console.error("Error parsing stored events:", e);
    }
  }

  // No data at all – seed the single default event
  localStorage.setItem("unisphere_events", JSON.stringify(SEED_EVENTS));
  return SEED_EVENTS;
}

/**
 * Determines whether an event is visible to a user based on college & event scope:
 * 1. Intercollege events ("Intercollegiate" / "Intercollege"): Visible to ALL students from ANY college.
 * 2. Intracollege events ("Intracollegiate" / "Intracollege"): Visible ONLY to students of that specific college.
 */
export function isEventVisibleToUser(evt: EventItem, userCollege?: string): boolean {
  if (!evt) return false;

  const type = (evt.eventType || "").trim().toLowerCase();
  const isIntercollege = type.includes("inter");

  // Intercollege events are visible to ALL students from ANY college
  if (isIntercollege) {
    return true;
  }

  // Intracollege events: restrict to matching college only
  const userCol = normalizeCollegeName(userCollege || "Herald College Kathmandu");
  const eventCol = normalizeCollegeName(evt.college);

  return Boolean(userCol) && userCol === eventCol;
}

/**
 * Filters a list of events according to user college visibility rules.
 */
export function filterEventsForUser(events: EventItem[], userCollege?: string): EventItem[] {
  return events.filter((evt) => isEventVisibleToUser(evt, userCollege));
}

/** ── Registrations ───────────────────────────────────────────────────────── */

export function getStoredRegistrations(): Registration[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(REGISTRATIONS_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRegistration(reg: Registration): void {
  if (typeof window === "undefined") return;
  const existing = getStoredRegistrations();
  if (existing.some((r) => r.eventId === reg.eventId && r.userId === reg.userId)) return;
  const updated = [reg, ...existing];
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(updated));

  // Bump registeredCount on the event
  const events = getStoredEvents();
  const idx = events.findIndex((e) => e.id === reg.eventId);
  if (idx !== -1) {
    events[idx] = { ...events[idx], registeredCount: (events[idx].registeredCount || 0) + 1 };
    localStorage.setItem("unisphere_events", JSON.stringify(events));
    window.dispatchEvent(new Event("storage"));
  }
}

export function getRegistrationsForEvent(eventId: string): Registration[] {
  return getStoredRegistrations().filter((r) => r.eventId === eventId);
}

export function getRegistrationsForUser(userId: string): Registration[] {
  return getStoredRegistrations().filter((r) => r.userId === userId);
}

export function getTotalRegistrationCount(): number {
  return getStoredRegistrations().length;
}

export function isUserRegisteredForEvent(userId: string, eventId: string): boolean {
  return getStoredRegistrations().some((r) => r.userId === userId && r.eventId === eventId);
}

/** ── ID Verifications ────────────────────────────────────────────────────── */

/**
 * ID verification state lives on the user record in the database and is read
 * through the API. It used to be mirrored in localStorage, which drifted: the
 * coordinator's badge counted stale local entries while the review queue read
 * the API, so the badge showed a count with nothing behind it. Clearing the old
 * key keeps that data from lingering in browsers that still have it.
 */
export function clearLegacyVerificationCache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VERIFICATIONS_KEY);
  localStorage.removeItem("unisphere_user_verified");
}
