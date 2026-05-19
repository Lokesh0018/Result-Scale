// ─── API Monitoring Section ───────────────────────────────────────────────────
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

const ENDPOINTS = [
  { path: 'POST /student/verify-otp', p50: 42,  p95: 88,  p99: 142, rps: 1240, status: 'ok' },
  { path: 'GET  /student/result',     p50: 18,  p95: 45,  p99: 78,  rps: 980,  status: 'ok' },
  { path: 'POST /client/login',       p50: 55,  p95: 120, p99: 210, rps: 340,  status: 'ok' },
  { path: 'GET  /admin/dashboard',    p50: 30,  p95: 65,  p99: 110, rps: 12,   status: 'ok' },
  { path: 'POST /admin/clients',      p50: 70,  p95: 145, p99: 280, rps: 8,    status: 'warn' },
  { path: 'GET  /health',             p50: 2,   p95: 5,   p99: 8,   rps: 60,   status: 'ok' },
]

const LATENCY_DATA = [
  { time: '14:00', p50: 38, p95: 82, p99: 140 },
  { time: '14:05', p50: 42, p95: 90, p99: 155 },
  { time: '14:10', p50: 35, p95: 78, p99: 130 },
  { time: '14:15', p50: 55, p95: 120, p99: 210 },
  { time: '14:20', p50: 48, p95: 100, p99: 175 },
  { time: '14:25', p50: 40, p95: 85, p99: 145 },
  { time: '14:30', p50: 42, p95: 88, p99: 142 },
]

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ok:   { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  warn: { bg: 'rgba(249,115,22,0.1)', color: '#f97316' },
  err:  { bg: 'rgba(239,68,68,0.1)',  color: '#ef4444' },
}

export function ApiSection() {
  return (
    <div className="infra-section">
      {/* Latency chart */}
      <motion.div
        className="infra-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="infra-panel-header">
          <div>
            <h3 className="infra-panel-title">API Latency Percentiles</h3>
            <p className="infra-panel-sub">p50 · p95 · p99 response times (ms)</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={LATENCY_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--infra-border)" strokeOpacity={0.4} />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--infra-muted)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--infra-muted)' }} tickLine={false} axisLine={false} unit="ms" />
            <Tooltip
              contentStyle={{ background: 'var(--infra-card)', border: '1px solid var(--infra-border)', borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="p50" name="p50" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="p95" name="p95" fill="#f97316" radius={[3, 3, 0, 0]} />
            <Bar dataKey="p99" name="p99" fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Endpoint table */}
      <motion.div
        className="infra-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="infra-panel-header">
          <div>
            <h3 className="infra-panel-title">Endpoint Performance</h3>
            <p className="infra-panel-sub">Live latency and throughput per route</p>
          </div>
        </div>
        <div className="infra-table-wrap">
          <table className="infra-table">
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>p50</th>
                <th>p95</th>
                <th>p99</th>
                <th>Req/s</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((ep, i) => {
                const s = STATUS_STYLE[ep.status]
                return (
                  <motion.tr
                    key={i}
                    className="infra-table-row"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td><code className="infra-code">{ep.path}</code></td>
                    <td style={{ color: '#10b981' }}>{ep.p50}ms</td>
                    <td style={{ color: '#f97316' }}>{ep.p95}ms</td>
                    <td style={{ color: '#ef4444' }}>{ep.p99}ms</td>
                    <td>{ep.rps.toLocaleString()}</td>
                    <td>
                      <span className="infra-badge" style={{ background: s.bg, color: s.color }}>
                        {ep.status.toUpperCase()}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
