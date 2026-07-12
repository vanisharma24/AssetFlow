import express from 'express'
import cors from 'cors'
import { db } from './db'
import departmentsRouter from './routes/departments'
import categoriesRouter from './routes/categories'
import employeesRouter from './routes/employees'
import assetsRouter from './routes/assets'

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Register API Routes
app.use('/api/departments', departmentsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/employees', employeesRouter)
app.use('/api/assets', assetsRouter)

app.get('/api/health', async (req, res) => {
  try {
    // Perform a simple query to verify database connection
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
