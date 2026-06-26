import { getDb } from '@/lib/mongodb'
import { hashOtp, hashPassword, generateOtp } from '@/lib/auth-server'
import { registerSchema, type OtpDocument, type UserDocument } from '@/lib/schemas'
import { ObjectId } from 'mongodb'
import { sendOtpEmail } from '@/lib/mailer'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid registration details',
          code: 'invalid_input',
        },
        { status: 400 }
      )
    }

    const db = await getDb()
    const users = db.collection<UserDocument>('users')
    const otps = db.collection<OtpDocument>('otps')
    const existingUser = await users.findOne({ email: parsed.data.email })

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: 'Email already exists',
          code: 'email_exists',
        },
        { status: 400 }
      )
    }

    await users.createIndex({ email: 1 }, { unique: true })
    await otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })

    const now = new Date()
    const result = await users.insertOne({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash: hashPassword(parsed.data.password),
      role: 'participant',
      isVerified: false,
      createdAt: now,
      updatedAt: now,
      _id: new ObjectId(),
      merchBought: [],
    })

    const otp = generateOtp()
    await otps.deleteMany({ email: parsed.data.email })
    await otps.insertOne({
      email: parsed.data.email,
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: now,
      _id: new ObjectId(),
    })

    await sendOtpEmail({
      to: parsed.data.email,
      firstName: parsed.data.firstName,
      otp,
    })

    return Response.json(
      {
        success: true,
        message: 'Registration successful. Please verify your email.',
        userId: result.insertedId.toString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)

    return Response.json(
      {
        success: false,
        message: 'Server error',
        code: 'server_error',
      },
      { status: 500 }
    )
  }
}
