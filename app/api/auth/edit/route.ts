import { getDb } from '@/lib/mongodb'
// import { loginSchema, toPublicUser, type UserDocument } from '@/lib/schemas'
// import { signAuthToken, verifyPassword } from '@/lib/auth-server'
import { ObjectId } from 'mongodb'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log(body)

    // const db = await getDb()
    // const user = await db.collection<UserDocument>('users').updateOne(
    //   { _id: new ObjectId(body.id) },
    //   {
    //     $set: {
    //       email: body.email,
    //       firstName: body.firstName,
    //       lastName: body.lastName,
    //       phone: body.phone,
    //     },
    //   }
    // )

    //     id         String   @id @default(cuid())
    // firstName  String
    // lastName   String
    // email      String   @unique
    // phone      String   @unique
    // password   String
    // isAdmin    Boolean  @default(false)
    // isVerified Boolean  @default(false)
    // createdAt  DateTime @default(now())
    // updatedAt  DateTime @updatedAt

    const user = await prisma.user.update({
      where: { id: body.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        email: body.email,
      },
    })

    return Response.json({
      success: true,
      message: user,
      body: body,
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
