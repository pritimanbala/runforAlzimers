import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import type { PublicUser } from './schemas'

type AuthTokenPayload = {
  sub: string
  email: string
  role: PublicUser['role']
  exp: number
}

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error('Missing JWT_SECRET environment variable')
  }

  return jwtSecret
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url')
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':')

  if (!salt || !hash) {
    return false
  }

  const passwordHash = Buffer.from(scryptSync(password, salt, 64).toString('hex'), 'hex')
  const storedPasswordHash = Buffer.from(hash, 'hex')

  if (passwordHash.length !== storedPasswordHash.length) {
    return false
  }

  return timingSafeEqual(passwordHash, storedPasswordHash)
}

export function hashOtp(otp: string) {
  return createHmac('sha256', getJwtSecret()).update(otp).digest('hex')
}

export function signAuthToken(user: PublicUser) {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64Url(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    })
  )
  const signature = createHmac('sha256', getJwtSecret())
    .update(`${header}.${payload}`)
    .digest('base64url')

  return `${header}.${payload}.${signature}`
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  const [header, payload, signature] = token.split('.')

  if (!header || !payload || !signature) {
    return null
  }

  const expectedSignature = createHmac('sha256', getJwtSecret())
    .update(`${header}.${payload}`)
    .digest('base64url')

  const expected = Buffer.from(expectedSignature)
  const received = Buffer.from(signature)

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AuthTokenPayload

    if (!parsed.sub || !parsed.email || !parsed.role || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization')

  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  return authorization.slice('Bearer '.length)
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
