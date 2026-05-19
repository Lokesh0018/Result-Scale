// ─── Infrastructure Dashboard — Main Entry ────────────────────────────────────
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar }             from './components/Sidebar'
import { Topbar }              from './components/Topbar'
import { OverviewSection }     from './sections/OverviewSection'
import { TrafficSection }      from './sections/TrafficSection'
import { InstitutionsSection } from './sections/InstitutionsSection'
import { AuditSection }        from './sections/AuditSection'
import { ApiSection }          from './sections/ApiSection'
import { SettingsSection }     from './sections/SettingsSection'
import { useInfraData }        from './useInfraData'
import type { SidebarSection } from './types'
import './infra.css'

const PAGE_TITLES: Record<SidebarSection, string> = {
  overview:     'Infrastructure Overview',
  traffic:      'Live Traffic',
  institutions: 'Institutions',
  audit:        'Audit Logs',
  api:          'API Monitoring',
  settings:     'Settings',
}

export default function InfraDashboard() {
  const [section, setSection]   = useState<SidebarSection>('overview')
  const [collapsed, setCollapsed] = useState(false)
  const { metrics, institutions, events, trafficHistory, regions, uptime } = useInfraData()

  return (
    <div className="infra-layout">
      <Sidebar
        active={section}
        onSelect={setSection}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
      />

      <div className={`infra-main ${collapsed ? 'infra-main-collapsed' : ''}`}>
        <Topbar uptime={uptime} onMenuToggle={() => setCollapsed(c => !c)} />

        <div className="infra-content">
          {/* Page heading */}
          <motion.div
            key={section}
            className="infra-page-heading"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="infra-page-title">{PAGE_TITLES[section]}</h2>
            <p className="infra-page-sub">
              {section === 'overview'     && 'Real-time platform health and traffic overview'}
              {section === 'traffic'      && 'Live request volume, latency and regional distribution'}
              {section === 'institutions' && 'Per-institution infrastructure analytics'}
              {section === 'audit'        && 'Admin actions and system event history'}
              {section === 'api'          && 'Endpoint performance and latency percentiles'}
              {section === 'settings'     && 'Platform configuration and infrastructure settings'}
            </p>
          </motion.div>

          {/* Section content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {section === 'overview' && (
                <OverviewSection
                  metrics={metrics}
                  institutions={institutions}
                  events={events}
                  trafficHistory={trafficHistory}
                  regions={regions}
                />
              )}
              {section === 'traffic' && (
                <TrafficSection trafficHistory={trafficHistory} />
              )}
              {section === 'institutions' && (
                <InstitutionsSection institutions={institutions} regions={regions} />
              )}
              {section === 'audit' && (
                <AuditSection events={events} />
              )}
              {section === 'api' && <ApiSection />}
              {section === 'settings' && <SettingsSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
