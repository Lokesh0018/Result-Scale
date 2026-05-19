// ─── Live Traffic Chart ────────────────────────────────────────────────────────
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { TrafficDataPoint } from '../types'

interface Props {
  data: TrafficDataPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="infra-chart-tooltip">
      <p className="infra-tooltip-time">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  )
}

export function TrafficChart({ data }: Props) {
  return (
    <motion.div
      className="infra-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="infra-panel-header">
        <div>
          <h3 className="infra-panel-title">Live Request Traffic</h3>
          <p className="infra-panel-sub">Rolling 60-second window · updates every 2s</p>
        </div>
        <div className="infra-live-badge">
          <span className="infra-live-dot" />
          LIVE
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradReq" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCached" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradQueued" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f97316" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--infra-border)" strokeOpacity={0.4} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--infra-muted)' }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--infra-muted)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: 'var(--infra-muted)', paddingTop: 8 }}
          />
          <Area
            type="monotone"
            dataKey="requests"
            name="Total Requests"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#gradReq)"
            dot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="cached"
            name="Cached"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#gradCached)"
            dot={false}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="queued"
            name="Queued"
            stroke="#f97316"
            strokeWidth={1.5}
            fill="url(#gradQueued)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
