import { z } from "zod";

const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(255, "Email must be at most 255 characters")
  .trim()
  .toLowerCase();

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(255, "Password must be at most 255 characters");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(1, "Name must be at least 1 character").max(255).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const updateMeSchema = z.object({
  name:z.string().min(1).max(255).trim().optional(),
})
.refine(data => Object.values(data).some(v => v !== undefined), {
  message: "At least one field must be provided",
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(255),
  newPassword: z.string().min(8).max(255),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;