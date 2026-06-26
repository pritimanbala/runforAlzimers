import { getDb } from '@/lib/mongodb'
import { loginSchema, toPublicUser, type UserDocument } from '@/lib/schemas'
import { signAuthToken, verifyPassword } from '@/lib/auth-server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid login details',
          code: 'invalid_input',
        },
        { status: 400 }
      )
    }

    const db = await getDb()
    const user = await db
      .collection<UserDocument>('users')
      .findOne({ email: parsed.data.email })

    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return Response.json(
        {
          success: false,
          message: 'Invalid email or password',
          code: 'invalid_credentials',
        },
        { status: 400 }
      )
    }

    if (!user.isVerified) {
      return Response.json(
        {
          success: false,
          message: 'Please verify your email before logging in',
          code: 'email_not_verified',
        },
        { status: 401 }
      )
    }

    const publicUser = toPublicUser(user)
    const token = signAuthToken(publicUser)

    return Response.json({
      success: true,
      message: 'Login successful',
      token,
      user: publicUser,
    })
  } catch (error) {
    console.error('Login error:', error)

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

