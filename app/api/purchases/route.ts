import { ObjectId } from 'mongodb'
import { getBearerToken, verifyAuthToken } from '@/lib/auth-server'
import { getDb } from '@/lib/mongodb'
import type { PurchaseDocument } from '@/lib/schemas'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const token = getBearerToken(request)
    const payload = token ? verifyAuthToken(token) : null

    if (!payload || !ObjectId.isValid(payload.sub)) {
      return Response.json(
        { success: false, message: 'Authentication is required' },
        { status: 401 }
      )
    }

    const db = await getDb()
    const purchases = await db
      .collection<PurchaseDocument>('purchases')
      .find({ userId: new ObjectId(payload.sub) })
      .sort({ createdAt: -1 })
      .toArray()

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
  } catch (error) {
    console.error('Purchases fetch error:', error)

    return Response.json(
      { success: false, message: 'Unable to load purchases' },
      { status: 500 }
    )
  }
}
