import { Request, Response } from 'express'
import Student from '../models/Student'
import { OTPService } from '../service/otpService'
import { AnalyticsService } from '../service/analyticsService'

export class StudentAuthController {
  /**
   * Student login - find student by roll number or email
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { identifier } = req.body // Can be roll number or email

      if (!identifier || !identifier.trim()) {
        res.status(400).json({ success: false, message: 'Roll number or email is required' })
        return
      }

      // Search by roll number or email
      const student = await Student.findOne({
        $or: [
          { rollNo: identifier.trim() },
          { email: identifier.trim().toLowerCase() }
        ]
      })

      if (!student) {
        // Track failed login
        AnalyticsService.trackFailedLogin(identifier)
        res.status(404).json({ success: false, message: 'Student not found. Please check your roll number or email.' })
        return
      }

      // Generate and save OTP
      const otpResult = await OTPService.generateAndSaveOTP(student._id)

      if (!otpResult.success || !otpResult.otp) {
        res.status(500).json({ success: false, message: 'Failed to generate OTP. Please try again.' })
        return
      }

      // Send OTP via email
      const emailSent = await OTPService.sendOTP(student.email, otpResult.otp, student.name)

      if (!emailSent) {
        res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again.' })
        return
      }

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your registered email',
        studentId: student._id,
        email: student.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email
      })
    } catch (error: any) {
      console.error('Student login error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      })
    }
  }

  /**
   * Verify OTP and return student data
   */
  static async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, otp } = req.body

      if (!studentId || !otp) {
        res.status(400).json({ success: false, message: 'Student ID and OTP are required' })
        return
      }

      // Verify OTP
      const verificationResult = await OTPService.verifyOTP(studentId, otp)

      if (!verificationResult.valid) {
        // Track failed OTP attempt
        AnalyticsService.trackSecurityEvent({
          type: 'failed_login',
          timestamp: new Date(),
          identifier: studentId,
          details: 'Failed OTP verification'
        })

        res.status(400).json({
          success: false,
          message: verificationResult.message
        })
        return
      }

      // Get student data
      const student = await Student.findById(studentId).select('-otp -otpExpiry')

      if (!student) {
        res.status(404).json({ success: false, message: 'Student not found' })
        return
      }

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          rollNo: student.rollNo,
          institutionName: student.institutionName,
          semester: student.semester,
          sgpa: student.sgpa
        }
      })
    } catch (error: any) {
      console.error('OTP verification error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      })
    }
  }

  /**
   * Resend OTP
   */
  static async resendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.body

      if (!studentId) {
        res.status(400).json({ success: false, message: 'Student ID is required' })
        return
      }

      // Check rate limiting
      const canResend = await OTPService.canResendOTP(studentId)

      if (!canResend.canResend) {
        res.status(429).json({
          success: false,
          message: `Please wait ${canResend.waitTime} seconds before requesting a new OTP`,
          waitTime: canResend.waitTime
        })
        return
      }

      // Get student
      const student = await Student.findById(studentId)

      if (!student) {
        res.status(404).json({ success: false, message: 'Student not found' })
        return
      }

      // Generate and save new OTP
      const otpResult = await OTPService.generateAndSaveOTP(student._id)

      if (!otpResult.success || !otpResult.otp) {
        res.status(500).json({ success: false, message: 'Failed to generate OTP. Please try again.' })
        return
      }

      // Send OTP via email
      const emailSent = await OTPService.sendOTP(student.email, otpResult.otp, student.name)

      if (!emailSent) {
        res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again.' })
        return
      }

      // Track OTP resend
      AnalyticsService.trackOTPAbuse(student.rollNo)

      res.status(200).json({
        success: true,
        message: 'New OTP sent successfully to your registered email'
      })
    } catch (error: any) {
      console.error('Resend OTP error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      })
    }
  }

  /**
   * Get student result (after OTP verification)
   */
  static async getResult(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params

      if (!studentId) {
        res.status(400).json({ success: false, message: 'Student ID is required' })
        return
      }

      const student = await Student.findById(studentId).select('-otp -otpExpiry')

      if (!student) {
        res.status(404).json({ success: false, message: 'Student not found' })
        return
      }

      res.status(200).json({
        success: true,
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          rollNo: student.rollNo,
          institutionName: student.institutionName,
          semester: student.semester,
          sgpa: student.sgpa
        }
      })
    } catch (error: any) {
      console.error('Get result error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      })
    }
  }
}
