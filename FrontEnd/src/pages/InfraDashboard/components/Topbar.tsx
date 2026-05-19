// ─── Top Navigation Bar ────────────────────────────────────────────────────────
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Search, MoonStar, Sun, CheckCircle, Menu } from 'lucide-react'
import { useTheme } from '../../../components/ThemeProvider'

interface Props {
  uptime: string
  onMenuToggle: () => void
}

export function Topbar({ uptime, onMenuToggle }: Props) {
  const { theme, toggleTheme } = useTheme()
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="infra-topbar">
      {/* Status banner */}
      <div className="infra-status-banner">
        <CheckCircle size={13} style={{ color: '#10b981' }} />
        <span>Platform Status: <strong>Operational</strong></span>
        <span className="infra-status-sep">·</span>
        <span>{uptime} uptime</span>
      </div>

      {/* Main bar */}
      <div className="infra-topbar-main">
        <div className="infra-topbar-left">
          <button className="infra-topbar-menu" onClick={onMenuToggle}>
            <Menu size={18} />
          </button>
          <motion.div
            className={`infra-search-bar ${searchFocused ? 'focused' : ''}`}
            animate={{ width: searchFocused ? 280 : 220 }}
            transition={{ duration: 0.2 }}
          >
            <Search size={14} className="infra-search-bar-icon" />
            <input
              placeholder="Search institutions, events…"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </motion.div>
        </div>

        <div className="infra-topbar-right">
          {/* Theme toggle */}
          <button className="infra-topbar-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? <MoonStar size={17} /> : <Sun size={17} />}
          </button>

          {/* Notifications */}
          <button className="infra-topbar-btn infra-notif-btn" title="Notifications">
            <Bell size={17} />
            <span className="infra-notif-dot" />
          </button>

          {/* Admin profile */}
          <div className="infra-topbar-profile">
            <div className="infra-topbar-avatar">A</div>
            <div className="infra-topbar-profile-info">
              <span className="infra-topbar-name">Super Admin</span>
              <span className="infra-topbar-role">Platform Owner</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
