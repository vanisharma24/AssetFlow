import { Router, Request, Response } from 'express'
import { db } from '../db'

const router = Router()

// GET /api/activities/logs - List all system activity logs
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const logs = await db.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 100 // cap to last 100 logs
    })
    res.json(logs)
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    res.status(500).json({ error: 'Failed to fetch activity logs' })
  }
})

// GET /api/activities/notifications - List all notifications for a specific user
router.get('/notifications', async (req: Request, res: Response) => {
  const { userId } = req.query

  if (!userId) {
    res.status(400).json({ error: 'Required query parameter: userId' })
    return
  }

  try {
    const notifications = await db.notification.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: 'desc' }
    })
    res.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

// POST /api/activities/notifications/:id/read - Mark notification as read
router.post('/notifications/:id/read', async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const notification = await db.notification.findUnique({ where: { id } })
    if (!notification) {
      res.status(404).json({ error: 'Notification not found' })
      return
    }

    const updated = await db.notification.update({
      where: { id },
      data: { read: true }
    })

    res.json(updated)
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ error: 'Failed to update notification status' })
  }
})

export default router
