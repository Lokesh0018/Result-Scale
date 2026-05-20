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
    console.log('=== CSV Validation Started ===')
    console.log('File path:', filePath)
    
    const errors: CSVValidationError[] = []
    const students: ParsedStudent[] = []
    const seenRollNumbers = new Set<string>()
    const seenEmails = new Set<string>()
    let rowNumber = 0

    return new Promise((resolve, reject) => {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error('File does not exist:', filePath)
        return resolve({
          valid: false,
          errors: [{ row: 0, field: 'file', message: 'Uploaded file not found' }],
          students: [],
          stats: { totalRows: 0, validRows: 0, invalidRows: 0 }
        })
      }

      const stream = fs.createReadStream(filePath)
      
      stream
        .pipe(csv({
          mapHeaders: ({ header }) => header.trim().toLowerCase()
        }))
        .on('data', (row: any) => {
          rowNumber++
          console.log(`Processing row ${rowNumber}:`, row)
          
          // Normalize row keys
          const normalizedRow: CSVStudentRow = {
            rollno: row.rollno || row.roll_no || '',
            student_name: row.student_name || row.name || '',
            email_address: row.email_address || row.email || '',
            semester: row.semester || '',
            cgpa: row.cgpa || row.scgpa || row.sgpa || ''
          }
          
          const validationErrors = this.validateRow(normalizedRow, rowNumber, seenRollNumbers, seenEmails)
          
          if (validationErrors.length > 0) {
            console.log(`Row ${rowNumber} has errors:`, validationErrors)
            errors.push(...validationErrors)
          } else {
            // Parse valid row
            const student: ParsedStudent = {
              rollNumber: normalizedRow.rollno.trim(),
              name: normalizedRow.student_name.trim(),
              email: normalizedRow.email_address.trim().toLowerCase(),
              semester: parseInt(normalizedRow.semester),
              cgpa: parseFloat(normalizedRow.cgpa)
            }
            console.log(`Row ${rowNumber} parsed successfully:`, student)
            students.push(student)
            seenRollNumbers.add(student.rollNumber)
            seenEmails.add(student.email)
          }
        })
        .on('end', () => {
          console.log('=== CSV Parsing Complete ===')
          console.log('Total rows:', rowNumber)
          console.log('Valid students:', students.length)
          console.log('Errors:', errors.length)
          
          // Clean up uploaded file
          try {
            fs.unlinkSync(filePath)
            console.log('Uploaded file deleted')
          } catch (err) {
            console.error('Failed to delete uploaded file:', err)
          }

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
        .on('error', (err) => {
          console.error('=== CSV Parsing Error ===')
          console.error('Error:', err)
          
          // Clean up on error
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath)
              console.log('Uploaded file deleted after error')
            }
          } catch (cleanupErr) {
            console.error('Failed to delete file after error:', cleanupErr)
          }
          
          resolve({
            valid: false,
            errors: [{ row: 0, field: 'file', message: `Failed to parse CSV file: ${err.message}` }],
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
    if (!row.cgpa || !row.cgpa.trim()) {
      errors.push({ row: rowNumber, field: 'cgpa', message: 'cgpa is required' })
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

    // Validate cgpa/sgpa (must be a number between 0-10)
    const cgpa = parseFloat(row.cgpa)
    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      errors.push({ row: rowNumber, field: 'cgpa', message: 'CGPA/SGPA must be a number between 0 and 10' })
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
    console.log('=== Saving Students to Database ===')
    console.log('Number of students:', students.length)
    console.log('Client ID:', clientId)
    console.log('Institution:', institutionName)

    try {
      // Delete existing students for this client first (fresh upload replaces old data)
      console.log('Deleting existing students for client...')
      const deleteResult = await Student.deleteMany({ clientId })
      console.log('Deleted students:', deleteResult.deletedCount)

      // Prepare student documents
      const studentDocs = students.map(student => ({
        clientId,
        name: student.name,
        email: student.email,
        rollNo: student.rollNumber,
        institutionName,
        semester: student.semester,
        sgpa: student.cgpa,
      }))
      console.log('Prepared student documents:', studentDocs.length)

      // Insert all students
      console.log('Inserting students...')
      const result = await Student.insertMany(studentDocs, { ordered: false })
      const savedCount = result.length
      console.log('Inserted students:', savedCount)

      // Update client's student count
      console.log('Updating client student count...')
      await Client.findByIdAndUpdate(clientId, { students: savedCount })
      console.log('Client updated')

      console.log('=== Database Save Successful ===')
      return { success: true, savedCount, errors: [] }
    } catch (error: any) {
      console.error('=== Database Save Error ===')
      console.error('Error:', error)
      console.error('Stack:', error.stack)

      return { success: false, savedCount: 0, errors: [error.message || 'Failed to save students to database'] }
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
