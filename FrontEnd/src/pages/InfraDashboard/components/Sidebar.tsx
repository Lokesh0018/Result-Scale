// ─── Infrastructure Sidebar ────────────────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Activity, Building2, ScrollText,
  Gauge, Settings, ChevronLeft, ChevronRight, BarChart3, LogOut,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { SidebarSection } from '../types'

interface NavItem {
  id: SidebarSection
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview',      label: 'Overview',      icon: <LayoutDashboard size={18} /> },
  { id: 'traffic',       label: 'Live Traffic',  icon: <Activity size={18} /> },
  { id: 'institutions',  label: 'Institutions',  icon: <Building2 size={18} /> },
  { id: 'audit',         label: 'Audit Logs',    icon: <ScrollText size={18} /> },
  { id: 'api',           label: 'API Monitor',   icon: <Gauge size={18} /> },
  { id: 'settings',      label: 'Settings',      icon: <Settings size={18} /> },
]

interface Props {
  active: SidebarSection
  onSelect: (s: SidebarSection) => void
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ active, onSelect, collapsed, onToggle }: Props) {
  const navigate = useNavigate()

  return (
    <motion.aside
      className="infra-sidebar"
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <div className="infra-sidebar-logo">
        <div className="infra-sidebar-logo-icon">
          <BarChart3 size={16} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              className="infra-sidebar-logo-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              ResultScale
            </motion.span>
          )}
        </AnimatePresence>
        <button className="infra-sidebar-collapse" onClick={onToggle}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="infra-sidebar-nav">
        {!collapsed && (
          <motion.div
            className="infra-sidebar-section-label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            PLATFORM
          </motion.div>
        )}
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`infra-nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onSelect(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <span className="infra-nav-icon">{item.icon}</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  className="infra-nav-label"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {active === item.id && (
              <motion.div
                className="infra-nav-glow"
                layoutId="nav-glow"
                transition={{ duration: 0.25 }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="infra-sidebar-footer">
        <div className="infra-sidebar-user">
          <div className="infra-user-avatar">A</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                className="infra-user-info"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="infra-user-name">Super Admin</span>
                <span className="infra-user-role">Platform Owner</span>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button
              className="infra-logout-btn"
              onClick={() => navigate('/')}
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
