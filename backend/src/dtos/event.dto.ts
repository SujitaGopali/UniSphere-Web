import { z } from "zod";
import { EventSchema } from "../types/event.type";

export const CreateEventDTO = EventSchema.pick({
  title: true,
  description: true,
  date: true,
  location: true,
  category: true,
  capacity: true,
});

export const UpdateEventDTO = CreateEventDTO.partial();

export type CreateEventDTOType = z.infer<typeof CreateEventDTO>;
export type UpdateEventDTOType = z.infer<typeof UpdateEventDTO>;
