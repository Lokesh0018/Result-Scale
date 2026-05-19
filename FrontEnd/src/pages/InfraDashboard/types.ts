// ─── Infrastructure Dashboard Types ───────────────────────────────────────────

export interface MetricCard {
  id: string
  label: string
  value: string
  rawValue: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  trendValue: string
  color: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'emerald'
  icon: string
  pulse: boolean
}

export interface Institution {
  id: string
  name: string
  region: string
  liveTraffic: number
  cacheHitRate: number
  queueStatus: 'stable' | 'queued' | 'spiking' | 'idle'
  health: 'healthy' | 'degraded' | 'critical'
  requestsPerMin: number
  lastSeen: string
}

export interface InfraEvent {
  id: string
  type: 'info' | 'warning' | 'critical' | 'success'
  message: string
  timestamp: Date
  source: string
}

export interface TrafficDataPoint {
  time: string
  requests: number
  cached: number
  queued: number
}

export interface RegionNode {
  id: string
  city: string
  x: number
  y: number
  traffic: number
  active: boolean
}

export type SidebarSection =
  | 'overview'
  | 'traffic'
  | 'institutions'
  | 'audit'
  | 'api'
  | 'settings'
