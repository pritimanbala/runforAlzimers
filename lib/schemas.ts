import { ObjectId } from 'mongodb'
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

export type UserDocument = {
  _id: ObjectId
  firstName: string
  lastName: string
  email: string
  phone: string
  passwordHash: string
  role: 'participant' | 'admin'
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  merchBought?: Array<{
    productId: string
    name: string
    type: 'pass' | 'merchandise'
    price: number
    quantity: number
  }>
}

export type OtpDocument = {
  _id: ObjectId
  email: string
  otpHash: string
  expiresAt: Date
  createdAt: Date
}

export type ProductDocument = {
  _id: ObjectId
  name: string
  description: string
  price: number
  category: 'pass' | 'merchandise'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type PurchaseDocument = {
  _id: ObjectId
  userId: ObjectId
  userEmail: string
  orderId: string
  paymentId: string
  items: Array<{
    productId: string
    name: string
    type: 'pass' | 'merchandise'
    price: number
    quantity: number
  }>
  amount: number
  currency: string
  status: 'completed' | 'pending'
  createdAt: Date
}

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
  }
}
