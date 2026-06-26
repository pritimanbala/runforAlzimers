import { getBearerToken, verifyAuthToken } from '@/lib/auth-server'
import { getDb } from '@/lib/mongodb'
import type { PurchaseDocument, UserDocument } from '@/lib/schemas'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const token = getBearerToken(request)
    const payload = token ? verifyAuthToken(token) : null

    if (!payload || payload.role !== 'admin') {
      return Response.json(
        { success: false, message: 'Admin authentication is required' },
        { status: 401 }
      )
    }

    const db = await getDb()
    const users = await db
      .collection<UserDocument>('users')
      .find({ role: 'participant' })
      .sort({ createdAt: -1 })
      .toArray()

    const userIds = users.map((user) => user._id)
    const purchases = userIds.length
      ? await db
          .collection<PurchaseDocument>('purchases')
          .find({ userId: { $in: userIds } })
          .sort({ createdAt: -1 })
          .toArray()
      : []

    const purchasesByUserId = purchases.reduce<Record<string, PurchaseDocument[]>>(
      (groups, purchase) => {
        const key = purchase.userId.toString()
        groups[key] = [...(groups[key] || []), purchase]
        return groups
      },
      {}
    )

    const registrations = users.map((user) => {
      const userPurchases = purchasesByUserId[user._id.toString()] || []
      const flattenedPurchases = userPurchases.flatMap((purchase) =>
        purchase.items.map((item) => ({
          productName: item.name,
          productId: item.productId,
          type: item.type,
          quantity: item.quantity,
          price: item.price,
          orderId: purchase.orderId,
          paymentId: purchase.paymentId,
          purchasedAt: purchase.createdAt.toISOString(),
        }))
      )

      return {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        registeredAt: user.createdAt.toISOString(),
        purchases: flattenedPurchases,
      }
    })

    const merchItems = purchases.flatMap((purchase) =>
      purchase.items.filter((item) => item.type === 'merchandise')
    )
    const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.amount, 0)

    return Response.json({
      success: true,
      registrations,
      summary: {
        totalRegistrations: registrations.length,
        verifiedUsers: registrations.filter((registration) => registration.isVerified).length,
        totalOrders: purchases.length,
        totalMerchItems: merchItems.reduce((sum, item) => sum + item.quantity, 0),
        totalRevenue,
      },
    })
  } catch (error) {
    console.error('Admin registrations error:', error)

    return Response.json(
      { success: false, message: 'Unable to load admin dashboard' },
      { status: 500 }
    )
  }
}
