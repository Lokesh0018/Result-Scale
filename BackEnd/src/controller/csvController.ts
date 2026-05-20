import { Request, Response } from 'express'
import { CSVService } from '../service/csvService'
import Client from '../models/Client'
import mongoose from 'mongoose'

export class CSVController {
  /**
   * Upload and process CSV file
   */
  static async uploadCSV(req: Request, res: Response): Promise<void> {
    console.log('=== CSV Upload Started ===')
    console.log('File:', req.file)
    console.log('Body:', req.body)
    
    try {
      // Validate file upload
      if (!req.file) {
        console.error('No file uploaded')
        res.status(400).json({ 
          success: false, 
          message: 'No CSV file uploaded. Please select a file.' 
        })
        return
      }

      // Validate file type
      if (!req.file.originalname.endsWith('.csv')) {
        console.error('Invalid file type:', req.file.originalname)
        res.status(400).json({ 
          success: false, 
          message: 'Invalid file type. Please upload a CSV file.' 
        })
        return
      }

      // Validate client ID
      const clientId = req.body.clientId
      console.log('Client ID:', clientId)
      
      if (!clientId) {
        console.error('Client ID missing')
        res.status(400).json({ 
          success: false, 
          message: 'Client ID is required' 
        })
        return
      }

      if (!mongoose.Types.ObjectId.isValid(clientId)) {
        console.error('Invalid client ID format:', clientId)
        res.status(400).json({ 
          success: false, 
          message: 'Invalid client ID format' 
        })
        return
      }

      // Verify client exists
      console.log('Finding client...')
      const client = await Client.findById(clientId)
      if (!client) {
        console.error('Client not found:', clientId)
        res.status(404).json({ 
          success: false, 
          message: 'Institution not found. Please contact administrator.' 
        })
        return
      }
      console.log('Client found:', client.institutionName)

      // Check if portal has expired
      if (new Date() > client.portalExpiryDate) {
        console.error('Portal expired for client:', clientId)
        res.status(403).json({ 
          success: false, 
          message: 'Portal access has expired. Please contact administrator to renew access.' 
        })
        return
      }

      // Validate and parse CSV
      console.log('Parsing CSV file:', req.file.path)
      const validationResult = await CSVService.validateAndParseCSV(req.file.path)
      console.log('Validation result:', validationResult)

      if (!validationResult.valid) {
        console.error('CSV validation failed:', validationResult.errors)
        res.status(400).json({
          success: false,
          message: 'CSV validation failed. Please fix the errors and try again.',
          errors: validationResult.errors,
          stats: validationResult.stats
        })
        return
      }

      // Check if CSV has data
      if (validationResult.students.length === 0) {
        console.error('CSV has no valid student data')
        res.status(400).json({
          success: false,
          message: 'CSV file contains no valid student data'
        })
        return
      }

      // Save students to database
      console.log('Saving students to database...')
      const saveResult = await CSVService.saveStudentsToDatabase(
        validationResult.students,
        new mongoose.Types.ObjectId(clientId),
        client.institutionName
      )
      console.log('Save result:', saveResult)

      if (!saveResult.success) {
        console.error('Failed to save students:', saveResult.errors)
        res.status(500).json({
          success: false,
          message: 'Failed to save students to database',
          errors: saveResult.errors
        })
        return
      }

      console.log('=== CSV Upload Successful ===')
      res.status(200).json({
        success: true,
        message: `Successfully uploaded ${saveResult.savedCount} student records`,
        stats: {
          totalRows: validationResult.stats.totalRows,
          savedStudents: saveResult.savedCount,
          institutionName: client.institutionName
        }
      })
    } catch (error: any) {
      console.error('=== CSV Upload Error ===')
      console.error('Error:', error)
      console.error('Stack:', error.stack)
      
      // Clean up file if it exists
      if (req.file && req.file.path) {
        try {
          const fs = require('fs')
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path)
            console.log('Cleaned up uploaded file after error')
          }
        } catch (cleanupErr) {
          console.error('Failed to cleanup file:', cleanupErr)
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error during CSV upload',
        error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
      })
    }
  }

  /**
   * Get CSV upload statistics for a client
   */
  static async getUploadStats(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params

      if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
        res.status(400).json({ success: false, message: 'Invalid client ID' })
        return
      }

      const stats = await CSVService.getClientStatistics(new mongoose.Types.ObjectId(clientId))

      res.status(200).json({
        success: true,
        stats
      })
    } catch (error: any) {
      console.error('Get upload stats error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      })
    }
  }

  /**
   * Delete all students for a client (clear data)
   */
  static async clearStudentData(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params

      if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
        res.status(400).json({ success: false, message: 'Invalid client ID' })
        return
      }

      const client = await Client.findById(clientId)
      if (!client) {
        res.status(404).json({ success: false, message: 'Institution not found' })
        return
      }

      // Delete all students for this client
      const Student = (await import('../models/Student')).default
      await Student.deleteMany({ clientId: new mongoose.Types.ObjectId(clientId) })

      // Update client's student count
      await Client.findByIdAndUpdate(clientId, { students: 0 })

      res.status(200).json({
        success: true,
        message: 'All student data cleared successfully'
      })
    } catch (error: any) {
      console.error('Clear student data error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to clear student data',
        error: error.message
      })
    }
  }
}
