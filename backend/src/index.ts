import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { db } from './db'
import departmentsRouter from './routes/departments'
import categoriesRouter from './routes/categories'
import employeesRouter from './routes/employees'
import assetsRouter from './routes/assets'
import allocationsRouter from './routes/allocations'
import transfersRouter from './routes/transfers'
import bookingsRouter from './routes/bookings'
import authRoutes from './routes/auth.routes'
import dashboardRouter from './routes/dashboard'

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)

// Register API Routes
app.use('/api/departments', departmentsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/employees', employeesRouter)
app.use('/api/assets', assetsRouter)
app.use('/api/allocations', allocationsRouter)
app.use('/api/transfers', transfersRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/dashboard', dashboardRouter)

app.get('/api/health', async (req, res) => {
  try {
    await db.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    console.error('Database connection failed:', error)
    res.status(500).json({ status: 'error', message: 'Database connection failed' })
  }
})

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`)
})
