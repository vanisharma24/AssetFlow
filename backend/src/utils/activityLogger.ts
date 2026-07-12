import { db } from '../db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-12345'

/**
 * Helper to decode token and return user ID.
 */
function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET)
}

/**
 * Extracts the acting user ID from request headers or returns a fallback.
 */
export async function getActorFromRequest(req: any): Promise<string> {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (token) {
    try {
      const payload = verifyToken(token)
      if (payload && payload.sub) {
        return payload.sub
      }
    } catch (e) {}
  }
  // Fallback to first user in database
  const user = await db.user.findFirst()
  return user ? user.id : 'system'
}

/**
 * Inserts a system activity log record.
 */
export async function logActivity(actorUserId: string, action: string, entityType: string, entityId: string) {
  try {
    const userExists = await db.user.findUnique({ where: { id: actorUserId } })
    if (!userExists) {
      console.warn(`[logActivity] Actor User ${actorUserId} not found. Skipping log.`)
      return
    }

    await db.activityLog.create({
      data: {
        actorUserId,
        action,
        entityType,
        entityId
      }
    })
  } catch (error) {
    console.error('Failed to log system activity:', error)
  }
}

/**
 * Inserts a user notification record.
 */
export async function createNotification(userId: string, type: string, message: string) {
  try {
    const userExists = await db.user.findUnique({ where: { id: userId } })
    if (!userExists) {
      console.warn(`[createNotification] Target User ${userId} not found. Skipping notification.`)
      return
    }

    await db.notification.create({
      data: {
        userId,
        type,
        message,
        read: false
      }
    })
  } catch (error) {
    console.error('Failed to create user notification:', error)
  }
}
