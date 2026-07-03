import { prisma } from '@/lib/prisma'
import { loginSchema, type PublicUser } from '@/lib/schemas'
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

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    })

    if (!user || !verifyPassword(parsed.data.password, user.password)) {
      return Response.json(
        { success: false, message: 'Invalid admin email or password' },
        { status: 400 }
      )
    }

    if (!user.isAdmin) {
      return Response.json(
        { success: false, message: 'This account does not have admin access' },
        { status: 403 }
      )
    }

    const publicUser: PublicUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: 'admin',
    }

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
