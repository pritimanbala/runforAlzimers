// import { ObjectId } from 'mongodb'
import { getBearerToken, verifyAuthToken } from '@/lib/auth-server'
import { getDb } from '@/lib/mongodb'
import { prisma } from '@/lib/prisma'
// import type { PurchaseDocument } from '@/lib/schemas'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const token = getBearerToken(request)
    console.log(verifyAuthToken(token))
    const payload = token ? verifyAuthToken(token) : null
    // console.log(ObjectId.isValid(payload.sub))
    if (!payload) {
      return Response.json(
        { success: false, message: 'Authentication is required' },
        { status: 401 }
      )
    }

    // const db = await getDb()
    // const purchases = await db
    //   .collection<PurchaseDocument>('purchases')
    //   .find({ userId: new ObjectId(payload.sub) })
    //   .sort({ createdAt: -1 })
    //   .toArray()

    const purchases = await prisma.purchase.findMany({
      where: {
        userId: payload.sub,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    if (purchases) {
      return Response.json({
        success: true,
        purchases: purchases.flatMap((purchase) =>
          purchase.items.map((item) => ({
            id: `${purchase.orderId}_${item.productId}`,
            type: item.type,
            name: item.name,
            price: item.price,
            date: purchase.createdAt.toISOString(),
            quantity: item.quantity,
            status: purchase.status,
            orderId: purchase.orderId,
            paymentId: purchase.paymentId,
          }))
        ),
      })
    }
  } catch (error) {
    console.error('Purchases fetch error:', error)

    return Response.json({ success: false, message: 'Unable to load purchases' }, { status: 500 })
  }
}
