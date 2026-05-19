// ─── Realtime Infrastructure Data Hook ────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  MetricCard,
  Institution,
  InfraEvent,
  TrafficDataPoint,
  RegionNode,
} from './types'

// ── Helpers ──────────────────────────────────────────────────────────────────
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const randFloat = (min: number, max: number) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(1))

const fmt = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

const timeLabel = () => {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes()
    .toString()
    .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

// ── Static region nodes ───────────────────────────────────────────────────────
const BASE_REGIONS: RegionNode[] = [
  { id: 'hyd', city: 'Hyderabad', x: 42, y: 58, traffic: 0, active: true },
  { id: 'che', city: 'Chennai',   x: 44, y: 68, traffic: 0, active: true },
  { id: 'blr', city: 'Bangalore', x: 40, y: 65, traffic: 0, active: true },
  { id: 'mum', city: 'Mumbai',    x: 34, y: 55, traffic: 0, active: true },
  { id: 'del', city: 'Delhi',     x: 40, y: 38, traffic: 0, active: true },
]

// ── Static institution names ──────────────────────────────────────────────────
const INST_NAMES = [
  'IIT Hyderabad',
  'BITS Pilani',
  'VIT Vellore',
  'Amrita University',
  'SRM Institute',
  'Manipal University',
  'Osmania University',
  'Anna University',
]

const REGIONS = ['Mumbai', 'Chennai', 'Hyderabad', 'Bangalore', 'Delhi']

const EVENT_TEMPLATES = [
  { type: 'info'    as const, msg: 'CDN cache warmed for result batch', src: 'CDN' },
  { type: 'success' as const, msg: 'Auto-scaling triggered: +2 nodes', src: 'Scaler' },
  { type: 'warning' as const, msg: 'Traffic spike detected — queue mode active', src: 'Load Balancer' },
  { type: 'info'    as const, msg: 'Redis cache hit rate above 97%', src: 'Cache' },
  { type: 'success' as const, msg: 'DDoS mitigation rules applied', src: 'Security' },
  { type: 'info'    as const, msg: 'Result delivery batch completed', src: 'Queue' },
  { type: 'warning' as const, msg: 'High memory usage on node-3', src: 'Monitor' },
  { type: 'success' as const, msg: 'SSL certificate renewed automatically', src: 'TLS' },
  { type: 'info'    as const, msg: 'Database replica synced', src: 'DB' },
  { type: 'critical'as const, msg: 'Latency spike: p99 > 800ms', src: 'APM' },
  { type: 'success' as const, msg: 'Latency normalised after reroute', src: 'Router' },
  { type: 'info'    as const, msg: 'Scheduled maintenance window skipped', src: 'Ops' },
]

// ── Generate initial institutions ─────────────────────────────────────────────
const makeInstitutions = (): Institution[] =>
  INST_NAMES.map((name, i) => ({
    id: `inst-${i}`,
    name,
    region: REGIONS[i % REGIONS.length],
    liveTraffic: rand(800, 18000),
    cacheHitRate: randFloat(88, 99.5),
    queueStatus: (['stable', 'stable', 'stable', 'queued', 'spiking', 'idle'] as const)[
      rand(0, 5)
    ],
    health: (['healthy', 'healthy', 'healthy', 'degraded'] as const)[rand(0, 3)],
    requestsPerMin: rand(200, 5000),
    lastSeen: 'just now',
  }))

// ── Generate initial traffic history ─────────────────────────────────────────
const makeHistory = (): TrafficDataPoint[] => {
  const pts: TrafficDataPoint[] = []
  const now = Date.now()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 2000)
    const label = `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
    pts.push({
      time: label,
      requests: rand(8000, 16000),
      cached: rand(6000, 14000),
      queued: rand(100, 800),
    })
  }
  return pts
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useInfraData() {
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>(makeInstitutions)
  const [events, setEvents] = useState<InfraEvent[]>([])
  const [trafficHistory, setTrafficHistory] = useState<TrafficDataPoint[]>(makeHistory)
  const [regions, setRegions] = useState<RegionNode[]>(BASE_REGIONS)
  const [uptime] = useState('99.99%')
  const eventIdRef = useRef(0)

  // Build metric cards from current numbers
  const buildMetrics = useCallback(
    (
      activeUsers: number,
      rps: number,
      delivered: number,
      load: number,
      cacheHit: number
    ): MetricCard[] => [
      {
        id: 'active-users',
        label: 'Active Users',
        value: fmt(activeUsers),
        rawValue: activeUsers,
        unit: '',
        trend: 'up',
        trendValue: '+3.2%',
        color: 'blue',
        icon: 'Users',
        pulse: true,
      },
      {
        id: 'rps',
        label: 'Requests / sec',
        value: fmt(rps),
        rawValue: rps,
        unit: '/sec',
        trend: rps > 11000 ? 'up' : 'down',
        trendValue: rps > 11000 ? '+8.1%' : '-2.4%',
        color: 'purple',
        icon: 'Zap',
        pulse: true,
      },
      {
        id: 'delivered',
        label: 'Results Delivered',
        value: fmt(delivered),
        rawValue: delivered,
        unit: '',
        trend: 'up',
        trendValue: '+12.5%',
        color: 'emerald',
        icon: 'CheckCircle',
        pulse: false,
      },
      {
        id: 'load',
        label: 'Traffic Load',
        value: `${load}%`,
        rawValue: load,
        unit: '%',
        trend: load > 80 ? 'up' : 'stable',
        trendValue: load > 80 ? 'High' : 'Normal',
        color: load > 80 ? 'orange' : 'cyan',
        icon: 'Activity',
        pulse: load > 80,
      },
      {
        id: 'cache',
        label: 'Cache Hit Rate',
        value: `${cacheHit}%`,
        rawValue: cacheHit,
        unit: '%',
        trend: 'stable',
        trendValue: 'Optimal',
        color: 'green',
        icon: 'Database',
        pulse: false,
      },
      {
        id: 'uptime',
        label: 'Platform Uptime',
        value: '99.99%',
        rawValue: 99.99,
        unit: '%',
        trend: 'stable',
        trendValue: '30d avg',
        color: 'emerald',
        icon: 'Shield',
        pulse: false,
      },
    ],
    []
  )

  // Initialise
  useEffect(() => {
    setMetrics(
      buildMetrics(
        rand(40000, 55000),
        rand(10000, 14000),
        rand(1100000, 1300000),
        rand(75, 92),
        randFloat(95, 99)
      )
    )
  }, [buildMetrics])

  // Tick every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const activeUsers = rand(40000, 55000)
      const rps = rand(10000, 14000)
      const delivered = rand(1100000, 1300000)
      const load = rand(72, 94)
      const cacheHit = randFloat(94, 99.5)

      setMetrics(buildMetrics(activeUsers, rps, delivered, load, cacheHit))

      // Update institutions
      setInstitutions(prev =>
        prev.map(inst => ({
          ...inst,
          liveTraffic: rand(800, 18000),
          cacheHitRate: randFloat(88, 99.5),
          requestsPerMin: rand(200, 5000),
          lastSeen: 'just now',
        }))
      )

      // Update traffic history (rolling window)
      setTrafficHistory(prev => {
        const next = [
          ...prev.slice(-29),
          {
            time: timeLabel(),
            requests: rand(8000, 16000),
            cached: rand(6000, 14000),
            queued: rand(100, 800),
          },
        ]
        return next
      })

      // Update region traffic
      setRegions(prev =>
        prev.map(r => ({ ...r, traffic: rand(500, 15000) }))
      )

      // Occasionally emit an event (~30% chance per tick)
      if (Math.random() < 0.3) {
        const tpl = EVENT_TEMPLATES[rand(0, EVENT_TEMPLATES.length - 1)]
        const newEvent: InfraEvent = {
          id: `evt-${++eventIdRef.current}`,
          type: tpl.type,
          message: tpl.msg,
          timestamp: new Date(),
          source: tpl.src,
        }
        setEvents(prev => [newEvent, ...prev].slice(0, 50))
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [buildMetrics])

  return { metrics, institutions, events, trafficHistory, regions, uptime }
}
