// ─── India Traffic Map ────────────────────────────────────────────────────────
import { motion } from 'framer-motion'
import type { RegionNode } from '../types'

interface Props {
  regions: RegionNode[]
}

// Simplified India SVG path (outline only)
const INDIA_PATH =
  'M 38 18 L 42 16 L 48 17 L 52 20 L 55 24 L 57 28 L 60 30 L 62 35 L 60 40 L 58 44 L 55 48 L 52 52 L 50 56 L 48 60 L 46 64 L 44 68 L 42 72 L 40 75 L 38 72 L 36 68 L 34 64 L 32 60 L 30 56 L 28 52 L 26 48 L 24 44 L 22 40 L 20 36 L 22 32 L 24 28 L 26 24 L 28 20 L 32 18 Z'

const fmt = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString()

export function TrafficMap({ regions }: Props) {
  const maxTraffic = Math.max(...regions.map(r => r.traffic), 1)

  return (
    <motion.div
      className="infra-panel infra-map-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="infra-panel-header">
        <div>
          <h3 className="infra-panel-title">Global Traffic Distribution</h3>
          <p className="infra-panel-sub">Real-time request origin map · India</p>
        </div>
        <div className="infra-live-badge">
          <span className="infra-live-dot" />
          LIVE
        </div>
      </div>

      <div className="infra-map-container">
        <svg
          viewBox="0 0 90 90"
          className="infra-map-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* India outline */}
          <path
            d={INDIA_PATH}
            fill="rgba(139,92,246,0.06)"
            stroke="rgba(139,92,246,0.25)"
            strokeWidth="0.5"
          />

          {/* Grid lines */}
          {[20, 30, 40, 50, 60, 70].map(y => (
            <line
              key={`h${y}`}
              x1="10" y1={y} x2="80" y2={y}
              stroke="var(--infra-border)"
              strokeWidth="0.3"
              strokeOpacity="0.4"
            />
          ))}
          {[20, 30, 40, 50, 60, 70].map(x => (
            <line
              key={`v${x}`}
              x1={x} y1="10" x2={x} y2="80"
              stroke="var(--infra-border)"
              strokeWidth="0.3"
              strokeOpacity="0.4"
            />
          ))}

          {/* Connection lines between nodes */}
          {regions.map((r, i) =>
            regions.slice(i + 1).map(r2 => (
              <motion.line
                key={`${r.id}-${r2.id}`}
                x1={r.x} y1={r.y} x2={r2.x} y2={r2.y}
                stroke="rgba(139,92,246,0.15)"
                strokeWidth="0.4"
                strokeDasharray="1 2"
                animate={{ strokeOpacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              />
            ))
          )}

          {/* Traffic pulse rings + nodes */}
          {regions.map((r, i) => {
            const intensity = r.traffic / maxTraffic
            const radius = 1.5 + intensity * 3
            return (
              <g key={r.id}>
                {/* Outer pulse ring */}
                <motion.circle
                  cx={r.x} cy={r.y}
                  r={radius + 2}
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="0.5"
                  animate={{ r: [radius + 1, radius + 4, radius + 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                />
                {/* Node */}
                <motion.circle
                  cx={r.x} cy={r.y}
                  r={radius}
                  fill="#8b5cf6"
                  fillOpacity={0.8}
                  animate={{ r: [radius * 0.9, radius * 1.1, radius * 0.9] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
                {/* City label */}
                <text
                  x={r.x + radius + 1.5}
                  y={r.y + 1}
                  fontSize="3"
                  fill="var(--infra-text)"
                  fillOpacity="0.8"
                >
                  {r.city}
                </text>
                {/* Traffic label */}
                <text
                  x={r.x + radius + 1.5}
                  y={r.y + 4.5}
                  fontSize="2.5"
                  fill="#8b5cf6"
                  fillOpacity="0.9"
                >
                  {fmt(r.traffic)}/s
                </text>
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="infra-map-legend">
          {regions.map(r => (
            <div key={r.id} className="infra-map-legend-item">
              <span className="infra-map-legend-dot" />
              <span>{r.city}</span>
              <span className="infra-map-legend-val">{fmt(r.traffic)}/s</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
