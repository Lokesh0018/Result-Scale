import fs from 'fs'
import csv from 'csv-parser'
import { CSVStudentRow, ParsedStudent, CSVValidationError, CSVValidationResult } from '../types/csv'
import Student from '../models/Student'
import Client from '../models/Client'
import mongoose from 'mongoose'

export class CSVService {
  /**
   * Validate CSV file and parse student data
   */
  static async validateAndParseCSV(filePath: string): Promise<CSVValidationResult> {
    const errors: CSVValidationError[] = []
    const students: ParsedStudent[] = []
    const seenRollNumbers = new Set<string>()
    const seenEmails = new Set<string>()
    let rowNumber = 0

    return new Promise((resolve) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row: CSVStudentRow) => {
          rowNumber++
          const validationErrors = this.validateRow(row, rowNumber, seenRollNumbers, seenEmails)
          
          if (validationErrors.length > 0) {
            errors.push(...validationErrors)
          } else {
            // Parse valid row
            const student: ParsedStudent = {
              rollNumber: row.rollno.trim(),
              name: row.student_name.trim(),
              email: row.email_address.trim().toLowerCase(),
              semester: parseInt(row.semester),
              scgpa: parseFloat(row.scgpa)
            }
            students.push(student)
            seenRollNumbers.add(student.rollNumber)
            seenEmails.add(student.email)
          }
        })
        .on('end', () => {
          // Clean up uploaded file
          fs.unlinkSync(filePath)

          resolve({
            valid: errors.length === 0,
            errors,
            students,
            stats: {
              totalRows: rowNumber,
              validRows: students.length,
              invalidRows: errors.length
            }
          })
        })
        .on('error', () => {
          // Clean up on error
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
          resolve({
            valid: false,
            errors: [{ row: 0, field: 'file', message: 'Failed to parse CSV file. Please check file format.' }],
            students: [],
            stats: { totalRows: 0, validRows: 0, invalidRows: 0 }
          })
        })
    })
  }

  /**
   * Validate individual CSV row
   */
  private static validateRow(
    row: CSVStudentRow,
    rowNumber: number,
    seenRollNumbers: Set<string>,
    seenEmails: Set<string>
  ): CSVValidationError[] {
    const errors: CSVValidationError[] = []

    // Check required fields
    if (!row.rollno || !row.rollno.trim()) {
      errors.push({ row: rowNumber, field: 'rollno', message: 'Roll number is required' })
    }
    if (!row.student_name || !row.student_name.trim()) {
      errors.push({ row: rowNumber, field: 'student_name', message: 'Student name is required' })
    }
    if (!row.email_address || !row.email_address.trim()) {
      errors.push({ row: rowNumber, field: 'email_address', message: 'Email address is required' })
    }
    if (!row.semester || !row.semester.trim()) {
      errors.push({ row: rowNumber, field: 'semester', message: 'Semester is required' })
    }
    if (!row.scgpa || !row.scgpa.trim()) {
      errors.push({ row: rowNumber, field: 'scgpa', message: 'SGPA is required' })
    }

    // If required fields are missing, return early
    if (errors.length > 0) return errors

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(row.email_address.trim())) {
      errors.push({ row: rowNumber, field: 'email_address', message: 'Invalid email format' })
    }

    // Validate semester (must be a number between 1-8)
    const semester = parseInt(row.semester)
    if (isNaN(semester) || semester < 1 || semester > 8) {
      errors.push({ row: rowNumber, field: 'semester', message: 'Semester must be a number between 1 and 8' })
    }

    // Validate SGPA (must be a number between 0-10)
    const scgpa = parseFloat(row.scgpa)
    if (isNaN(scgpa) || scgpa < 0 || scgpa > 10) {
      errors.push({ row: rowNumber, field: 'scgpa', message: 'SGPA must be a number between 0 and 10' })
    }

    // Check for duplicate roll number in CSV
    const rollno = row.rollno.trim()
    if (seenRollNumbers.has(rollno)) {
      errors.push({ row: rowNumber, field: 'rollno', message: `Duplicate roll number: ${rollno}` })
    }

    // Check for duplicate email in CSV
    const email = row.email_address.trim().toLowerCase()
    if (seenEmails.has(email)) {
      errors.push({ row: rowNumber, field: 'email_address', message: `Duplicate email: ${email}` })
    }

    return errors
  }

  /**
   * Save validated students to database
   */
  static async saveStudentsToDatabase(
    students: ParsedStudent[],
    clientId: mongoose.Types.ObjectId,
    institutionName: string
  ): Promise<{ success: boolean; savedCount: number; errors: string[] }> {
    const errors: string[] = []
    let savedCount = 0

    // Start a session for transaction
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Delete existing students for this client (fresh upload replaces old data)
      await Student.deleteMany({ clientId }, { session })

      // Prepare student documents
      const studentDocs = students.map(student => ({
        clientId,
        name: student.name,
        email: student.email,
        rollNo: student.rollNumber,
        institutionName,
        semester: student.semester,
        sgpa: student.scgpa,
        otp: undefined,
        otpExpiry: undefined
      }))

      // Insert all students
      const result = await Student.insertMany(studentDocs, { session })
      savedCount = result.length

      // Update client's student count
      await Client.findByIdAndUpdate(
        clientId,
        { students: savedCount },
        { session }
      )

      await session.commitTransaction()
      return { success: true, savedCount, errors: [] }
    } catch (error: any) {
      await session.abortTransaction()
      errors.push(error.message || 'Failed to save students to database')
      return { success: false, savedCount: 0, errors }
    } finally {
      session.endSession()
    }
  }

  /**
   * Get student statistics for a client
   */
  static async getClientStatistics(clientId: mongoose.Types.ObjectId) {
    const totalStudents = await Student.countDocuments({ clientId })
    const semesterDistribution = await Student.aggregate([
      { $match: { clientId } },
      { $group: { _id: '$semester', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])

    const avgSGPA = await Student.aggregate([
      { $match: { clientId } },
      { $group: { _id: null, avgSGPA: { $avg: '$sgpa' } } }
    ])

    return {
      totalStudents,
      semesterDistribution,
      averageSGPA: avgSGPA[0]?.avgSGPA || 0
    }
  }
}
