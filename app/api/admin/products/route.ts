import { ObjectId } from 'mongodb'
import { getBearerToken, verifyAuthToken } from '@/lib/auth-server'
import { getDb } from '@/lib/mongodb'
import { productSchema, type ProductDocument } from '@/lib/schemas'

export const runtime = 'nodejs'

function requireAdmin(request: Request) {
  const token = getBearerToken(request)
  const payload = token ? verifyAuthToken(token) : null
  return payload?.role === 'admin' ? payload : null
}

function serializeProduct(product: ProductDocument) {
  return {
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
  }
}

export async function GET(request: Request) {
  try {
    if (!requireAdmin(request)) {
      return Response.json(
        { success: false, message: 'Admin authentication is required' },
        { status: 401 }
      )
    }

    const db = await getDb()
    const products = await db
      .collection<ProductDocument>('products')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return Response.json({
      success: true,
      products: products.map(serializeProduct),
    })
  } catch (error) {
    console.error('Admin products fetch error:', error)

    return Response.json(
      { success: false, message: 'Unable to load products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    if (!requireAdmin(request)) {
      return Response.json(
        { success: false, message: 'Admin authentication is required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = productSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid product details',
        },
        { status: 400 }
      )
    }

    const db = await getDb()
    const now = new Date()
    const product: ProductDocument = {
      _id: new ObjectId(),
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      category: parsed.data.category,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    await db.collection<ProductDocument>('products').insertOne(product)

    return Response.json(
      {
        success: true,
        message: 'Product added successfully',
        product: serializeProduct(product),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin product create error:', error)

    return Response.json(
      { success: false, message: 'Unable to add product' },
      { status: 500 }
    )
  }
}
