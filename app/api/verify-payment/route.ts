import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import { getBearerToken, verifyAuthToken } from '@/lib/auth-server'
import { getDb } from '@/lib/mongodb'
import { prisma } from '@/lib/prisma'
// import type { ProductDocument, PurchaseDocument } from '@/lib/schemas'

export const runtime = 'nodejs'

type PurchaseItemInput = {
  // i will receive this from the frontend
  productId: string
  quantity: number
}

function signaturesMatch(expectedSignature: string, receivedSignature: string) {
  const expected = Buffer.from(expectedSignature, 'hex') //here i have to check if the signatures match or not
  const received = Buffer.from(receivedSignature, 'hex')

  if (expected.length !== received.length) {
    //just a sanity check to see if they match or not before passsing it to crypto
    return false
  }

  return crypto.timingSafeEqual(expected, received)
}

export async function POST(request: Request) {
  //MAIN FUNCTION
  try {
    const body = await request.json()
    const {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: razorpaySignature,
      items,
      currency = 'INR',
    } = body

    if (
      typeof paymentId !== 'string' ||
      typeof orderId !== 'string' ||
      typeof razorpaySignature !== 'string'
    ) {
      return Response.json(
        {
          success: false,
          message: 'Payment id, order id, and signature are required',
          code: 'missing_payment_fields',
        },
        { status: 400 }
      )
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keySecret) {
      throw new Error('Razorpay secret is not configured')
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    if (!signaturesMatch(expectedSignature, razorpaySignature)) {
      return Response.json(
        {
          success: false,
          message: 'Payment signature verification failed',
          code: 'signature_mismatch',
        },
        { status: 400 }
      )
    }

    const token = getBearerToken(request)
    const payload = token ? verifyAuthToken(token) : null

    if (payload && ObjectId.isValid(payload.sub) && Array.isArray(items)) {
      const requestedItems = items
        .map((item): PurchaseItemInput | null => {
          if (
            !item ||
            typeof item.productId !== 'string' ||
            typeof item.quantity !== 'number' ||
            !ObjectId.isValid(item.productId) ||
            item.quantity < 1
          ) {
            return null
          }

          return {
            productId: item.productId,
            quantity: Math.floor(item.quantity),
          }
        })
        .filter((item): item is PurchaseItemInput => Boolean(item))

      if (requestedItems.length > 0) {
        // const db = await getDb()
        const productIds = requestedItems.map((item) => new ObjectId(item.productId))
        // const products = await db //finding the product from products
        //   .collection<ProductDocument>('products')
        //   .find({ _id: { $in: productIds }, isActive: true })
        //   .toArray()
        const products = await prisma.product.findMany({
          where: {
            id: productIds,
            isActive: true,
          },
        })

        const productsById = new Map(products.map((product) => [product.id.toString(), product]))
        const purchaseItems = requestedItems
          .map((item) => {
            const product = productsById.get(item.productId)

            if (!product) {
              return null
            }

            return {
              productId: item.productId,
              name: product.name,
              type: product.category,
              price: product.price,
              quantity: item.quantity,
            }
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item))

        if (purchaseItems.length === 0) {
          return Response.json(
            {
              success: false,
              message: 'No valid products were found for this purchase',
              code: 'invalid_products',
            },
            { status: 400 }
          )
        }

        // const purchases = db.collection<PurchaseDocument>('purchases')

        const purchases = await prisma.purchase.findMany()
        const amount = purchaseItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

        await prisma.purchase.updateMany({
          where: {
            paymentId: paymentId,
          },
          data: {
            userId: payload.sub,
            userEmail: payload.email,
            orderId: orderId,
            paymentId: paymentId,
            items: purchaseItems,
            amount: amount,
            currency: typeof currency === 'string' ? currency : 'INR',
            status: 'completed',
            createdAt: new Date(),
          },
        })
      }
    }

    return Response.json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: paymentId,
      order_id: orderId,
    })
  } catch (error) {
    console.error('Payment verification error:', error)

    return Response.json(
      {
        success: false,
        message: 'Unable to verify payment',
        code: 'payment_verification_failed',
      },
      { status: 500 }
    )
  }
}
