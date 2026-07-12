import { Router, Request, Response } from 'express'
import { db } from '../db'

const router = Router()

// GET /api/transfers - List all transfer requests
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
    const transfers = await db.transferRequest.findMany({
      where,
      orderBy: { id: 'desc' }
    })
    res.json(transfers)
  } catch (error) {
    console.error('Error fetching transfer requests:', error)
    res.status(500).json({ error: 'Failed to fetch transfer requests' })
  }
})

// POST /api/transfers - Raise a new transfer request
router.post('/', async (req: Request, res: Response) => {
  const { assetId, toHolderId, requestedBy } = req.body

  if (!assetId || !toHolderId || !requestedBy) {
    res.status(400).json({ error: 'Required fields: assetId, toHolderId, requestedBy' })
    return
  }

  try {
    // 1. Verify the asset exists
    const asset = await db.asset.findUnique({
      where: { id: assetId }
    })

    if (!asset) {
      res.status(404).json({ error: 'Asset not found' })
      return
    }

    // 2. Find the active allocation to get the current holder (fromHolderId)
    const activeAllocation = await db.allocation.findFirst({
      where: {
        assetId,
        status: 'Active'
      }
    })

    if (!activeAllocation) {
      res.status(400).json({ error: 'Cannot request transfer. The asset is not currently allocated to anyone.' })
      return
    }

    // Prevent transferring to the same person
    if (activeAllocation.holderId === toHolderId) {
      res.status(400).json({ error: 'Cannot transfer the asset to the current holder' })
      return
    }

    // 3. Create the Transfer Request
    const transferRequest = await db.transferRequest.create({
      data: {
        assetId,
        fromHolderId: activeAllocation.holderId,
        toHolderId,
        requestedBy,
        status: 'Requested'
      }
    })

    res.status(201).json(transferRequest)
  } catch (error) {
    console.error('Error creating transfer request:', error)
    res.status(500).json({ error: 'Failed to create transfer request' })
  }
})

// POST /api/transfers/:id/approve - Approve a transfer request
router.post('/:id/approve', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { approvedBy } = req.body

  if (!approvedBy) {
    res.status(400).json({ error: 'approvedBy (User ID) is required to approve the transfer' })
    return
  }

  try {
    // 1. Find the transfer request
    const transferRequest = await db.transferRequest.findUnique({
      where: { id }
    })

    if (!transferRequest) {
      res.status(404).json({ error: 'Transfer request not found' })
      return
    }

    if (transferRequest.status !== 'Requested') {
      res.status(400).json({ error: `Cannot approve. Transfer request is already ${transferRequest.status}` })
      return
    }

    // 2. Find the active allocation for this asset
    const activeAllocation = await db.allocation.findFirst({
      where: {
        assetId: transferRequest.assetId,
        status: 'Active'
      }
    })

    if (!activeAllocation) {
      res.status(400).json({ error: 'No active allocation found for the asset to transfer.' })
      return
    }

    // 3. Determine target holder type (Employee or Department)
    let toHolderType = 'Employee'
    const targetUser = await db.user.findUnique({
      where: { id: transferRequest.toHolderId }
    })

    if (!targetUser) {
      const targetDept = await db.department.findUnique({
        where: { id: transferRequest.toHolderId }
      })
      if (targetDept) {
        toHolderType = 'Department'
      } else {
        res.status(400).json({ error: 'Target holder ID does not match any Employee or Department.' })
        return
      }
    }

    // 4. Perform sequential re-allocation inside a transaction
    const result = await db.$transaction(async (tx) => {
      // Step A: Close the old allocation
      await tx.allocation.update({
        where: { id: activeAllocation.id },
        data: {
          returnedAt: new Date(),
          returnConditionNotes: 'Transferred via approved request',
          status: 'Returned'
        }
      })

      // Step B: Open a new allocation for the new holder
      const newAllocation = await tx.allocation.create({
        data: {
          assetId: transferRequest.assetId,
          holderType: toHolderType,
          holderId: transferRequest.toHolderId,
          employeeId: toHolderType === 'Employee' ? transferRequest.toHolderId : null,
          departmentId: toHolderType === 'Department' ? transferRequest.toHolderId : null,
          expectedReturnDate: activeAllocation.expectedReturnDate, // carry over timeline
          status: 'Active'
        }
      })

      // Step C: Update transfer request status
      const updatedRequest = await tx.transferRequest.update({
        where: { id },
        data: {
          status: 'Approved',
          approvedBy,
          approvedAt: new Date()
        }
      })

      // Step D: Update Asset status (just to ensure it stays Allocated)
      await tx.asset.update({
        where: { id: transferRequest.assetId },
        data: { status: 'Allocated' }
      })

      return { newAllocation, updatedRequest }
    })

    res.json(result)
  } catch (error) {
    console.error('Error approving transfer request:', error)
    res.status(500).json({ error: 'Failed to approve transfer request' })
  }
})

export default router
