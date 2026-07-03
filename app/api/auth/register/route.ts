import { prisma } from '@/lib/prisma'
import { hashOtp, hashPassword, generateOtp } from '@/lib/auth-server'
import { registerSchema } from '@/lib/schemas'
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

    // MongoDB equivalent:
    // users.findOne({ $or: [{ email }, { phone }] })
    //
    // Prisma equivalent:
    // Query the User model through prisma.user and use OR for multiple checks.
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: parsed.data.email },
          { phone: parsed.data.phone },
        ],
      },
    })

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message:
            existingUser.email === parsed.data.email
              ? 'Email already exists'
              : 'Phone number already exists',
          code: existingUser.email === parsed.data.email ? 'email_exists' : 'phone_exists',
        },
        { status: 400 }
      )
    }

    // MongoDB indexes like users.createIndex(...) move into schema.prisma:
    // email String @unique
    // phone String @unique
    //
    // MongoDB equivalent:
    // users.insertOne({ firstName, ..., passwordHash, role, _id })
    //
    // Prisma equivalent:
    // prisma.user.create({ data: ... })
    // Match the field names from model User: password, isAdmin, isVerified.
    const user = await prisma.user.create({
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        password: hashPassword(parsed.data.password),
        isAdmin: false,
        isVerified: false,
      },
    })

    const otp = generateOtp()
    // MongoDB equivalent:
    // otps.deleteMany({ email })
    // otps.insertOne({ email, otpHash, expiresAt, _id })
    //
    // Prisma equivalent:
    // Use prisma.otp against model Otp. id and createdAt are created by Prisma.
    await prisma.otp.deleteMany({
      where: { email: parsed.data.email },
    })
    await prisma.otp.create({
      data: {
        email: parsed.data.email,
        otpHash: hashOtp(otp),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
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
        // MongoDB returns result.insertedId; Prisma returns the created user row.
        userId: user.id,
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
