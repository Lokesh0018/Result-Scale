// ─── Audit Logs Section ───────────────────────────────────────────────────────
import { motion } from 'framer-motion'
import { EventFeed } from '../components/EventFeed'
import type { InfraEvent } from '../types'

interface Props {
  events: InfraEvent[]
}

const AUDIT_ROWS = [
  { actor: 'admin@resultscale.com', action: 'Created client: IIT Hyderabad',    time: '14:32:01', level: 'info' },
  { actor: 'system',                action: 'Auto-scaled to 6 nodes',            time: '14:30:45', level: 'success' },
  { actor: 'admin@resultscale.com', action: 'Updated portal expiry: BITS Pilani',time: '14:28:12', level: 'info' },
  { actor: 'system',                action: 'DDoS mitigation activated',          time: '14:25:00', level: 'warning' },
  { actor: 'admin@resultscale.com', action: 'Deleted client: Old College',        time: '14:20:33', level: 'critical' },
  { actor: 'system',                action: 'Redis cache flushed and rewarmed',   time: '14:18:55', level: 'info' },
  { actor: 'admin@resultscale.com', action: 'Changed SMTP configuration',         time: '14:15:22', level: 'info' },
  { actor: 'system',                action: 'SSL certificate auto-renewed',        time: '14:10:00', level: 'success' },
]

const LEVEL_STYLE: Record<string, { bg: string; color: string }> = {
  info:     { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6' },
  success:  { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
  warning:  { bg: 'rgba(249,115,22,0.1)',  color: '#f97316' },
  critical: { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
}

export function AuditSection({ events }: Props) {
  return (
    <div className="infra-section">
      <motion.div
        className="infra-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="infra-panel-header">
          <div>
            <h3 className="infra-panel-title">Admin Audit Log</h3>
            <p className="infra-panel-sub">All admin actions and system events</p>
          </div>
        </div>
        <div className="infra-table-wrap">
          <table className="infra-table">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Action</th>
                <th>Time</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_ROWS.map((row, i) => {
                const s = LEVEL_STYLE[row.level]
                return (
                  <motion.tr
                    key={i}
                    className="infra-table-row"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td><span className="infra-inst-name">{row.actor}</span></td>
                    <td><span className="infra-inst-sub" style={{ color: 'var(--infra-text)' }}>{row.action}</span></td>
                    <td><span className="infra-event-time">{row.time}</span></td>
                    <td>
                      <span className="infra-badge" style={{ background: s.bg, color: s.color }}>
                        {row.level.toUpperCase()}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <EventFeed events={events} />
    </div>
  )
}
