import { Router, Request, Response } from 'express'
import { db } from '../db'

const router = Router()

// GET /api/departments - Get all departments
router.get('/', async (req: Request, res: Response) => {
  try {
    const departments = await db.department.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        }
      }
    })
    res.json(departments)
  } catch (error) {
    console.error('Error fetching departments:', error)
    res.status(500).json({ error: 'Failed to fetch departments' })
  }
})

// GET /api/departments/:id - Get a single department by ID
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string
  try {
    const department = await db.department.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true
          }
        }
      }
    })

    if (!department) {
      res.status(404).json({ error: 'Department not found' })
      return
    }

    res.json(department)
  } catch (error) {
    console.error('Error fetching department:', error)
    res.status(500).json({ error: 'Failed to fetch department' })
  }
})

// POST /api/departments - Create a new department
router.post('/', async (req: Request, res: Response) => {
  const { name, headUserId, parentDepartmentId, status } = req.body

  if (!name) {
    res.status(400).json({ error: 'Department name is required' })
    return
  }

  try {
    const department = await db.department.create({
      data: {
        name,
        headUserId: headUserId || null,
        parentDepartmentId: parentDepartmentId || null,
        status: status || 'Active'
      }
    })
    res.status(201).json(department)
  } catch (error) {
    console.error('Error creating department:', error)
    res.status(500).json({ error: 'Failed to create department' })
  }
})

// PUT /api/departments/:id - Update department details
router.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { name, headUserId, parentDepartmentId, status } = req.body

  try {
    const department = await db.department.update({
      where: { id },
      data: {
        name,
        headUserId: headUserId !== undefined ? headUserId : undefined,
        parentDepartmentId: parentDepartmentId !== undefined ? parentDepartmentId : undefined,
        status: status !== undefined ? status : undefined
      }
    })
    res.json(department)
  } catch (error) {
    console.error('Error updating department:', error)
    res.status(500).json({ error: 'Failed to update department' })
  }
})

export default router
