import { Router, Request, Response } from 'express'
import { db } from '../db'
import { logActivity, createNotification, getActorFromRequest } from '../utils/activityLogger'

const router = Router()

// GET /api/audits/cycles - List all audit cycles
router.get('/cycles', async (req: Request, res: Response) => {
  try {
    const cycles = await db.auditCycle.findMany({
      include: {
        department: { select: { id: true, name: true } },
        assignments: {
          include: {
            auditor: { select: { id: true, name: true, email: true } }
          }
        },
        findings: {
          include: {
            asset: { select: { id: true, assetTag: true, name: true, status: true } }
          }
        }
      },
      orderBy: { startDate: 'desc' }
    })
    res.json(cycles)
  } catch (error) {
    console.error('Error fetching audit cycles:', error)
    res.status(500).json({ error: 'Failed to fetch audit cycles' })
  }
})

// POST /api/audits/cycles - Create a new cycle
router.post('/cycles', async (req: Request, res: Response) => {
  const { scopeDepartmentId, scopeLocation, startDate, endDate, auditorUserIds } = req.body

  if (!startDate || !endDate) {
    res.status(400).json({ error: 'Required fields: startDate, endDate' })
    return
  }

  try {
    if (scopeDepartmentId) {
      const dept = await db.department.findUnique({ where: { id: scopeDepartmentId } })
      if (!dept) {
        res.status(404).json({ error: 'Scope department not found' })
        return
      }
    }

    const cycle = await db.$transaction(async (tx) => {
      const newCycle = await tx.auditCycle.create({
        data: {
          scopeDepartmentId: scopeDepartmentId || null,
          scopeLocation: scopeLocation || null,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: 'Planned'
        }
      })

      if (auditorUserIds && Array.isArray(auditorUserIds)) {
        await tx.auditAssignment.createMany({
          data: auditorUserIds.map((userId: string) => ({
            auditCycleId: newCycle.id,
            auditorUserId: userId
          }))
        })
      }

      return newCycle
    })

    const fullCycle = await db.auditCycle.findUnique({
      where: { id: cycle.id },
      include: { department: true, assignments: { include: { auditor: true } } }
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Schedule Audit Cycle', 'AuditCycle', cycle.id)

    res.status(201).json(fullCycle)
  } catch (error) {
    console.error('Error creating audit cycle:', error)
    res.status(500).json({ error: 'Failed to create audit cycle' })
  }
})

// POST /api/audits/cycles/:id/start - Start an audit cycle
router.post('/cycles/:id/start', async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const cycle = await db.auditCycle.findUnique({ where: { id } })
    if (!cycle) {
      res.status(404).json({ error: 'Audit cycle not found' })
      return
    }

    const updated = await db.auditCycle.update({
      where: { id },
      data: { status: 'InProgress' }
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Start Audit Cycle', 'AuditCycle', id)

    res.json(updated)
  } catch (error) {
    console.error('Error starting audit cycle:', error)
    res.status(500).json({ error: 'Failed to start audit cycle' })
  }
})

// POST /api/audits/cycles/:id/findings - Log finding
router.post('/cycles/:id/findings', async (req: Request, res: Response) => {
  const { id } = req.params
  const { assetId, result, notes } = req.body

  if (!assetId || !result) {
    res.status(400).json({ error: 'Required fields: assetId, result' })
    return
  }

  try {
    const cycle = await db.auditCycle.findUnique({ where: { id } })
    if (!cycle) {
      res.status(404).json({ error: 'Audit cycle not found' })
      return
    }
    if (cycle.status !== 'InProgress') {
      res.status(400).json({ error: 'Findings can only be logged for InProgress cycles.' })
      return
    }

    const asset = await db.asset.findUnique({ where: { id: assetId } })
    if (!asset) {
      res.status(404).json({ error: 'Asset not found' })
      return
    }

    const finding = await db.$transaction(async (tx) => {
      const existing = await tx.auditFinding.findFirst({
        where: { auditCycleId: id, assetId }
      })

      let loggedFinding
      if (existing) {
        loggedFinding = await tx.auditFinding.update({
          where: { id: existing.id },
          data: { result, notes: notes || null }
        })
      } else {
        loggedFinding = await tx.auditFinding.create({
          data: { auditCycleId: id, assetId, result, notes: notes || null }
        })
      }

      if (result === 'Missing') {
        await tx.asset.update({ where: { id: assetId }, data: { status: 'Lost' } })
      } else if (result === 'Damaged') {
        await tx.asset.update({ where: { id: assetId }, data: { status: 'Under_Maintenance' } })
      } else if (result === 'Verified' && (asset.status === 'Lost' || asset.status === 'Under_Maintenance')) {
        await tx.asset.update({ where: { id: assetId }, data: { status: 'Available' } })
      }

      return loggedFinding
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, `Log Audit Finding: ${result}`, 'AuditFinding', finding.id)

    res.status(201).json(finding)
  } catch (error) {
    console.error('Error logging audit finding:', error)
    res.status(500).json({ error: 'Failed to log audit finding' })
  }
})

// POST /api/audits/cycles/:id/close - Close audit cycle
router.post('/cycles/:id/close', async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const cycle = await db.auditCycle.findUnique({
      where: { id },
      include: { findings: true }
    })
    if (!cycle) {
      res.status(404).json({ error: 'Audit cycle not found' })
      return
    }

    const updated = await db.$transaction(async (tx) => {
      for (const finding of cycle.findings) {
        if (finding.result === 'Missing') {
          await tx.asset.update({ where: { id: finding.assetId }, data: { status: 'Lost' } })
        } else if (finding.result === 'Damaged') {
          await tx.asset.update({ where: { id: finding.assetId }, data: { status: 'Under_Maintenance' } })
        }
      }
      return await tx.auditCycle.update({
        where: { id },
        data: { status: 'Closed', closedAt: new Date() }
      })
    })

    const actor = await getActorFromRequest(req)
    await logActivity(actor, 'Close Audit Cycle', 'AuditCycle', id)

    res.json(updated)
  } catch (error) {
    console.error('Error closing audit cycle:', error)
    res.status(500).json({ error: 'Failed to close audit cycle' })
  }
})

export default router
