export interface InfraMetrics {
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

export interface InstitutionMetrics {
  institutionName: string
  liveTraffic: number
  cacheHitRate: number
  queueStatus: 'stable' | 'moderate' | 'high'
  region: string
  healthStatus: 'healthy' | 'degraded' | 'down'
  totalStudents: number
  resultsDelivered: number
}

export interface LiveEvent {
  type: string
  message: string
  severity: 'info' | 'success' | 'warning' | 'critical'
  timestamp: Date
}

export interface APILatency {
  p50: number
  p95: number
  p99: number
  avgResponseTime: number
}

export interface MetricsUpdate {
  metrics: InfraMetrics
  institutions: InstitutionMetrics[]
  latency: APILatency
  events: LiveEvent[]
}
