import { Router, Request, Response } from 'express'
import { db } from '../db'

const router = Router()

// GET /api/categories - Fetch all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await db.assetCategory.findMany()
    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// POST /api/categories - Create a new category
router.post('/', async (req: Request, res: Response) => {
  const { name, customFields } = req.body

  if (!name) {
    res.status(400).json({ error: 'Category name is required' })
    return
  }

  try {
    const category = await db.assetCategory.create({
      data: {
        name,
        customFields: customFields || null
      }
    })
    res.status(201).json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// PUT /api/categories/:id - Update an existing category
router.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { name, customFields } = req.body

  try {
    const category = await db.assetCategory.update({
      where: { id },
      data: {
        name,
        customFields: customFields !== undefined ? customFields : undefined
      }
    })
    res.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    res.status(500).json({ error: 'Failed to update category' })
  }
})

export default router
