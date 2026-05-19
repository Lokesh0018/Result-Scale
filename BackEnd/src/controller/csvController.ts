import { Request, Response } from 'express'
import { CSVService } from '../service/csvService'
import Client from '../models/Client'
import mongoose from 'mongoose'

export class CSVController {
  /**
   * Upload and process CSV file
   */
  static async uploadCSV(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' })
        return
      }

      const clientId = req.body.clientId
      if (!clientId || !mongoose.Types.ObjectId.isValid(clientId)) {
        res.status(400).json({ success: false, message: 'Invalid client ID' })
        return
      }

      // Verify client exists
      const client = await Client.findById(clientId)
      if (!client) {
        res.status(404).json({ success: false, message: 'Institution not found' })
        return
      }

      // Check if portal has expired
      if (new Date() > client.portalExpiryDate) {
        res.status(403).json({ success: false, message: 'Portal access has expired' })
        return
      }

      // Validate and parse CSV
      const validationResult = await CSVService.validateAndParseCSV(req.file.path)

      if (!validationResult.valid) {
        res.status(400).json({
          success: false,
          message: 'CSV validation failed',
          errors: validationResult.errors,
          stats: validationResult.stats
        })
        return
      }

      // Save students to database
      const saveResult = await CSVService.saveStudentsToDatabase(
        validationResult.students,
        new mongoose.Types.ObjectId(clientId),
        client.institutionName
      )

      if (!saveResult.success) {
        res.status(500).json({
          success: false,
          message: 'Failed to save students to database',
          errors: saveResult.errors
        })
        return
      }

      res.status(200).json({
        success: true,
        message: 'CSV uploaded and processed successfully',
        stats: {
          totalRows: validationResult.stats.totalRows,
          savedStudents: saveResult.savedCount,
          institutionName: client.institutionName
        }
      })
    } catch (error: any) {
      console.error('CSV upload error:', error)
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
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
