import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const secretKey = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'STUDENT' | 'PROFESSOR'
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as unknown as JWTPayload
  } catch (error) {
    return null
  }
}

export async function getCurrentUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  return payload
}

export function requireAuth(handler: (req: NextRequest, user: JWTPayload) => Promise<Response>) {
  return async (req: NextRequest) => {
    const user = await getCurrentUser(req)

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    return handler(req, user)
  }
}

export function requireRole(allowedRoles: ('ADMIN' | 'STUDENT' | 'PROFESSOR')[]) {
  return (handler: (req: NextRequest, user: JWTPayload) => Promise<Response>) => {
    return async (req: NextRequest) => {
      const user = await getCurrentUser(req)

      if (!user) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }

      if (!allowedRoles.includes(user.role)) {
        return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
      }

      return handler(req, user)
    }
  }
}
