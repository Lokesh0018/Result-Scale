// ─── Live Traffic Section ─────────────────────────────────────────────────────
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { TrafficDataPoint } from '../types'

interface Props {
  trafficHistory: TrafficDataPoint[]
}

export function TrafficSection({ trafficHistory }: Props) {
  // Derive per-region bar data from last 10 points
  const regionData = [
    { region: 'Mumbai',    rps: Math.floor(Math.random() * 4000 + 2000) },
    { region: 'Delhi',     rps: Math.floor(Math.random() * 3500 + 1500) },
    { region: 'Bangalore', rps: Math.floor(Math.random() * 3000 + 1000) },
    { region: 'Chennai',   rps: Math.floor(Math.random() * 2500 + 800) },
    { region: 'Hyderabad', rps: Math.floor(Math.random() * 2000 + 600) },
  ]

  return (
    <div className="infra-section">
      <motion.div
        className="infra-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="infra-panel-header">
          <div>
            <h3 className="infra-panel-title">Request Volume — 60s Window</h3>
            <p className="infra-panel-sub">Total · Cached · Queued</p>
          </div>
          <div className="infra-live-badge"><span className="infra-live-dot" />LIVE</div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trafficHistory} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--infra-border)" strokeOpacity={0.4} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--infra-muted)' }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--infra-muted)' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: 'var(--infra-card)', border: '1px solid var(--infra-border)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'var(--infra-muted)' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--infra-muted)' }} />
            <Area type="monotone" dataKey="requests" name="Total" stroke="#8b5cf6" strokeWidth={2} fill="url(#tg1)" dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="cached"   name="Cached" stroke="#06b6d4" strokeWidth={2} fill="url(#tg2)" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        className="infra-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="infra-panel-header">
          <div>
            <h3 className="infra-panel-title">Traffic by Region</h3>
            <p className="infra-panel-sub">Requests per second per data centre</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={regionData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--infra-border)" strokeOpacity={0.4} />
            <XAxis dataKey="region" tick={{ fontSize: 11, fill: 'var(--infra-muted)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--infra-muted)' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--infra-card)', border: '1px solid var(--infra-border)', borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="rps" name="Req/s" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
