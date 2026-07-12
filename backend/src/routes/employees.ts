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

import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth'

// PATCH /api/employees/:id - Update employee department, role, or status (Admin only for role/status updates)
router.patch('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string
  const { name, departmentId, status, role } = req.body

  // If attempting to update role or status, verify current user is Admin
  if ((role !== undefined || status !== undefined || departmentId !== undefined) && req.user?.role !== 'Admin') {
    res.status(403).json({ error: 'Forbidden: Only Administrators can modify roles, departments or statuses.' })
    return
  }

  try {
    const employee = await db.user.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        departmentId: departmentId !== undefined ? departmentId : undefined,
        status: status !== undefined ? status : undefined,
        role: role !== undefined ? role : undefined
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
