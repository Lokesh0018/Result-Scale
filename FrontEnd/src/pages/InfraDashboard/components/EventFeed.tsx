// ─── Live Infrastructure Event Feed ───────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, XCircle, Radio } from 'lucide-react'
import type { InfraEvent } from '../types'

interface Props {
  events: InfraEvent[]
}

const TYPE_CONFIG = {
  info:     { icon: <Info size={14} />,          color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  label: 'INFO' },
  success:  { icon: <CheckCircle size={14} />,   color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'OK' },
  warning:  { icon: <AlertTriangle size={14} />, color: '#f97316', bg: 'rgba(249,115,22,0.1)',  label: 'WARN' },
  critical: { icon: <XCircle size={14} />,       color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'CRIT' },
}

const fmtTime = (d: Date) =>
  `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`

export function EventFeed({ events }: Props) {
  return (
    <motion.div
      className="infra-panel infra-event-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <div className="infra-panel-header">
        <div>
          <h3 className="infra-panel-title">
            <Radio size={14} style={{ display: 'inline', marginRight: 6, color: '#ef4444' }} />
            Infrastructure Events
          </h3>
          <p className="infra-panel-sub">Live system event stream</p>
        </div>
        <div className="infra-live-badge">
          <span className="infra-live-dot" />
          LIVE
        </div>
      </div>

      <div className="infra-event-list">
        <AnimatePresence initial={false}>
          {events.slice(0, 18).map(evt => {
            const cfg = TYPE_CONFIG[evt.type]
            return (
              <motion.div
                key={evt.id}
                className="infra-event-item"
                initial={{ opacity: 0, x: 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="infra-event-icon"
                  style={{ color: cfg.color, background: cfg.bg }}
                >
                  {cfg.icon}
                </div>
                <div className="infra-event-body">
                  <span className="infra-event-msg">{evt.message}</span>
                  <div className="infra-event-meta">
                    <span
                      className="infra-event-badge"
                      style={{ color: cfg.color, background: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                    <span className="infra-event-source">{evt.source}</span>
                    <span className="infra-event-time">{fmtTime(evt.timestamp)}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {events.length === 0 && (
          <div className="infra-event-empty">
            <Info size={20} style={{ color: 'var(--infra-muted)' }} />
            <span>Waiting for events…</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
