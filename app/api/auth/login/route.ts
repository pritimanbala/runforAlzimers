import { loginSchema, toPublicUser } from '@/lib/schemas'
import { signAuthToken, verifyPassword } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

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

    console.log('DATABASE_URL =', process.env.DATABASE_URL)

    const user = await prisma.user.findFirst({
      where: { email: parsed.data.email },
    })

    if (!user || !verifyPassword(parsed.data.password, user.password)) {
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
