import { getDb } from '@/lib/mongodb'
import { hashOtp, signAuthToken } from '@/lib/auth-server'
import {
  toPublicUser,
  verifyOtpSchema,
  type OtpDocument,
  type UserDocument,
} from '@/lib/schemas'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = verifyOtpSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid OTP details',
          code: 'invalid_input',
        },
        { status: 400 }
      )
    }

    const db = await getDb()
    const otpRecord = await db.collection<OtpDocument>('otps').findOne({
      email: parsed.data.email,
      otpHash: hashOtp(parsed.data.otp),
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      return Response.json(
        {
          success: false,
          message: 'Invalid OTP or OTP expired',
          code: 'invalid_otp',
        },
        { status: 400 }
      )
    }

    const updatedUser = await db
      .collection<UserDocument>('users')
      .findOneAndUpdate(
        { email: parsed.data.email },
        { $set: { isVerified: true, updatedAt: new Date() } },
        { returnDocument: 'after' }
      )

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: 'User not found',
          code: 'user_not_found',
        },
        { status: 401 }
      )
    }

    await db.collection<OtpDocument>('otps').deleteMany({ email: parsed.data.email })

    const publicUser = toPublicUser(updatedUser)

    return Response.json({
      success: true,
      message: 'Email verified successfully',
      token: signAuthToken(publicUser),
      user: publicUser,
    })
  } catch (error) {
    console.error('OTP verification error:', error)

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
