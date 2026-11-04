import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().max(254).email("Enter a valid email address.");
export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(200, "That password is too long.");

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(60, "That name is a little long."),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(200),
});
