import { Router, Request, Response } from 'express'
import { db } from '../db'
import { logActivity, createNotification, getActorFromRequest } from '../utils/activityLogger'

const router = Router()

// GET /api/allocations - List all allocations
router.get('/', async (req: Request, res: Response) => {
  const { status, assetId, holderId } = req.query
  const where: any = {}

  if (status) {
    where.status = status
  }
  if (assetId) {
    where.assetId = assetId
  }
  if (holderId) {
    where.holderId = holderId
  }

  try {
    const allocations = await db.allocation.findMany({
      where,
      include: {
        asset: {
          select: {
            id: true,
            assetTag: true,
            name: true
          }
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { allocatedAt: 'desc' }
    })
    res.json(allocations)
  } catch (error) {
    console.error('Error fetching allocations:', error)
    res.status(500).json({ error: 'Failed to fetch allocations' })
  }
})

import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth'

// POST /api/allocations - Create a new allocation (Enforces double-allocation block, Admin/AssetManager only)
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'AssetManager') {
    res.status(403).json({ error: 'Forbidden: Requires Admin or AssetManager role.' })
    return
  }

  const { assetId, holderType, holderId, expectedReturnDate } = req.body

  if (!assetId || !holderType || !holderId || !expectedReturnDate) {
    res.status(400).json({ error: 'Required fields: assetId, holderType (Employee/Department), holderId, expectedReturnDate' })
    return
  }

  if (holderType !== 'Employee' && holderType !== 'Department') {
    res.status(400).json({ error: 'holderType must be either "Employee" or "Department"' })
    return
  }

  try {
    // 1. Check if the asset exists
    const asset = await db.asset.findUnique({
      where: { id: assetId }
    })

    if (!asset) {
      res.status(404).json({ error: 'Asset not found' })
      return
    }

    // 2. Check if the asset status is allowed to be allocated
    if (asset.status !== 'Available' && asset.status !== 'Reserved') {
      res.status(400).json({ error: `Cannot allocate asset. Current status is: ${asset.status}` })
      return
    }

    // 3. Check if there is an active allocation (Double-Allocation check)
    const activeAllocation = await db.allocation.findFirst({
      where: {
        assetId,
        status: 'Active'
      }
    })

    if (activeAllocation) {
      res.status(409).json({
        error: 'DoubleAllocationBlock',
        message: `Asset is currently allocated to ${activeAllocation.holderType === 'Employee' ? 'an Employee' : 'a Department'}`,
        currentHolderId: activeAllocation.holderId,
        holderType: activeAllocation.holderType
      })
      return
    }

    // 4. Perform allocation inside a transaction
    const allocation = await db.$transaction(async (tx) => {
      // Create Allocation record
      const newAllocation = await tx.allocation.create({
        data: {
          assetId,
          holderType,
          holderId,
          employeeId: holderType === 'Employee' ? holderId : null,
          departmentId: holderType === 'Department' ? holderId : null,
          expectedReturnDate: new Date(expectedReturnDate),
          status: 'Active'
        }
      })

      // Update Asset status
      await tx.asset.update({
        where: { id: assetId },
        data: { status: 'Allocated' }
      })

      return newAllocation
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Allocate Asset', 'Allocation', allocation.id)
    if (holderType === 'Employee') {
      await createNotification(holderId, 'Allocation', `Asset "${asset.name}" has been allocated to you. Expected return: ${new Date(expectedReturnDate).toLocaleDateString()}`)
    }

    res.status(201).json(allocation)
  } catch (error) {
    console.error('Error creating allocation:', error)
    res.status(500).json({ error: 'Failed to create allocation' })
  }
})

// POST /api/allocations/:id/return - Return an asset (Admin/AssetManager, or the allocated Employee)
router.post('/:id/return', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string
  const { returnConditionNotes } = req.body

  if (!returnConditionNotes) {
    res.status(400).json({ error: 'Return condition notes are required' })
    return
  }

  try {
    const allocation = await db.allocation.findUnique({
      where: { id }
    })

    if (!allocation) {
      res.status(404).json({ error: 'Allocation record not found' })
      return
    }

    // Allow Admins, AssetManagers, or the holding user
    const isOwner = allocation.holderType === 'Employee' && allocation.holderId === req.user?.sub
    const isAuthorized = req.user?.role === 'Admin' || req.user?.role === 'AssetManager' || isOwner

    if (!isAuthorized) {
      res.status(403).json({ error: 'Forbidden: You do not have permission to return this asset.' })
      return
    }

    if (allocation.status !== 'Active') {
      res.status(400).json({ error: 'Asset has already been returned' })
      return
    }

    // Close allocation and release asset in a transaction
    const closedAllocation = await db.$transaction(async (tx) => {
      const updatedAlloc = await tx.allocation.update({
        where: { id },
        data: {
          returnedAt: new Date(),
          returnConditionNotes,
          status: 'Returned'
        }
      })

      await tx.asset.update({
        where: { id: allocation.assetId },
        data: { status: 'Available' }
      })

      return updatedAlloc
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Return Asset', 'Allocation', closedAllocation.id)
    if (closedAllocation.holderType === 'Employee' && closedAllocation.holderId) {
      await createNotification(closedAllocation.holderId, 'Return', `Your allocated asset has been checked in as returned. Condition notes: "${returnConditionNotes}"`)
    }

    res.json(closedAllocation)
  } catch (error) {
    console.error('Error returning asset:', error)
    res.status(500).json({ error: 'Failed to process asset return' })
  }
})

export default router
