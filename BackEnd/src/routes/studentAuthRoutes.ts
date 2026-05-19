import express from 'express'
import { StudentAuthController } from '../controller/studentAuthController'

const router = express.Router()

// Student authentication routes
router.post('/login', StudentAuthController.login)
router.post('/verify-otp', StudentAuthController.verifyOTP)
router.post('/resend-otp', StudentAuthController.resendOTP)
router.get('/result/:studentId', StudentAuthController.getResult)

export { router }
