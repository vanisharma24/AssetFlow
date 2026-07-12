import { Router, Request, Response } from 'express'
import { db } from '../db'

const router = Router()

// GET /api/dashboard/kpis - Fetch dashboard KPI metrics
router.get('/kpis', async (req: Request, res: Response) => {
  try {
    const totalAssets = await db.asset.count()

    const [activeEmployeeAllocations, activeDeptAllocations] = await Promise.all([
      db.allocation.count({
        where: {
          status: 'Active',
          holderType: 'Employee'
        }
      }),
      db.allocation.count({
        where: {
          status: 'Active',
          holderType: 'Department'
        }
      })
    ])

    const now = new Date()
    const overdueAllocations = await db.allocation.count({
      where: {
        status: 'Active',
        expectedReturnDate: {
          lt: now
        }
      }
    })

    const pendingMaintenance = await db.maintenanceReq.count({
      where: {
        status: 'Pending'
      }
    })

    res.json({
      totalAssets,
      activeAllocations: {
        total: activeEmployeeAllocations + activeDeptAllocations,
        employee: activeEmployeeAllocations,
        department: activeDeptAllocations
      },
      overdueAllocations,
      pendingMaintenance
    })
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard KPIs' })
  }
})

export default router
