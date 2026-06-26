'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Purchase {
  id: string
  type: 'pass' | 'merchandise'
  name: string
  price: number
  date: string
  quantity: number
  status: 'completed' | 'pending'
  orderId: string
  paymentId: string
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export default function PurchasesPage() {
  const router = useRouter()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPurchases = async () => {
      const token = localStorage.getItem('authToken')

      if (!token) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch('/api/purchases', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()

        if (!response.ok || !data.success) {
          setError(data.message || 'Unable to load purchases')
          return
        }

        setPurchases(data.purchases)
      } catch {
        setError('Unable to connect to the server')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPurchases()
  }, [router])

  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.price * purchase.quantity, 0)
  const totalItems = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
          <p className="text-gray-600">Loading purchases...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <nav className="sticky top-0 z-50 border-b border-purple-100 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-purple-600">Run for Alzheimer&apos;s</h1>
          <Link href="/dashboard">
            <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="mb-2 text-4xl font-bold text-purple-900">My Purchases</h2>
          <p className="text-gray-600">View event passes and merchandise saved from completed payments.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {purchases.length === 0 ? (
          <div className="rounded-2xl border border-purple-100 bg-white p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">You have not made any purchases yet</h3>
            <p className="mb-6 text-gray-600">Completed orders will appear here after checkout.</p>
            <Link href="/shop">
              <Button className="bg-purple-700 text-white hover:bg-purple-800">Browse the Shop</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <SummaryCard label="Total Items" value={totalItems} />
              <SummaryCard
                label="Completed Orders"
                value={new Set(purchases.map((purchase) => purchase.orderId)).size}
              />
              <SummaryCard label="Total Spent" value={currencyFormatter.format(totalSpent)} />
            </div>

            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="rounded-xl border border-purple-100 bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{purchase.name}</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {new Date(purchase.date).toLocaleDateString()} - Quantity {purchase.quantity}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">Order {purchase.orderId}</p>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {currencyFormatter.format(purchase.price * purchase.quantity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currencyFormatter.format(purchase.price)} each
                      </p>
                      <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {purchase.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-sm">
      <p className="mb-2 text-sm font-semibold uppercase text-purple-600">{label}</p>
      <p className="text-3xl font-bold text-purple-900">{value}</p>
    </div>
  )
}
