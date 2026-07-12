import { Router, Request, Response } from 'express'
import { db } from '../db'
import { Prisma } from '@prisma/client'

const router = Router()

// Helper function to generate sequential Asset Tags (e.g. AF-0001, AF-0002...)
async function generateAssetTag(): Promise<string> {
  const lastAsset = await db.asset.findFirst({
    orderBy: { assetTag: 'desc' }
  })

  if (!lastAsset) {
    return 'AF-0001'
  }

  const match = lastAsset.assetTag.match(/^AF-(\d+)$/)
  if (!match) {
    return 'AF-0001'
  }

  const nextNumber = parseInt(match[1], 10) + 1
  const paddedNumber = String(nextNumber).padStart(4, '0')
  return `AF-${paddedNumber}`
}

// GET /api/assets - List all assets with search and filtering
router.get('/', async (req: Request, res: Response) => {
  const { search, status, categoryId, location, isBookable } = req.query

  const where: any = {}

  if (status) {
    where.status = status
  }
  if (categoryId) {
    where.categoryId = categoryId
  }
  if (location) {
    where.location = { contains: location as string, mode: 'insensitive' }
  }
  if (isBookable !== undefined) {
    where.isBookable = isBookable === 'true'
  }
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { serialNumber: { contains: search as string, mode: 'insensitive' } },
      { assetTag: { contains: search as string, mode: 'insensitive' } }
    ]
  }

  try {
    const assets = await db.asset.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { assetTag: 'asc' }
    })
    res.json(assets)
  } catch (error) {
    console.error('Error fetching assets:', error)
    res.status(500).json({ error: 'Failed to fetch assets' })
  }
})

// GET /api/assets/:id - Get a single asset with history
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string
  try {
    const asset = await db.asset.findUnique({
      where: { id },
      include: {
        category: true,
        allocations: {
          orderBy: { allocatedAt: 'desc' }
        },
        bookings: {
          orderBy: { startTime: 'desc' }
        },
        maintenances: {
          orderBy: { id: 'desc' } // simple ordering by creation/id
        }
      }
    })

    if (!asset) {
      res.status(404).json({ error: 'Asset not found' })
      return
    }

    res.json(asset)
  } catch (error) {
    console.error('Error fetching asset details:', error)
    res.status(500).json({ error: 'Failed to fetch asset details' })
  }
})

import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth'

// POST /api/assets - Register a new asset (auto-generates assetTag, Admin/AssetManager only)
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'AssetManager') {
    res.status(403).json({ error: 'Forbidden: Requires Admin or AssetManager role.' })
    return
  }

  const {
    name,
    categoryId,
    serialNumber,
    acquisitionDate,
    acquisitionCost,
    condition,
    location,
    isBookable,
    status
  } = req.body

  if (!name || !categoryId || !acquisitionDate || !acquisitionCost || !condition || !location) {
    res.status(400).json({ error: 'Required fields: name, categoryId, acquisitionDate, acquisitionCost, condition, location' })
    return
  }

  try {
    // Generate sequential tag
    const assetTag = await generateAssetTag()

    const asset = await db.asset.create({
      data: {
        assetTag,
        name,
        categoryId,
        serialNumber: serialNumber || null,
        acquisitionDate: new Date(acquisitionDate),
        acquisitionCost: new Prisma.Decimal(acquisitionCost),
        condition,
        location,
        isBookable: isBookable === true || isBookable === 'true',
        status: status || 'Available'
      }
    })
    res.status(201).json(asset)
  } catch (error) {
    console.error('Error registering asset:', error)
    res.status(500).json({ error: 'Failed to register asset' })
  }
})

// PUT /api/assets/:id - Update an asset (Admin/AssetManager only)
router.put('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'AssetManager') {
    res.status(403).json({ error: 'Forbidden: Requires Admin or AssetManager role.' })
    return
  }

  const id = req.params.id as string
  const {
    name,
    categoryId,
    serialNumber,
    acquisitionDate,
    acquisitionCost,
    condition,
    location,
    isBookable,
    status
  } = req.body

  try {
    const asset = await db.asset.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        serialNumber: serialNumber !== undefined ? serialNumber : undefined,
        acquisitionDate: acquisitionDate !== undefined ? new Date(acquisitionDate) : undefined,
        acquisitionCost: acquisitionCost !== undefined ? new Prisma.Decimal(acquisitionCost) : undefined,
        condition: condition !== undefined ? condition : undefined,
        location: location !== undefined ? location : undefined,
        isBookable: isBookable !== undefined ? (isBookable === true || isBookable === 'true') : undefined,
        status: status !== undefined ? status : undefined
      }
    })
    res.json(asset)
  } catch (error) {
    console.error('Error updating asset:', error)
    res.status(500).json({ error: 'Failed to update asset' })
  }
})

export default router
