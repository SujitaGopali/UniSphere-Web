import { z } from "zod";

export const RegistrationSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  userId: z.string().min(1, "User ID is required"),
  status: z.enum(["registered", "cancelled"]).default("registered"),
});

export type RegistrationType = z.infer<typeof RegistrationSchema>;
