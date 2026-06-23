import { z } from "zod";
import { RegistrationSchema } from "../types/registration.type";

export const CreateRegistrationDTO = RegistrationSchema.pick({
  eventId: true,
});

export type CreateRegistrationDTOType = z.infer<typeof CreateRegistrationDTO>;
