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
          message: parsed.error.issues[0]?.message || 'Invalid admin login details',
        },
        { status: 400 }
      )
    }

    const db = await getDb()
    const user = await db.collection<UserDocument>('users').findOne({ email: parsed.data.email })

    if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
      return Response.json(
        { success: false, message: 'Invalid admin email or password' },
        { status: 400 }
      )
    }

    if (user.role !== 'admin') {
      return Response.json(
        { success: false, message: 'This account does not have admin access' },
        { status: 403 }
      )
    }

    if (!user.isVerified) {
      return Response.json(
        { success: false, message: 'Please verify this admin account before logging in' },
        { status: 401 }
      )
    }

    const publicUser = toPublicUser(user)

    return Response.json({
      success: true,
      message: 'Admin login successful',
      token: signAuthToken(publicUser),
      user: publicUser,
    })
  } catch (error) {
    console.error('Admin login error:', error)

    return Response.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
