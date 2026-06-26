import { MongoClient } from 'mongodb'

const dbName = process.env.MONGODB_DB || 'run_for_alzheimers'

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>
}

function getClientPromise() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable')
  }

  const clientPromise =
    globalForMongo.mongoClientPromise ?? new MongoClient(uri).connect()

  if (process.env.NODE_ENV !== 'production') {
    globalForMongo.mongoClientPromise = clientPromise
  }

  return clientPromise
}

export async function getDb() {
  const client = await getClientPromise()
  return client.db(dbName)
}
