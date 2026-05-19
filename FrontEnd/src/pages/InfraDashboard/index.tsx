import { useState } from 'react'
import { 
  LayoutDashboard, 
  Activity, 
  Building2, 
  FileText, 
  Gauge, 
  Settings,
  Menu,
  Bell,
  Sun,
  Moon,
  User,
  Search,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Target,
  Percent,
  Clock,
  Database,
  Globe,
  Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInfraData } from './useInfraData'
// @ts-ignore: allow side-effect CSS import without type declarations
import './infra.css'

type Section = 'overview' | 'traffic' | 'institutions' | 'audit' | 'api' | 'settings'

export default function InfraDashboard() {
  const [activeSection, setActiveSection] = useState<Section>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const { connected, metrics, institutions, latency, events } = useInfraData()

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const navItems = [
    { id: 'overview' as Section, label: 'Overview', icon: LayoutDashboard },
    { id: 'traffic' as Section, label: 'Live Traffic', icon: Activity },
    { id: 'institutions' as Section, label: 'Institutions', icon: Building2 },
    { id: 'audit' as Section, label: 'Audit Logs', icon: FileText },
    { id: 'api' as Section, label: 'API Monitoring', icon: Gauge },
    { id: 'settings' as Section, label: 'Settings', icon: Settings }
  ]

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  return (
    <div className="infra-dashboard">
      {/* Sidebar */}
      <aside className={`infra-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Zap size={24} />
            {!sidebarCollapsed && <span>ResultScale</span>}
          </div>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="navbar-icon">
            <Menu size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="infra-main">
        {/* Top Navbar */}
        <nav className="infra-navbar">
          <div className="navbar-status">
            <span className="status-dot"></span>
            <span>Platform Status: {connected ? 'Operational' : 'Connecting...'}</span>
            <span style={{ marginLeft: '12px', opacity: 0.7 }}>
              {metrics.platformUptime.toFixed(2)}% uptime
            </span>
          </div>

          <div className="navbar-actions">
            <div className="navbar-icon">
              <Search size={20} />
            </div>
            <div className="navbar-icon">
              <Bell size={20} />
            </div>
            <div className="navbar-icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div className="navbar-icon">
              <User size={20} />
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <div className="infra-content">
          <AnimatePresence mode="wait">
            {activeSection === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Hero Metrics */}
                <div className="metrics-grid">
                  <MetricCard
                    label="Active Users"
                    value={formatNumber(metrics.activeUsers)}
                    trend={5.2}
                    icon={<Users size={20} />}
                  />
                  <MetricCard
                    label="Requests/sec"
                    value={`${metrics.requestsPerSecond.toFixed(1)}/s`}
                    trend={12.4}
                    icon={<Zap size={20} />}
                  />
                  <MetricCard
                    label="Results Delivered Today"
                    value={formatNumber(metrics.resultsDeliveredToday)}
                    trend={8.7}
                    icon={<Target size={20} />}
                  />
                  <MetricCard
                    label="Traffic Load"
                    value={`${metrics.trafficLoad.toFixed(1)}%`}
                    trend={-2.1}
                    icon={<Activity size={20} />}
                  />
                  <MetricCard
                    label="Cache Hit Rate"
                    value={`${metrics.cacheHitRate.toFixed(1)}%`}
                    trend={0.8}
                    icon={<Percent size={20} />}
                  />
                  <MetricCard
                    label="Platform Uptime"
                    value={`${metrics.platformUptime.toFixed(2)}%`}
                    trend={0.01}
                    icon={<Clock size={20} />}
                  />
                </div>

                {/* Live Events Feed */}
                <div className="events-feed">
                  <div className="section-header">
                    <h2 className="section-title">Live Infrastructure Events</h2>
                  </div>
                  {events.length > 0 ? (
                    events.map((event, index) => (
                      <div key={index} className="event-item">
                        <div className={`event-icon ${event.severity}`}>
                          <Shield size={16} />
                        </div>
                        <div className="event-content">
                          <div className="event-message">{event.message}</div>
                          <div className="event-time">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <Shield size={32} />
                      </div>
                      <div className="empty-title">No Events Yet</div>
                      <div className="empty-description">
                        Infrastructure events will appear here in real-time
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeSection === 'institutions' && (
              <motion.div
                key="institutions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="institutions-section">
                  <div className="section-header">
                    <h2 className="section-title">Active Institutions</h2>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {institutions.length} institutions online
                    </div>
                  </div>

                  {institutions.length > 0 ? (
                    <table className="institutions-table">
                      <thead>
                        <tr>
                          <th>Institution Name</th>
                          <th>Live Traffic</th>
                          <th>Cache Hit Rate</th>
                          <th>Queue Status</th>
                          <th>Region</th>
                          <th>Health Status</th>
                          <th>Total Students</th>
                        </tr>
                      </thead>
                      <tbody>
                        {institutions.map((inst, index) => (
                          <tr key={index}>
                            <td style={{ fontWeight: 500 }}>{inst.institutionName}</td>
                            <td>{formatNumber(inst.liveTraffic)}/min</td>
                            <td>{inst.cacheHitRate.toFixed(1)}%</td>
                            <td>
                              <span className={`status-badge ${inst.queueStatus}`}>
                                {inst.queueStatus}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Globe size={14} />
                                {inst.region}
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${inst.healthStatus}`}>
                                {inst.healthStatus}
                              </span>
                            </td>
                            <td>{formatNumber(inst.totalStudents)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <Building2 size={32} />
                      </div>
                      <div className="empty-title">No Institutions Yet</div>
                      <div className="empty-description">
                        Institutions will appear here once they upload student data
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeSection === 'api' && (
              <motion.div
                key="api"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="institutions-section">
                  <div className="section-header">
                    <h2 className="section-title">API Latency Metrics</h2>
                  </div>

                  <div className="metrics-grid">
                    <MetricCard
                      label="P50 Latency"
                      value={`${latency.p50.toFixed(0)}ms`}
                      trend={-3.2}
                      icon={<Gauge size={20} />}
                    />
                    <MetricCard
                      label="P95 Latency"
                      value={`${latency.p95.toFixed(0)}ms`}
                      trend={-1.8}
                      icon={<Gauge size={20} />}
                    />
                    <MetricCard
                      label="P99 Latency"
                      value={`${latency.p99.toFixed(0)}ms`}
                      trend={2.1}
                      icon={<Gauge size={20} />}
                    />
                    <MetricCard
                      label="Avg Response Time"
                      value={`${latency.avgResponseTime.toFixed(0)}ms`}
                      trend={-2.5}
                      icon={<Clock size={20} />}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {(activeSection === 'traffic' || activeSection === 'audit' || activeSection === 'settings') && (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="empty-state" style={{ marginTop: '100px' }}>
                  <div className="empty-icon">
                    <Database size={32} />
                  </div>
                  <div className="empty-title">Section Under Development</div>
                  <div className="empty-description">
                    This section will be available soon with more infrastructure insights
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

// Metric Card Component
interface MetricCardProps {
  label: string
  value: string
  trend: number
  icon: React.ReactNode
}

function MetricCard({ label, value, trend, icon }: MetricCardProps) {
  return (
    <motion.div
      className="metric-card"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        <div className="metric-icon">{icon}</div>
      </div>
      <div className="metric-value">{value}</div>
      <div className={`metric-trend ${trend < 0 ? 'down' : ''}`}>
        {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{Math.abs(trend).toFixed(1)}% vs last hour</span>
      </div>
    </motion.div>
  )
}
