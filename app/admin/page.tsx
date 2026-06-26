'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Package, Plus, Search, ShoppingBag, Ticket, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Purchase = {
  productName: string
  productId: string
  type: 'pass' | 'merchandise'
  quantity: number
  price: number
  orderId: string
  paymentId: string
  purchasedAt: string
}

type Registration = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  isVerified: boolean
  registeredAt: string
  purchases: Purchase[]
}

type DashboardSummary = {
  totalRegistrations: number
  verifiedUsers: number
  totalOrders: number
  totalMerchItems: number
  totalRevenue: number
}

type Product = {
  id: string
  name: string
  description: string
  price: number
  category: 'pass' | 'merchandise'
  isActive: boolean
  createdAt: string
}

const emptySummary: DashboardSummary = {
  totalRegistrations: 0,
  verifiedUsers: 0,
  totalOrders: 0,
  totalMerchItems: 0,
  totalRevenue: 0,
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export default function AdminDashboardPage() {
  const router = useRouter()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [error, setError] = useState('')
  const [productMessage, setProductMessage] = useState('')
  const [productError, setProductError] = useState('')
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'merchandise' as Product['category'],
  })

  const adminHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return token ? { Authorization: `Bearer ${token}` } : null
  }

  const loadAdminData = async () => {
    const headers = adminHeaders()

    if (!headers) {
      router.push('/admin/login')
      return
    }

    try {
      setError('')
      const [registrationsResponse, productsResponse] = await Promise.all([
        fetch('/api/admin/registrations', { headers }),
        fetch('/api/admin/products', { headers }),
      ])
      const registrationsData = await registrationsResponse.json()
      const productsData = await productsResponse.json()

      if (!registrationsResponse.ok || !registrationsData.success) {
        localStorage.removeItem('adminToken')
        router.push('/admin/login')
        return
      }

      if (!productsResponse.ok || !productsData.success) {
        throw new Error(productsData.message || 'Unable to load products')
      }

      setRegistrations(registrationsData.registrations)
      setSummary(registrationsData.summary)
      setProducts(productsData.products)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load admin dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const filteredRegistrations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
      return registrations
    }

    return registrations.filter((registration) => {
      const fullName = `${registration.firstName} ${registration.lastName}`.toLowerCase()
      return (
        fullName.includes(query) ||
        registration.email.toLowerCase().includes(query) ||
        registration.phone.toLowerCase().includes(query)
      )
    })
  }, [registrations, searchTerm])

  const recentMerch = useMemo(() => {
    return registrations
      .flatMap((registration) =>
        registration.purchases
          .filter((purchase) => purchase.type === 'merchandise')
          .map((purchase) => ({
            ...purchase,
            buyerName: `${registration.firstName} ${registration.lastName}`,
            buyerEmail: registration.email,
          }))
      )
      .sort(
        (first, second) =>
          new Date(second.purchasedAt).getTime() - new Date(first.purchasedAt).getTime()
      )
      .slice(0, 8)
  }, [registrations])

  const handleAddProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const headers = adminHeaders()

    if (!headers) {
      router.push('/admin/login')
      return
    }

    setIsAddingProduct(true)
    setProductError('')
    setProductMessage('')

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productForm),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        setProductError(data.message || 'Unable to add product')
        return
      }

      setProducts((currentProducts) => [data.product, ...currentProducts])
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: 'merchandise',
      })
      setProductMessage('Product added to the store.')
    } catch {
      setProductError('Unable to connect to the server')
    } finally {
      setIsAddingProduct(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />
          <p className="text-sm text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="text-xl font-bold text-purple-700">
            Admin Dashboard
          </Link>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            <LogOut />
            Logout
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Event admin</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage store products, registrations, completed orders, and merch purchases.
            </p>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, email, or phone"
              className="pl-9"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard icon={Users} label="Registrations" value={summary.totalRegistrations} />
          <MetricCard icon={Ticket} label="Verified" value={summary.verifiedUsers} />
          <MetricCard icon={ShoppingBag} label="Orders" value={summary.totalOrders} />
          <MetricCard icon={Package} label="Merch items" value={summary.totalMerchItems} />
          <MetricCard
            icon={ShoppingBag}
            label="Revenue"
            value={currencyFormatter.format(summary.totalRevenue)}
          />
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-950">Add store product</h2>
            <p className="mt-1 text-sm text-slate-500">
              Products are saved in MongoDB in the products collection.
            </p>

            <form onSubmit={handleAddProduct} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                <Input
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm((form) => ({ ...form, name: event.target.value }))
                  }
                  placeholder="Event T-Shirt"
                  disabled={isAddingProduct}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <Input
                  value={productForm.description}
                  onChange={(event) =>
                    setProductForm((form) => ({ ...form, description: event.target.value }))
                  }
                  placeholder="Official fundraiser merchandise"
                  disabled={isAddingProduct}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Price in INR
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm((form) => ({ ...form, price: event.target.value }))
                    }
                    placeholder="499"
                    disabled={isAddingProduct}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(event) =>
                      setProductForm((form) => ({
                        ...form,
                        category: event.target.value as Product['category'],
                      }))
                    }
                    disabled={isAddingProduct}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="merchandise">Merchandise</option>
                    <option value="pass">Event pass</option>
                  </select>
                </div>
              </div>

              {productError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {productError}
                </div>
              )}
              {productMessage && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  {productMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isAddingProduct}
                className="h-10 w-full bg-purple-700 text-white hover:bg-purple-800"
              >
                <Plus />
                {isAddingProduct ? 'Adding product...' : 'Add product'}
              </Button>
            </form>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-950">Store products</h2>
              <p className="text-sm text-slate-500">
                {products.length === 0
                  ? 'No items available in the store.'
                  : `${products.length} item${products.length === 1 ? '' : 's'} in the store`}
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-950">{product.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{product.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-purple-700">
                          {currencyFormatter.format(product.price)}
                        </p>
                        <p className="mt-1 text-xs uppercase text-slate-500">
                          {product.category === 'pass' ? 'Pass' : 'Merch'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                  Add a product to make it visible in the shop.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-950">Registrations</h2>
              <p className="text-sm text-slate-500">
                {filteredRegistrations.length} participant
                {filteredRegistrations.length === 1 ? '' : 's'} shown
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Participant</th>
                    <th className="px-5 py-3 font-semibold">Phone</th>
                    <th className="px-5 py-3 font-semibold">Registered</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Orders</th>
                    <th className="px-5 py-3 font-semibold">Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map((registration) => {
                    const totalSpent = registration.purchases.reduce(
                      (sum, purchase) => sum + purchase.price * purchase.quantity,
                      0
                    )
                    const orderCount = new Set(
                      registration.purchases.map((purchase) => purchase.orderId)
                    ).size

                    return (
                      <tr key={registration.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-950">
                            {registration.firstName} {registration.lastName}
                          </div>
                          <div className="text-xs text-slate-500">{registration.email}</div>
                        </td>
                        <td className="px-5 py-4 text-slate-700">{registration.phone}</td>
                        <td className="px-5 py-4 text-slate-700">
                          {new Date(registration.registeredAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              registration.isVerified
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {registration.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-700">{orderCount}</td>
                        <td className="px-5 py-4 font-medium text-slate-950">
                          {currencyFormatter.format(totalSpent)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filteredRegistrations.length === 0 && (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                No registrations match your search.
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-950">Recent merch bought</h2>
              <p className="text-sm text-slate-500">Latest completed merchandise items</p>
            </div>
            <div className="divide-y divide-slate-100">
              {recentMerch.length > 0 ? (
                recentMerch.map((purchase) => (
                  <div key={`${purchase.paymentId}-${purchase.productId}`} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-950">{purchase.productName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {purchase.buyerName} - {purchase.buyerEmail}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-purple-700">
                        x{purchase.quantity}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {currencyFormatter.format(purchase.price * purchase.quantity)} on{' '}
                      {new Date(purchase.purchasedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="px-5 py-12 text-center text-sm text-slate-500">
                  No merchandise purchases yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: number | string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  )
}
