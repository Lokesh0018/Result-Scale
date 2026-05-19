import { Request, Response } from 'express'
import { AnalyticsService } from '../service/analyticsService'

export class AnalyticsController {
  /**
   * Get infrastructure metrics
   */
  static async getInfraMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await AnalyticsService.getInfraMetrics()
      res.status(200).json({ success: true, metrics })
    } catch (error: any) {
      console.error('Get infra metrics error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch infrastructure metrics',
        error: error.message
      })
    }
  }

  /**
   * Get institution metrics
   */
  static async getInstitutionMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await AnalyticsService.getInstitutionMetrics()
      res.status(200).json({ success: true, institutions: metrics })
    } catch (error: any) {
      console.error('Get institution metrics error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch institution metrics',
        error: error.message
      })
    }
  }

  /**
   * Get security events
   */
  static async getSecurityEvents(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50
      const events = AnalyticsService.getSecurityEvents(limit)
      res.status(200).json({ success: true, events })
    } catch (error: any) {
      console.error('Get security events error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch security events',
        error: error.message
      })
    }
  }

  /**
   * Get API latency metrics
   */
  static async getAPILatency(req: Request, res: Response): Promise<void> {
    try {
      const latency = AnalyticsService.getAPILatencyMetrics()
      res.status(200).json({ success: true, latency })
    } catch (error: any) {
      console.error('Get API latency error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch API latency metrics',
        error: error.message
      })
    }
  }

  /**
   * Get live events
   */
  static async getLiveEvents(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20
      const events = AnalyticsService.getLiveEvents(limit)
      res.status(200).json({ success: true, events })
    } catch (error: any) {
      console.error('Get live events error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch live events',
        error: error.message
      })
    }
  }
}
