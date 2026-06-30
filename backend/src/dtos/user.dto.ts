import { z } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  studentId: true,
  password: true,
});

export const LoginUserDTO = UserSchema.pick({
  email: true,
  password: true,
});

export const UpdateUserDTO = UserSchema.partial();

export type CreateUserDTOType = z.infer<typeof CreateUserDTO>;
export type LoginUserDTOType = z.infer<typeof LoginUserDTO>;
export type UpdateUserDTOType = z.infer<typeof UpdateUserDTO>;
