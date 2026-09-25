import { z } from "zod";


export const signInSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const MIN_PASSWORD_LENGTH = 10;

const COMMON_PASSWORDS = new Set([
  "1234567890",
  "0123456789",
  "12345678910",
  "123456789a",
  "1q2w3e4r5t",
  "qwertyuiop",
  "asdfghjkl1",
  "password12",
  "password123",
  "password1234",
  "passw0rd123",
  "iloveyou123",
  "welcome123",
  "letmein1234",
  "abcdefghij",
  "aaaaaaaaaa",
  "1111111111",
  "0000000000",
  "qwerty1234",
  "qwerty123456",
  "football123",
  "tillpay123",
]);

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(128, "Use at most 128 characters")
    .refine((value) => !COMMON_PASSWORDS.has(value.toLowerCase()), {
      message: "That password is too common. Try a short phrase instead.",
    }),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
