import express from 'express'
import { db } from '../db'
import { comparePassword, hashPassword, signToken, verifyToken } from '../utils/auth'

const router = express.Router()

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      })
    }

    const validRoles = ['Admin', 'AssetManager', 'DepartmentHead', 'Employee']
    let userRole: any = 'Employee'
    if (role && validRoles.includes(role)) {
      userRole = role
    }

    const existingUser = await db.user.findUnique({ where: { email } })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      })
    }

    const passwordHash = await hashPassword(password)

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: userRole,
        status: 'Active',
      },
    })

    const token = signToken({ sub: user.id, email: user.email, role: user.role })

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Signup failed', error })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
    }

    const user = await db.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const isValidPassword = await comparePassword(password, user.passwordHash)

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const token = signToken({ sub: user.id, email: user.email, role: user.role })

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Login failed', error })
  }
})

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing token' })
    }

    const payload = verifyToken(token)
    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, status: true },
    })

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    return res.json({ success: true, user })
  } catch (error) {
    console.error(error)
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

export default router
