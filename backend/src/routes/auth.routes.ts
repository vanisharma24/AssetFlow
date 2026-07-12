import express from 'express'
import authController from '../controllers/auth.controller'

const router = express.Router()

router.use(authController)

export default router