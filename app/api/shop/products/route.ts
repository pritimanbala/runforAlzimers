import { getDb } from '@/lib/mongodb'
import type { ProductDocument } from '@/lib/schemas'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const db = await getDb()
    const products = await db
      .collection<ProductDocument>('products')
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray()

    return Response.json({
      success: true,
      products: products.map((product) => ({
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
      })),
    })
  } catch (error) {
    console.error('Products fetch error:', error)

    return Response.json(
      { success: false, message: 'Unable to load store products' },
      { status: 500 }
    )
  }
}
