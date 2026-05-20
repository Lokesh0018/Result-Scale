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
      console.log('=== Student Login Started ===')
      // Accept either {identifier} or {rollNo, email} from frontend
      const { identifier, rollNo, email } = req.body
      const lookup = (identifier || rollNo || email || '').trim()
      console.log('Lookup value:', lookup)

      if (!lookup) {
        res.status(400).json({
          success: false,
          message: 'Roll number or email is required'
        })
        return
      }

      // Search by roll number or email
      console.log('Searching for student...')
      const student = await Student.findOne({
        $or: [
          { rollNo: lookup },
          { email: lookup.toLowerCase() }
        ]
      })

      if (!student) {
        console.log('Student not found:', lookup)
        AnalyticsService.trackFailedLogin(lookup)
        res.status(404).json({
          success: false,
          message: 'Student not found. Please check your roll number or email and ensure your institution has uploaded the results.'
        })
        return
      }

      console.log('Student found:', student.rollNo, student.name)

      // Generate and save OTP
      console.log('Generating OTP...')
      const otpResult = await OTPService.generateAndSaveOTP(student._id)

      if (!otpResult.success || !otpResult.otp) {
        console.error('Failed to generate OTP')
        res.status(500).json({ 
          success: false, 
          message: 'Failed to generate OTP. Please try again.' 
        })
        return
      }

      console.log('OTP generated successfully')

      // Send OTP via email
      console.log('Sending OTP email...')
      const emailSent = await OTPService.sendOTP(student.email, otpResult.otp, student.name)

      if (!emailSent) {
        console.error('Failed to send OTP email')
        res.status(500).json({ 
          success: false, 
          message: 'Failed to send OTP email. Please check your email address and try again.' 
        })
        return
      }

      console.log('=== Student Login Successful ===')
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your registered email',
        studentId: student._id,
        email: student.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email
      })
    } catch (error: any) {
      console.error('=== Student login error ===')
      console.error('Error:', error)
      console.error('Stack:', error.stack)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
      })
    }
  }

  /**
   * Verify OTP and return student data
   */
  static async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      console.log('=== OTP Verification Started ===')
      // Accept {studentId, otp} or {email, otp} from frontend
      const { studentId, email, otp } = req.body
      console.log('Student ID:', studentId, 'Email:', email)
      console.log('OTP:', otp)

      if ((!studentId && !email) || !otp) {
        res.status(400).json({
          success: false,
          message: 'Student identifier and OTP are required'
        })
        return
      }

      // Resolve student
      let student
      if (studentId) {
        student = await Student.findById(studentId)
      } else {
        student = await Student.findOne({ email: email.trim().toLowerCase() })
      }

      if (!student) {
        res.status(404).json({ success: false, message: 'Student not found' })
        return
      }

      // Verify OTP
      console.log('Verifying OTP...')
      const verificationResult = await OTPService.verifyOTP(student._id, otp)

      if (!verificationResult.valid) {
        console.log('OTP verification failed:', verificationResult.message)
        AnalyticsService.trackSecurityEvent({
          type: 'failed_login',
          timestamp: new Date(),
          identifier: student._id.toString(),
          details: 'Failed OTP verification'
        })

        res.status(400).json({
          success: false,
          message: verificationResult.message
        })
        return
      }

      console.log('OTP verified successfully')

      // Re-fetch student to get latest data (OTP fields cleared)
      const freshStudent = await Student.findById(student._id).select('name email rollNo semester sgpa institutionName')

      if (!freshStudent) {
        res.status(404).json({ success: false, message: 'Student not found' })
        return
      }

      console.log('=== OTP Verification Successful ===')
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        student: {
          rollNo: freshStudent.rollNo,
          name: freshStudent.name,
          email: freshStudent.email,
          semester: freshStudent.semester,
          sgpa: freshStudent.sgpa,
          institutionName: freshStudent.institutionName
        }
      })
    } catch (error: any) {
      console.error('=== OTP verification error ===')
      console.error('Error:', error)
      console.error('Stack:', error.stack)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
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
      console.log('=== Get Student Result ===')
      const { studentId } = req.params
      console.log('Student ID:', studentId)

      if (!studentId) {
        res.status(400).json({ 
          success: false, 
          message: 'Student ID is required' 
        })
        return
      }

      // Only return CSV fields: rollNo, name, semester, sgpa
      const student = await Student.findById(studentId).select('name email rollNo semester sgpa')

      if (!student) {
        console.error('Student not found:', studentId)
        res.status(404).json({ 
          success: false, 
          message: 'Student not found' 
        })
        return
      }

      console.log('Student result retrieved:', student.rollNo)
      res.status(200).json({
        success: true,
        student: {
          rollNo: student.rollNo,
          name: student.name,
          email: student.email,
          semester: student.semester,
          sgpa: student.sgpa
        }
      })
    } catch (error: any) {
      console.error('=== Get result error ===')
      console.error('Error:', error)
      console.error('Stack:', error.stack)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
      })
    }
  }
}
