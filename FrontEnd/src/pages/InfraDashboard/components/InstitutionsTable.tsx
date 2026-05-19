// ─── Active Institutions Panel ────────────────────────────────────────────────
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Wifi, Database, Activity } from 'lucide-react'
import type { Institution } from '../types'

interface Props {
  institutions: Institution[]
}

const HEALTH_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  healthy:  { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'Healthy' },
  degraded: { bg: 'rgba(249,115,22,0.12)', color: '#f97316', label: 'Degraded' },
  critical: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', label: 'Critical' },
}

const QUEUE_STYLE: Record<string, { bg: string; color: string }> = {
  stable:  { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  queued:  { bg: 'rgba(249,115,22,0.12)', color: '#f97316' },
  spiking: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
  idle:    { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
}

export function InstitutionsTable({ institutions }: Props) {
  const [search, setSearch] = useState('')

  const filtered = institutions.filter(
    i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.region.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div
      className="infra-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="infra-panel-header">
        <div>
          <h3 className="infra-panel-title">Active Institutions</h3>
          <p className="infra-panel-sub">Infrastructure analytics per institution</p>
        </div>
        <div className="infra-search-wrap">
          <Search size={14} className="infra-search-icon" />
          <input
            className="infra-search"
            placeholder="Search institutions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="infra-table-wrap">
        <table className="infra-table">
          <thead>
            <tr>
              <th><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Institution</th>
              <th><Wifi size={12} style={{ display: 'inline', marginRight: 4 }} />Live Traffic</th>
              <th><Database size={12} style={{ display: 'inline', marginRight: 4 }} />Cache Hit</th>
              <th>Queue</th>
              <th>Region</th>
              <th><Activity size={12} style={{ display: 'inline', marginRight: 4 }} />Health</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filtered.map((inst, i) => {
                const hs = HEALTH_STYLE[inst.health]
                const qs = QUEUE_STYLE[inst.queueStatus]
                return (
                  <motion.tr
                    key={inst.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="infra-table-row"
                  >
                    <td>
                      <div className="infra-inst-name">{inst.name}</div>
                      <div className="infra-inst-sub">{inst.requestsPerMin.toLocaleString()} req/min</div>
                    </td>
                    <td>
                      <div className="infra-traffic-bar-wrap">
                        <span className="infra-traffic-val">
                          {inst.liveTraffic >= 1000
                            ? `${(inst.liveTraffic / 1000).toFixed(1)}k`
                            : inst.liveTraffic}
                          /min
                        </span>
                        <div className="infra-traffic-bar">
                          <motion.div
                            className="infra-traffic-fill"
                            animate={{ width: `${Math.min((inst.liveTraffic / 18000) * 100, 100)}%` }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="infra-badge"
                        style={{
                          background:
                            inst.cacheHitRate > 95
                              ? 'rgba(16,185,129,0.12)'
                              : 'rgba(249,115,22,0.12)',
                          color: inst.cacheHitRate > 95 ? '#10b981' : '#f97316',
                        }}
                      >
                        {inst.cacheHitRate.toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span
                        className="infra-badge"
                        style={{ background: qs.bg, color: qs.color }}
                      >
                        {inst.queueStatus.charAt(0).toUpperCase() + inst.queueStatus.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className="infra-region">{inst.region}</span>
                    </td>
                    <td>
                      <span
                        className="infra-badge"
                        style={{ background: hs.bg, color: hs.color }}
                      >
                        <span
                          className="infra-health-dot"
                          style={{ background: hs.color }}
                        />
                        {hs.label}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
