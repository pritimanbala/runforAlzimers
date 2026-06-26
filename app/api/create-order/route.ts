import Razorpay from 'razorpay'

export const runtime = 'nodejs'

type RazorpayError = Error & {
  statusCode?: number
  error?: {
    code?: string
    description?: string
  }
}

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured')
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const amount = Number(body.amount)
    const currency = typeof body.currency === 'string' ? body.currency : 'INR'
    const receipt =
      typeof body.receipt === 'string' && body.receipt.trim()
        ? body.receipt.trim()
        : `receipt_${Date.now()}`

    if (!Number.isInteger(amount) || amount < 100) {
      return Response.json(
        {
          success: false,
          message: 'Amount must be an integer of at least 100 paise',
          code: 'invalid_amount',
        },
        { status: 400 }
      )
    }

    const razorpay = getRazorpayClient()
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
    })

    return Response.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    const razorpayError = error as RazorpayError
    console.error('Razorpay order creation error:', razorpayError)

    if (razorpayError.statusCode === 401 || razorpayError.error?.code === 'BAD_REQUEST_ERROR') {
      return Response.json(
        {
          success: false,
          message: razorpayError.error?.description || 'Razorpay authentication failed',
          code: 'razorpay_auth_failed',
        },
        { status: 401 }
      )
    }

    return Response.json(
      {
        success: false,
        message: 'Unable to create Razorpay order',
        code: 'razorpay_order_failed',
      },
      { status: 500 }
    )
  }
}
