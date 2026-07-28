import { EventResponse } from "@/lib/api/event";

export interface UiEventItem {
  id: string;
  title: string;
  category: string;
  eventType: string;
  college: string;
  date: string;
  location: string;
  capacity: number;
  registeredCount: number;
  description: string;
  createdAt: string;
  brochureImage?: string;
  cashPrize?: string;
  organizerId?: string;
}

export function toUiEventItem(event: EventResponse): UiEventItem {
  return {
    id: event._id,
    title: event.title,
    category: event.category,
    eventType: event.eventType || "Intercollegiate",
    college: event.college || "Unknown College",
    date: event.date,
    location: event.location,
    capacity: event.capacity,
    registeredCount: event.registeredCount || 0,
    description: event.description,
    createdAt: event.createdAt,
    brochureImage: event.brochureImage,
    cashPrize: event.cashPrize,
    organizerId: event.organizer?._id,
  };
}

export function toUiEventItems(events: EventResponse[]): UiEventItem[] {
  return events.map(toUiEventItem);
}
