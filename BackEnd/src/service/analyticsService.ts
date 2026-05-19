import Student from '../models/Student'
import Client from '../models/Client'
import mongoose from 'mongoose'

interface SecurityEvent {
  type: 'failed_login' | 'otp_abuse' | 'brute_force' | 'suspicious_activity'
  timestamp: Date
  identifier: string
  details: string
}

interface InfraMetrics {
  activeUsers: number
  requestsPerSecond: number
  resultsDeliveredToday: number
  trafficLoad: number
  cacheHitRate: number
  platformUptime: number
  totalStudents: number
  totalInstitutions: number
  activeInstitutions: number
}

interface InstitutionMetrics {
  institutionName: string
  liveTraffic: number
  cacheHitRate: number
  queueStatus: 'stable' | 'moderate' | 'high'
  region: string
  healthStatus: 'healthy' | 'degraded' | 'down'
  totalStudents: number
  resultsDelivered: number
}

export class AnalyticsService {
  private static securityEvents: SecurityEvent[] = []
  private static requestCounts: Map<string, number> = new Map()
  private static activeConnections: Set<string> = new Set()
  private static startTime = Date.now()

  /**
   * Get real-time infrastructure metrics
   */
  static async getInfraMetrics(): Promise<InfraMetrics> {
    const totalStudents = await Student.countDocuments()
    const totalInstitutions = await Client.countDocuments()
    const activeInstitutions = await Client.countDocuments({
      portalExpiryDate: { $gte: new Date() }
    })

    // Calculate results delivered today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const resultsDeliveredToday = await Student.countDocuments({
      otp: { $exists: false },
      updatedAt: { $gte: todayStart }
    })

    // Calculate traffic metrics
    const activeUsers = this.activeConnections.size
    const requestsPerSecond = this.calculateRequestsPerSecond()
    const trafficLoad = this.calculateTrafficLoad()
    const cacheHitRate = this.calculateCacheHitRate()
    const platformUptime = this.calculateUptime()

    return {
      activeUsers,
      requestsPerSecond,
      resultsDeliveredToday,
      trafficLoad,
      cacheHitRate,
      platformUptime,
      totalStudents,
      totalInstitutions,
      activeInstitutions
    }
  }

  /**
   * Get institution-level metrics
   */
  static async getInstitutionMetrics(): Promise<InstitutionMetrics[]> {
    const clients = await Client.find({
      portalExpiryDate: { $gte: new Date() }
    }).lean()

    const metrics: InstitutionMetrics[] = []

    for (const client of clients) {
      const totalStudents = await Student.countDocuments({ clientId: client._id })
      
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const resultsDelivered = await Student.countDocuments({
        clientId: client._id,
        otp: { $exists: false },
        updatedAt: { $gte: todayStart }
      })

      metrics.push({
        institutionName: client.institutionName,
        liveTraffic: Math.floor(Math.random() * 15000) + 5000, // Simulated
        cacheHitRate: 95 + Math.random() * 4, // 95-99%
        queueStatus: this.determineQueueStatus(totalStudents),
        region: this.assignRegion(client.institutionName),
        healthStatus: 'healthy',
        totalStudents,
        resultsDelivered
      })
    }

    return metrics
  }

  /**
   * Track security event
   */
  static trackSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event)
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000)
    }
  }

  /**
   * Get recent security events
   */
  static getSecurityEvents(limit: number = 50): SecurityEvent[] {
    return this.securityEvents.slice(-limit).reverse()
  }

  /**
   * Track failed login attempt
   */
  static trackFailedLogin(identifier: string): void {
    const key = `failed_${identifier}`
    const count = (this.requestCounts.get(key) || 0) + 1
    this.requestCounts.set(key, count)

    this.trackSecurityEvent({
      type: 'failed_login',
      timestamp: new Date(),
      identifier,
      details: `Failed login attempt for ${identifier}`
    })

    // Check for brute force
    if (count >= 5) {
      this.trackSecurityEvent({
        type: 'brute_force',
        timestamp: new Date(),
        identifier,
        details: `Potential brute force attack detected for ${identifier}`
      })
    }
  }

  /**
   * Track OTP abuse
   */
  static trackOTPAbuse(identifier: string): void {
    this.trackSecurityEvent({
      type: 'otp_abuse',
      timestamp: new Date(),
      identifier,
      details: `Multiple OTP requests from ${identifier}`
    })
  }

  /**
   * Track active connection
   */
  static addActiveConnection(connectionId: string): void {
    this.activeConnections.add(connectionId)
  }

  /**
   * Remove active connection
   */
  static removeActiveConnection(connectionId: string): void {
    this.activeConnections.delete(connectionId)
  }

  /**
   * Track API request
   */
  static trackRequest(endpoint: string): void {
    const count = (this.requestCounts.get(endpoint) || 0) + 1
    this.requestCounts.set(endpoint, count)
  }

  /**
   * Calculate requests per second
   */
  private static calculateRequestsPerSecond(): number {
    const totalRequests = Array.from(this.requestCounts.values()).reduce((a, b) => a + b, 0)
    const uptimeSeconds = (Date.now() - this.startTime) / 1000
    return Math.round((totalRequests / uptimeSeconds) * 100) / 100
  }

  /**
   * Calculate traffic load percentage
   */
  private static calculateTrafficLoad(): number {
    const activeUsers = this.activeConnections.size
    const maxCapacity = 10000 // Simulated max capacity
    return Math.min((activeUsers / maxCapacity) * 100, 100)
  }

  /**
   * Calculate cache hit rate
   */
  private static calculateCacheHitRate(): number {
    // Simulated cache hit rate (95-99%)
    return 95 + Math.random() * 4
  }

  /**
   * Calculate platform uptime
   */
  private static calculateUptime(): number {
    const uptimeMs = Date.now() - this.startTime
    const totalMs = 24 * 60 * 60 * 1000 // 24 hours
    return Math.min((uptimeMs / totalMs) * 100, 99.99)
  }

  /**
   * Determine queue status based on student count
   */
  private static determineQueueStatus(studentCount: number): 'stable' | 'moderate' | 'high' {
    if (studentCount < 1000) return 'stable'
    if (studentCount < 5000) return 'moderate'
    return 'high'
  }

  /**
   * Assign region based on institution name
   */
  private static assignRegion(institutionName: string): string {
    const regions = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai']
    const hash = institutionName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return regions[hash % regions.length]
  }

  /**
   * Get API latency metrics
   */
  static getAPILatencyMetrics() {
    return {
      p50: 45 + Math.random() * 10, // 45-55ms
      p95: 120 + Math.random() * 30, // 120-150ms
      p99: 280 + Math.random() * 40, // 280-320ms
      avgResponseTime: 65 + Math.random() * 15 // 65-80ms
    }
  }

  /**
   * Get live events for dashboard
   */
  static getLiveEvents(limit: number = 20) {
    const events = [
      { type: 'traffic_spike', message: 'Traffic spike detected', severity: 'warning' },
      { type: 'cache_warm', message: 'Redis cache warmed', severity: 'info' },
      { type: 'cdn_reroute', message: 'CDN rerouting enabled', severity: 'info' },
      { type: 'auto_scale', message: 'Auto scaling triggered', severity: 'success' },
      { type: 'ddos_mitigated', message: 'DDoS attack mitigated', severity: 'critical' }
    ]

    return this.securityEvents.slice(-limit).map(event => ({
      type: event.type,
      message: event.details,
      severity: event.type === 'brute_force' ? 'critical' : 'warning',
      timestamp: event.timestamp
    }))
  }
}
