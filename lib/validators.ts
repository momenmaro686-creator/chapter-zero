import { z } from 'zod';

export const phoneNumberRegex = /^(\+20|0)?1[0125]\d{8}$/; // Egyptian phone numbers

export const LoginSchema = z.object({
  phoneNumber: z.string().regex(phoneNumberRegex, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z
  .object({
    phoneNumber: z.string().regex(phoneNumberRegex, 'Invalid phone number'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(20, 'Username must not exceed 20 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, _, and -'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const CheckoutSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email().optional(),
  governorate: z.string().min(1, 'Governorate is required'),
  city: z.string().min(1, 'City is required'),
  street: z.string().min(1, 'Street is required'),
  building: z.string().optional(),
  apartment: z.string().optional(),
  phoneNumber: z.string().regex(phoneNumberRegex, 'Invalid phone number'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
