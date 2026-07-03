import { z } from 'zod'

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Valid email is required').toLowerCase(),
  phone: z.string().trim().min(7, 'Phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().trim().email('Valid email is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export const verifyOtpSchema = z.object({
  email: z.string().trim().email('Valid email is required').toLowerCase(),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
})

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  description: z.string().trim().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  category: z.enum(['pass', 'merchandise']),
})

export type PublicUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'participant' | 'admin'
}

type PublicUserInput = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  isAdmin: boolean
}

export function toPublicUser(user: PublicUserInput): PublicUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.isAdmin ? 'admin' : 'participant',
  }
}
