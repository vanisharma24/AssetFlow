import { Router, Request, Response } from 'express'
import { db } from '../db'
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth'
import { logActivity, createNotification, getActorFromRequest } from '../utils/activityLogger'

const router = Router()

// GET /api/maintenances - List all maintenance requests
router.get('/', async (req: Request, res: Response) => {
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

// POST /api/maintenances - Raise a new maintenance request (does NOT change asset status per PRD Rule 5)
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { assetId, raisedBy, issueDescription, priority } = req.body

  if (!assetId || !raisedBy || !issueDescription || !priority) {
    res.status(400).json({ error: 'Required fields: assetId, raisedBy, issueDescription, priority' })
    return
  }

  try {
    // 1. Verify asset exists
    const asset = await db.asset.findUnique({
      where: { id: assetId }
    })

    if (!asset) {
      res.status(404).json({ error: 'Asset not found' })
      return
    }

    // 2. Create pending maintenance request (does NOT change asset status per PRD Rule 5)
    const request = await db.maintenanceReq.create({
      data: {
        assetId,
        raisedBy,
        issueDescription,
        priority,
        status: 'Pending'
      }
    })

    // Log activity
    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Raise Maintenance Request', 'Maintenance', request.id)

    res.status(201).json(request)
  } catch (error) {
    console.error('Error creating maintenance request:', error)
    res.status(500).json({ error: 'Failed to create maintenance request' })
  }
})

// POST /api/maintenances/:id/approve - Approve a maintenance request (sets Asset status to Under_Maintenance, Admin/AssetManager only)
router.post('/:id/approve', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'AssetManager') {
    res.status(403).json({ error: 'Forbidden: Requires Admin or AssetManager role.' })
    return
  }

  const id = req.params.id as string

  try {
    const request = await db.maintenanceReq.findUnique({
      where: { id }
    })

    if (!request) {
      res.status(404).json({ error: 'Maintenance request not found' })
      return
    }

    if (request.status !== 'Pending') {
      res.status(400).json({ error: `Cannot approve request with status: ${request.status}` })
      return
    }

    // Set request status to Approved and asset status to Under_Maintenance in transaction
    const approvedRequest = await db.$transaction(async (tx) => {
      const updated = await tx.maintenanceReq.update({
        where: { id },
        data: {
          status: 'Approved',
          approvedBy: req.user?.sub
        }
      })

      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: 'Under_Maintenance' }
      })

      return updated
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Approve Maintenance Request', 'Maintenance', id)
    await createNotification(request.raisedBy, 'Maintenance', `Your maintenance request for asset ${approvedRequest.assetId} has been approved.`)

    res.json(approvedRequest)
  } catch (error) {
    console.error('Error approving maintenance request:', error)
    res.status(500).json({ error: 'Failed to approve maintenance request' })
  }
})

// POST /api/maintenances/:id/resolve - Resolve a maintenance request (sets Asset status back to Available, Admin/AssetManager only)
router.post('/:id/resolve', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'AssetManager') {
    res.status(403).json({ error: 'Forbidden: Requires Admin or AssetManager role.' })
    return
  }

  const id = req.params.id as string

  try {
    const request = await db.maintenanceReq.findUnique({
      where: { id }
    })

    if (!request) {
      res.status(404).json({ error: 'Maintenance request not found' })
      return
    }

    if (request.status === 'Resolved') {
      res.status(400).json({ error: 'Maintenance request is already resolved' })
      return
    }

    // Update request to Resolved and release asset to Available in transaction
    const resolvedRequest = await db.$transaction(async (tx) => {
      const updated = await tx.maintenanceReq.update({
        where: { id },
        data: { status: 'Resolved' }
      })

      await tx.asset.update({
        where: { id: request.assetId },
        data: { status: 'Available' }
      })

      return updated
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Resolve Maintenance Request', 'Maintenance', id)
    await createNotification(request.raisedBy, 'Maintenance', `Your maintenance request has been resolved and the asset is now available again.`)

    res.json(resolvedRequest)
  } catch (error) {
    console.error('Error resolving maintenance request:', error)
    res.status(500).json({ error: 'Failed to resolve maintenance request' })
  }
})

export default router
