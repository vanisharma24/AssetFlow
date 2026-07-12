import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export type AuthTokenPayload = {
  sub: string
  email: string
  role: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'assetflow-dev-secret'

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

export const signToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, JWT_SECRET)

  if (typeof decoded === 'string' || !decoded.sub || !decoded.email || !decoded.role) {
    throw new Error('Invalid token payload')
  }

  return decoded as AuthTokenPayload
}
