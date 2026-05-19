import nodemailer from 'nodemailer'
import Student from '../models/Student'
import mongoose from 'mongoose'

export class OTPService {
  private static transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  /**
   * Generate 6-digit OTP
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Send OTP to student email
   */
  static async sendOTP(email: string, otp: string, studentName: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your ResultScale OTP - Verify Your Identity',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎓 ResultScale</h1>
                <p>Secure Result Delivery Platform</p>
              </div>
              <div class="content">
                <h2>Hello ${studentName},</h2>
                <p>You requested access to view your academic results. Please use the OTP below to verify your identity:</p>
                
                <div class="otp-box">
                  <p style="margin: 0; color: #666; font-size: 14px;">Your One-Time Password</p>
                  <div class="otp-code">${otp}</div>
                  <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
                </div>

                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. ResultScale staff will never ask for your OTP.
                </div>

                <p>If you didn't request this OTP, please ignore this email. Your account remains secure.</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} ResultScale - Scalable Result Delivery Infrastructure</p>
                <p>This is an automated email. Please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `
      }

      await this.transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.error('Failed to send OTP email:', error)
      return false
    }
  }

  /**
   * Generate and save OTP for student
   */
  static async generateAndSaveOTP(studentId: mongoose.Types.ObjectId): Promise<{ success: boolean; otp?: string }> {
    try {
      const otp = this.generateOTP()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await Student.findByIdAndUpdate(studentId, {
        otp,
        otpExpiry
      })

      return { success: true, otp }
    } catch (error) {
      console.error('Failed to generate OTP:', error)
      return { success: false }
    }
  }

  /**
   * Verify OTP
   */
  static async verifyOTP(studentId: mongoose.Types.ObjectId, otp: string): Promise<{ valid: boolean; message: string }> {
    try {
      const student = await Student.findById(studentId)

      if (!student) {
        return { valid: false, message: 'Student not found' }
      }

      if (!student.otp || !student.otpExpiry) {
        return { valid: false, message: 'No OTP generated. Please request a new OTP.' }
      }

      if (new Date() > student.otpExpiry) {
        return { valid: false, message: 'OTP has expired. Please request a new OTP.' }
      }

      if (student.otp !== otp) {
        return { valid: false, message: 'Invalid OTP. Please check and try again.' }
      }

      // Clear OTP after successful verification
      await Student.findByIdAndUpdate(studentId, {
        otp: undefined,
        otpExpiry: undefined
      })

      return { valid: true, message: 'OTP verified successfully' }
    } catch (error) {
      console.error('OTP verification error:', error)
      return { valid: false, message: 'Verification failed. Please try again.' }
    }
  }

  /**
   * Check if OTP can be resent (rate limiting)
   */
  static async canResendOTP(studentId: mongoose.Types.ObjectId): Promise<{ canResend: boolean; waitTime?: number }> {
    try {
      const student = await Student.findById(studentId)

      if (!student || !student.otpExpiry) {
        return { canResend: true }
      }

      const now = new Date()
      const otpGeneratedAt = new Date(student.otpExpiry.getTime() - 10 * 60 * 1000)
      const timeSinceGeneration = now.getTime() - otpGeneratedAt.getTime()
      const minWaitTime = 60 * 1000 // 1 minute

      if (timeSinceGeneration < minWaitTime) {
        const waitTime = Math.ceil((minWaitTime - timeSinceGeneration) / 1000)
        return { canResend: false, waitTime }
      }

      return { canResend: true }
    } catch (error) {
      return { canResend: true }
    }
  }
}
