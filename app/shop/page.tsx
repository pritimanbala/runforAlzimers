'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CreditCard, ShoppingCart } from 'lucide-react'

interface Product {
  //for creating product
  id: string
  name: string
  description: string
  price: number
  category: 'pass' | 'merchandise'
  image?: string
}

interface RazorpayPaymentResponse {
  //for storing payment response
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayFailureResponse {
  //failure handling
  error?: {
    code?: string
    description?: string
    reason?: string
  }
}

interface RazorpayOptions {
  //options for storing the order
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayPaymentResponse) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
}

interface RazorpayCheckout {
  //checkout
  open: () => void
  on: (event: 'payment.failed', callback: (response: RazorpayFailureResponse) => void) => void
}

declare global {
  //i am storing a global instance so that if there is a reload, then in the server, it will be stored
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout
  }
}

export default function ShopPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [apiError, setApiError] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [cart, setCart] = useState<Map<string, number>>(new Map()) //this var stores a new objecct of the map class

  useEffect(() => {
    //main function for fetching products
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/shop/products')

        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }

        const data = await response.json()
        setProducts(data.products || []) //setting the data in the state variable there
      } catch (error) {
        console.error('Products fetch error:', error)
        setApiError('Unable to load store items right now.')
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts() // calling the function
  }, [])

  const addToCart = (productId: string) => {
    //adding things to cart
    const newCart = new Map(cart)
    newCart.set(productId, (newCart.get(productId) || 0) + 1)
    setCart(newCart)
    setCheckoutError('') // for the instance if there is a checkout message, i will have to send that
    setCheckoutMessage('')
  }

  const removeFromCart = (productId: string) => {
    //removing things from the cart by creating a new variable
    const newCart = new Map(cart)
    const quantity = newCart.get(productId) || 0
    if (quantity > 1) {
      //here by using the map functions, i can check if i have added more than one product, i have to remove it. so thats why i have to kick the other ones out
      newCart.set(productId, quantity - 1)
    } else {
      newCart.delete(productId)
    }
    setCart(newCart)
  }

  const calculateTotal = () => {
    // total price from the cart
    let total = 0
    cart.forEach((quantity, productId) => {
      const product = products.find((p) => p.id === productId)
      if (product) {
        total += product.price * quantity
      }
    })
    return total
  }

  const verifyPayment = async (paymentResponse: RazorpayPaymentResponse) => {
    //checking payment from the response
    const token = localStorage.getItem('authToken')
    const items = Array.from(cart.entries())
      .map(([productId, quantity]) => {
        //here i mave created a array cart where i am clubbing the product id and quantity
        const product = products.find((p) => p.id === productId)

        if (!product) {
          return null
        }

        return {
          productId,
          quantity,
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))

    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...paymentResponse,
        items,
        currency: 'INR',
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Payment verification failed')
    }

    setCart(new Map())
    router.push('/purchases')
    setCheckoutMessage('Payment verified successfully. Your purchase has been saved.')
  }

  const handleCheckout = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
      return
    }

    if (cart.size === 0) {
      setCheckoutError('Add at least one item before checkout.')
      return
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      setCheckoutError('Razorpay key is missing. Please check environment setup.')
      return
    }

    if (!window.Razorpay) {
      setCheckoutError('Razorpay checkout is still loading.... Please try again in a moment.')
      return
    }

    const amount = Math.round(calculateTotal() * 100)

    try {
      setIsCheckingOut(true)
      setCheckoutError('')
      setCheckoutMessage('')

      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          receipt: `shop_${Date.now()}`,
        }),
      })

      const order = await response.json()

      if (!response.ok || !order.order_id) {
        throw new Error(order.message || 'Unable to create payment order')
      }

      const checkout = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Run for Alzheimer's",
        description: 'Event shop order',
        order_id: order.order_id,
        handler: async (paymentResponse) => {
          try {
            await verifyPayment(paymentResponse)
          } catch (error) {
            console.error('Payment verification error:', error)
            setCheckoutError(error instanceof Error ? error.message : 'Payment verification failed')
          } finally {
            setIsCheckingOut(false)
          }
        },
        notes: {
          source: 'event_shop',
        },
        theme: {
          color: '#9333ea',
        },
        modal: {
          ondismiss: () => {
            setIsCheckingOut(false)
            setCheckoutMessage('Again, I am not a Fraud, Please do the f***in payment')
          },
        },
      })

      checkout.on('payment.failed', (failureResponse) => {
        setIsCheckingOut(false)
        setCheckoutError(
          failureResponse.error?.description ||
            failureResponse.error?.reason ||
            'Payment failed. Please try again.'
        )
      })

      checkout.open()
    } catch (error) {
      console.error('Checkout error:', error)
      setIsCheckingOut(false)
      setCheckoutError(
        error instanceof Error ? error.message : 'Checkout failed. Please try again.'
      )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <nav className="bg-white border-b border-purple-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-purple-600 cursor-pointer">
                Run for Alzheimer&apos;s
              </h1>
            </Link>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold text-purple-900 mb-8">Event Shop</h2>

            {apiError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
                <p className="text-yellow-800">{apiError}</p>
              </div>
            )}

            {products.length === 0 && !apiError && (
              <div className="rounded-2xl border border-purple-100 bg-white p-12 text-center shadow-sm">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  No items available in the store
                </h3>
                <p className="text-gray-600">
                  Store products will appear here after an admin adds them.
                </p>
              </div>
            )}

            {products.length > 0 && (
              <>
                <div className="mb-12">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-6">
                    Event Passes
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {products
                      .filter((p) => p.category === 'pass')
                      .map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-xl shadow-md border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all p-6"
                        >
                          <h4 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h4>
                          <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-3xl font-bold text-purple-600">
                              INR {product.price.toFixed(2)}
                            </span>
                            <Button
                              onClick={() => addToCart(product.id)}
                              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-6">
                    Merchandise
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {products
                      .filter((p) => p.category === 'merchandise')
                      .map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-xl shadow-md border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all p-6"
                        >
                          <h4 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h4>
                          <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-3xl font-bold text-purple-600">
                              INR {product.price.toFixed(2)}
                            </span>
                            <Button
                              onClick={() => addToCart(product.id)}
                              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-2">
                <ShoppingCart size={24} className="text-purple-600" />
                Order Summary
              </h3>

              {cart.size === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {Array.from(cart.entries()).map(([productId, quantity]) => {
                    const product = products.find((p) => p.id === productId)
                    return (
                      <div key={productId} className="border-b border-purple-100 pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{product?.name}</p>
                            <p className="text-sm text-gray-600">
                              INR {product?.price.toFixed(2)} x {quantity}
                            </p>
                          </div>
                          <button
                            onClick={() => removeFromCart(productId)}
                            className="text-red-600 hover:text-red-800 text-xs font-bold"
                            aria-label={`Remove ${product?.name || 'item'} from cart`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  <div className="border-t-2 border-purple-100 pt-4 bg-purple-50 rounded-lg p-4 -mx-6 px-6 mt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total:</span>
                      <span className="text-3xl font-bold text-purple-600">
                        INR {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {checkoutError && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm text-red-700">{checkoutError}</p>
                    </div>
                  )}

                  {checkoutMessage && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-sm text-green-700">{checkoutMessage}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3"
                  >
                    <CreditCard size={18} />
                    {isCheckingOut ? 'Opening Checkout...' : 'Checkout Now'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
