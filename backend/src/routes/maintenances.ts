import { Router, Request, Response } from 'express'
import { db } from '../db'
import { logActivity, createNotification, getActorFromRequest } from '../utils/activityLogger'

const router = Router()

// GET /api/maintenances - List all maintenance requests
router.get('/', async (req: Request, res: Response) => {
  // Support optional query filters: ?status=...&assetId=...
  const { status, assetId } = req.query
  const where: any = {}

  if (status) where.status = status
  if (assetId) where.assetId = assetId

  try {
    const maintenances = await db.maintenanceReq.findMany({
      where,
      include: {
        asset: {
          select: { id: true, assetTag: true, name: true, status: true }
        },
        raiser: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { id: 'desc' }
    })
    res.json(maintenances)
  } catch (error) {
    console.error('Error fetching maintenance requests:', error)
    res.status(500).json({ error: 'Failed to fetch maintenance requests' })
  }
})

// POST /api/maintenances - Raise a new maintenance request
router.post('/', async (req: Request, res: Response) => {
  const { assetId, raisedBy, issueDescription, priority } = req.body

  if (!assetId || !raisedBy || !issueDescription || !priority) {
    res.status(400).json({ error: 'Required fields: assetId, raisedBy, issueDescription, priority' })
    return
  }

  try {
    // 1. Verify asset exists
    const asset = await db.asset.findUnique({ where: { id: assetId } })
    if (!asset) {
      res.status(404).json({ error: 'Asset not found' })
      return
    }

    // 2. Create maintenance request (no status change until approval)
    const ticket = await db.maintenanceReq.create({
      data: {
        assetId,
        raisedBy,
        issueDescription,
        priority,
        status: 'Pending'
      }
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Raise Maintenance Request', 'Maintenance', ticket.id)

    res.status(201).json(ticket)
  } catch (error) {
    console.error('Error creating maintenance request:', error)
    res.status(500).json({ error: 'Failed to create maintenance request' })
  }
})

// POST /api/maintenances/:id/approve - Approve a maintenance request
router.post('/:id/approve', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { approvedBy } = req.body

  try {
    const ticket = await db.maintenanceReq.findUnique({ where: { id } })
    if (!ticket) {
      res.status(404).json({ error: 'Maintenance request not found' })
      return
    }

    const updated = await db.$transaction(async (tx) => {
      const upd = await tx.maintenanceReq.update({
        where: { id },
        data: { status: 'Approved', approvedBy: approvedBy as string }
      })
      await tx.asset.update({
        where: { id: ticket.assetId },
        data: { status: 'Under_Maintenance' }
      })
      return upd
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Approve Maintenance Request', 'Maintenance', id)
    await createNotification(ticket.raisedBy, 'Maintenance', `Your maintenance request has been approved and the asset is now under maintenance.`)

    res.json(updated)
  } catch (error) {
    console.error('Error approving maintenance request:', error)
    res.status(500).json({ error: 'Failed to approve maintenance request' })
  }
})

// POST /api/maintenances/:id/reject - Reject a maintenance request
router.post('/:id/reject', async (req: Request, res: Response) => {
  const id = req.params.id as string

  try {
    const ticket = await db.maintenanceReq.findUnique({ where: { id } })
    if (!ticket) {
      res.status(404).json({ error: 'Maintenance request not found' })
      return
    }

    const updated = await db.maintenanceReq.update({
      where: { id },
      data: { status: 'Rejected' }
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Reject Maintenance Request', 'Maintenance', id)
    await createNotification(ticket.raisedBy, 'Maintenance', `Your maintenance request has been rejected.`)

    res.json(updated)
  } catch (error) {
    console.error('Error rejecting maintenance request:', error)
    res.status(500).json({ error: 'Failed to reject maintenance request' })
  }
})

// POST /api/maintenances/:id/assign - Assign a technician
router.post('/:id/assign', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { technicianId } = req.body

  try {
    const ticket = await db.maintenanceReq.findUnique({ where: { id } })
    if (!ticket) {
      res.status(404).json({ error: 'Maintenance request not found' })
      return
    }

    const updated = await db.$transaction(async (tx) => {
      const upd = await tx.maintenanceReq.update({
        where: { id },
        data: { technicianId: technicianId as string, status: 'InProgress' }
      })
      return upd
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Assign Technician', 'Maintenance', id)
    await createNotification(technicianId as string, 'Maintenance', `You have been assigned as technician for a maintenance request. Please inspect and resolve the issue.`)
    await createNotification(ticket.raisedBy, 'Maintenance', `A technician has been assigned to your maintenance request and repair is now in progress.`)

    res.json(updated)
  } catch (error) {
    console.error('Error assigning technician:', error)
    res.status(500).json({ error: 'Failed to assign technician' })
  }
})

// POST /api/maintenances/:id/resolve - Resolve the maintenance request
router.post('/:id/resolve', async (req: Request, res: Response) => {
  const id = req.params.id as string

  try {
    const ticket = await db.maintenanceReq.findUnique({ where: { id } })
    if (!ticket) {
      res.status(404).json({ error: 'Maintenance request not found' })
      return
    }

    // Guard: already resolved check (from remote branch)
    if (ticket.status === 'Resolved') {
      res.status(400).json({ error: 'Maintenance request is already resolved' })
      return
    }

    const updated = await db.$transaction(async (tx) => {
      const upd = await tx.maintenanceReq.update({
        where: { id },
        data: { status: 'Resolved' }
      })
      await tx.asset.update({
        where: { id: ticket.assetId },
        data: { status: 'Available' }
      })
      return upd
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Resolve Maintenance Request', 'Maintenance', id)
    await createNotification(ticket.raisedBy, 'Maintenance', `Your maintenance request has been resolved and the asset is now available again.`)

    res.json(updated)
  } catch (error) {
    console.error('Error resolving maintenance request:', error)
    res.status(500).json({ error: 'Failed to resolve maintenance request' })
  }
})

export default router
