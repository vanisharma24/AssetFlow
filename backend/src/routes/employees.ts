import { Router, Request, Response } from 'express'
import { db } from '../db'

const router = Router()

// GET /api/employees - List all employees (users) in the directory
router.get('/', async (req: Request, res: Response) => {
  try {
    const employees = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    res.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    res.status(500).json({ error: 'Failed to fetch employees' })
  }
})

// PATCH /api/employees/:id - Update employee department or status
router.patch('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string
  const { name, departmentId, status } = req.body

  try {
    const employee = await db.user.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        departmentId: departmentId !== undefined ? departmentId : undefined,
        status: status !== undefined ? status : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    res.json(employee)
  } catch (error) {
    console.error('Error updating employee:', error)
    res.status(500).json({ error: 'Failed to update employee' })
  }
})

export default router
