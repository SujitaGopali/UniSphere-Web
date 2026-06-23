import { z } from "zod";

export const EventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  category: z.enum(["Sports", "Technical", "Cultural", "Workshop", "Other"]),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
});

export type EventType = z.infer<typeof EventSchema>;
