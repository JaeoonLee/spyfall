// server/utils/requireAuth.ts
import jwt from 'jsonwebtoken'

export function requireAuth(event: any) {
  const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
  const secret = process.env.JWT_SECRET

  if (!token || !secret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  try {
    return jwt.verify(token, secret)
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid token' })
  }
}
