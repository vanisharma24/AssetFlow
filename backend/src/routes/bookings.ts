import { Router, Request, Response } from 'express'
import { db } from '../db'
import { logActivity, createNotification, getActorFromRequest } from '../utils/activityLogger'

const router = Router()

// GET /api/bookings - List all bookings
router.get('/', async (req: Request, res: Response) => {
  const { assetId, bookedBy, status } = req.query
  const where: any = {}

  if (assetId) {
    where.assetId = assetId
  }
  if (bookedBy) {
    where.bookedBy = bookedBy
  }
  if (status) {
    where.status = status
  }

  try {
    const bookings = await db.booking.findMany({
      where,
      include: {
        asset: {
          select: {
            id: true,
            assetTag: true,
            name: true,
            status: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    })
    res.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    res.status(500).json({ error: 'Failed to fetch bookings' })
  }
})

import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth'

// POST /api/bookings - Create a new booking with overlap validation
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { assetId, startTime, endTime } = req.body
  const bookedBy = req.body.bookedBy || req.user?.sub

  if (!assetId || !bookedBy || !startTime || !endTime) {
    res.status(400).json({ error: 'Required fields: assetId, bookedBy, startTime, endTime' })
    return
  }

  const start = new Date(startTime)
  const end = new Date(endTime)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).json({ error: 'Invalid date formats for startTime or endTime' })
    return
  }

  if (start >= end) {
    res.status(400).json({ error: 'startTime must be before endTime' })
    return
  }

  try {
    // 1. Verify the asset exists and is bookable
    const asset = await db.asset.findUnique({
      where: { id: assetId }
    })

    if (!asset) {
      res.status(404).json({ error: 'Asset not found' })
      return
    }

    if (!asset.isBookable) {
      res.status(400).json({ error: 'Asset is not marked as bookable' })
      return
    }

    // 2. Strict Overlap Check: (newStart < existingEnd) AND (newEnd > existingStart)
    const overlappingBooking = await db.booking.findFirst({
      where: {
        assetId,
        status: { in: ['Upcoming', 'Ongoing'] },
        startTime: { lt: end },
        endTime: { gt: start }
      }
    })

    if (overlappingBooking) {
      res.status(409).json({
        error: 'BookingOverlap',
        message: 'This booking overlaps with an existing reservation.',
        overlap: {
          id: overlappingBooking.id,
          startTime: overlappingBooking.startTime,
          endTime: overlappingBooking.endTime,
          bookedBy: overlappingBooking.bookedBy
        }
      })
      return
    }

    // 3. Create the booking inside a transaction
    const now = new Date()
    const isCurrentlyActive = start <= now && end >= now

    const booking = await db.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          assetId,
          bookedBy,
          startTime: start,
          endTime: end,
          status: isCurrentlyActive ? 'Ongoing' : 'Upcoming'
        }
      })

      // If booking is active right now, reserve the asset
      if (isCurrentlyActive) {
        await tx.asset.update({
          where: { id: assetId },
          data: { status: 'Reserved' }
        })
      }

      return newBooking
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Create Booking', 'Booking', booking.id)
    await createNotification(bookedBy, 'Booking', `Your booking for asset has been confirmed from ${start.toLocaleString()} to ${end.toLocaleString()}.`)

    res.status(201).json(booking)
  } catch (error) {
    console.error('Error creating booking:', error)
    res.status(500).json({ error: 'Failed to create booking' })
  }
})

// POST /api/bookings/:id/cancel - Cancel an active or upcoming booking
router.post('/:id/cancel', async (req: Request, res: Response) => {
  const id = req.params.id as string

  try {
    const booking = await db.booking.findUnique({
      where: { id }
    })

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' })
      return
    }

    if (booking.status === 'Cancelled' || booking.status === 'Completed') {
      res.status(400).json({ error: `Cannot cancel a booking that is already ${booking.status}` })
      return
    }

    // Cancel booking and release asset in a transaction
    const cancelledBooking = await db.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: { status: 'Cancelled' }
      })

      // If the booking was currently active (Ongoing), flip the asset back to Available
      if (booking.status === 'Ongoing') {
        await tx.asset.update({
          where: { id: booking.assetId },
          data: { status: 'Available' }
        })
      }

      return updatedBooking
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Cancel Booking', 'Booking', id)
    await createNotification(cancelledBooking.bookedBy, 'Booking', `Your booking has been cancelled.`)

    res.json(cancelledBooking)
  } catch (error) {
    console.error('Error cancelling booking:', error)
    res.status(500).json({ error: 'Failed to cancel booking' })
  }
})

export default router
