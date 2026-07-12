import { Router, Request, Response } from 'express'
import { db } from '../db'

const router = Router()

// GET /api/maintenances - List all maintenance requests
router.get('/', async (req: Request, res: Response) => {
  const { status, assetId } = req.query
  const where: any = {}

  if (status) {
    where.status = status
  }
  if (assetId) {
    where.assetId = assetId
  }

  try {
    const requests = await db.maintenanceReq.findMany({
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
        raiser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { id: 'desc' }
    })
    res.json(requests)
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
    const asset = await db.asset.findUnique({
      where: { id: assetId }
    })

    if (!asset) {
      res.status(404).json({ error: 'Asset not found' })
      return
    }

    // 2. Perform maintenance request creation and asset status update in a transaction
    const request = await db.$transaction(async (tx) => {
      const newRequest = await tx.maintenanceReq.create({
        data: {
          assetId,
          raisedBy,
          issueDescription,
          priority,
          status: 'Pending'
        }
      })

      // Update asset status to Under_Maintenance
      await tx.asset.update({
        where: { id: assetId },
        data: { status: 'Under_Maintenance' }
      })

      return newRequest
    })

    res.status(201).json(request)
  } catch (error) {
    console.error('Error creating maintenance request:', error)
    res.status(500).json({ error: 'Failed to create maintenance request' })
  }
})

// POST /api/maintenances/:id/resolve - Resolve a maintenance request
router.post('/:id/resolve', async (req: Request, res: Response) => {
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

    res.json(resolvedRequest)
  } catch (error) {
    console.error('Error resolving maintenance request:', error)
    res.status(500).json({ error: 'Failed to resolve maintenance request' })
  }
})

export default router
