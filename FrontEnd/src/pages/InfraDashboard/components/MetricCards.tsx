// ─── Animated Hero Metric Cards ───────────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Zap, CheckCircle, Activity, Database, Shield,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react'
import type { MetricCard } from '../types'

const ICON_MAP: Record<string, React.ReactNode> = {
  Users:       <Users size={20} />,
  Zap:         <Zap size={20} />,
  CheckCircle: <CheckCircle size={20} />,
  Activity:    <Activity size={20} />,
  Database:    <Database size={20} />,
  Shield:      <Shield size={20} />,
}

const COLOR_MAP: Record<string, { bg: string; icon: string; glow: string; border: string }> = {
  blue:    { bg: 'rgba(59,130,246,0.08)',  icon: '#3b82f6', glow: 'rgba(59,130,246,0.25)',  border: 'rgba(59,130,246,0.2)' },
  purple:  { bg: 'rgba(139,92,246,0.08)', icon: '#8b5cf6', glow: 'rgba(139,92,246,0.25)', border: 'rgba(139,92,246,0.2)' },
  emerald: { bg: 'rgba(16,185,129,0.08)', icon: '#10b981', glow: 'rgba(16,185,129,0.25)', border: 'rgba(16,185,129,0.2)' },
  orange:  { bg: 'rgba(249,115,22,0.08)', icon: '#f97316', glow: 'rgba(249,115,22,0.25)',  border: 'rgba(249,115,22,0.2)' },
  cyan:    { bg: 'rgba(6,182,212,0.08)',  icon: '#06b6d4', glow: 'rgba(6,182,212,0.25)',   border: 'rgba(6,182,212,0.2)' },
  green:   { bg: 'rgba(34,197,94,0.08)',  icon: '#22c55e', glow: 'rgba(34,197,94,0.25)',   border: 'rgba(34,197,94,0.2)' },
}

interface Props {
  metrics: MetricCard[]
}

export function MetricCards({ metrics }: Props) {
  return (
    <div className="infra-metrics-grid">
      {metrics.map((m, i) => {
        const c = COLOR_MAP[m.color]
        return (
          <motion.div
            key={m.id}
            className="infra-metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            style={{
              background: `linear-gradient(135deg, var(--infra-card) 0%, ${c.bg} 100%)`,
              border: `1px solid ${c.border}`,
              boxShadow: `0 0 0 0 ${c.glow}`,
            }}
            whileHover={{ scale: 1.02, boxShadow: `0 8px 32px ${c.glow}` }}
          >
            {/* Pulse dot */}
            {m.pulse && (
              <span className="infra-pulse-dot" style={{ background: c.icon }}>
                <span className="infra-pulse-ring" style={{ background: c.icon }} />
              </span>
            )}

            {/* Icon */}
            <div
              className="infra-metric-icon"
              style={{ background: c.bg, color: c.icon, border: `1px solid ${c.border}` }}
            >
              {ICON_MAP[m.icon]}
            </div>

            {/* Value */}
            <AnimatePresence mode="wait">
              <motion.div
                key={m.value}
                className="infra-metric-value"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.25 }}
                style={{ color: c.icon }}
              >
                {m.value}
                {m.unit && <span className="infra-metric-unit">{m.unit}</span>}
              </motion.div>
            </AnimatePresence>

            <div className="infra-metric-label">{m.label}</div>

            {/* Trend */}
            <div className="infra-metric-trend">
              {m.trend === 'up'     && <TrendingUp  size={12} style={{ color: '#10b981' }} />}
              {m.trend === 'down'   && <TrendingDown size={12} style={{ color: '#ef4444' }} />}
              {m.trend === 'stable' && <Minus        size={12} style={{ color: '#6b7280' }} />}
              <span
                style={{
                  color:
                    m.trend === 'up'
                      ? '#10b981'
                      : m.trend === 'down'
                      ? '#ef4444'
                      : '#6b7280',
                }}
              >
                {m.trendValue}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
