// ─── Settings Section ─────────────────────────────────────────────────────────
import { motion } from 'framer-motion'
import { Shield, Mail, Database, Gauge, Server } from 'lucide-react'

export function SettingsSection() {
  return (
    <div className="infra-section">
      <motion.div
        className="infra-settings-grid"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Account */}
        <div className="infra-panel">
          <div className="infra-panel-header">
            <h3 className="infra-panel-title">
              <Shield size={16} style={{ display: 'inline', marginRight: 6, color: '#8b5cf6' }} />
              Account Security
            </h3>
          </div>
          <div className="infra-settings-rows">
            <div className="infra-settings-row">
              <div>
                <div className="infra-settings-label">Admin Email</div>
                <div className="infra-settings-hint">Primary contact for alerts</div>
              </div>
              <input className="infra-settings-input" defaultValue="admin@resultscale.com" />
            </div>
            <div className="infra-settings-row">
              <div>
                <div className="infra-settings-label">Password</div>
                <div className="infra-settings-hint">Last changed 30 days ago</div>
              </div>
              <button className="infra-settings-btn">Change Password</button>
            </div>
            <div className="infra-settings-row">
              <div>
                <div className="infra-settings-label">Two-Factor Auth</div>
                <div className="infra-settings-hint">TOTP authenticator app</div>
              </div>
              <span className="infra-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Enabled</span>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="infra-panel">
          <div className="infra-panel-header">
            <h3 className="infra-panel-title">
              <Mail size={16} style={{ display: 'inline', marginRight: 6, color: '#06b6d4' }} />
              Email / SMTP
            </h3>
          </div>
          <div className="infra-settings-rows">
            <div className="infra-settings-row">
              <div>
                <div className="infra-settings-label">SMTP Host</div>
                <div className="infra-settings-hint">Outbound mail server</div>
              </div>
              <input className="infra-settings-input" defaultValue="smtp.resultscale.com" />
            </div>
            <div className="infra-settings-row">
              <div>
                <div className="infra-settings-label">Sender Address</div>
                <div className="infra-settings-hint">From field for OTP emails</div>
              </div>
              <input className="infra-settings-input" defaultValue="noreply@resultscale.com" />
            </div>
          </div>
        </div>

        {/* Infrastructure */}
        <div className="infra-panel">
          <div className="infra-panel-header">
            <h3 className="infra-panel-title">
              <Server size={16} style={{ display: 'inline', marginRight: 6, color: '#f97316' }} />
              Infrastructure
            </h3>
          </div>
          <div className="infra-settings-rows">
            <div className="infra-settings-row">
              <div>
                <div className="infra-settings-label">Auto-Scaling</div>
                <div className="infra-settings-hint">Scale nodes on traffic spike</div>
              </div>
              <span className="infra-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Active</span>
            </div>
            <div className="infra-settings-row">
              <div>
                <div className="infra-settings-label">Max Nodes</div>
                <div className="infra-settings-hint">Upper limit for auto-scale</div>
              </div>
              <input className="infra-settings-input" defaultValue="12" style={{ width: 80 }} />
            </div>
            <div className="infra-settings-row">
              <div>
                <div className="infra-settings-label">Queue Mode Threshold</div>
                <div className="infra-settings-hint">Activate queue above N req/s</div>
              </div>
              <input className="infra-settings-input" defaultValue="10000" style={{ width: 100 }} />
            </div>
          </div>
        </div>

        {/* Cache */}
        <div className="infra-panel">
          <div className="infra-panel-header">
            <h3 className="infra-panel-title">
              <Database size={16} style={{ display: 'inline', marginRight: 6, color: '#10b981' }} />
              Cache & Database
            </h3>
          </div>
          <div className="infra-settings-rows">
            <div className="infra-settings-row">
              <div>
                <div className="infra-settings-label">Redis TTL</div>
                <div className="infra-settings-hint">Result cache expiry</div>
              </div>
              <select className="infra-settings-input">
                <option>5 minutes</option>
                <option>10 minutes</option>
                <option>30 minutes</option>
              </select>
            </div>
            <div className="infra-settings-row">
              <div>
                <div className="infra-settings-label">OTP Expiry</div>
                <div className="infra-settings-hint">One-time password validity</div>
              </div>
              <select className="infra-settings-input">
                <option>5 minutes</option>
                <option>10 minutes</option>
                <option>15 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="infra-panel">
          <div className="infra-panel-header">
            <h3 className="infra-panel-title">
              <Gauge size={16} style={{ display: 'inline', marginRight: 6, color: '#ef4444' }} />
              Rate Limiting
            </h3>
          </div>
          <div className="infra-settings-rows">
            <div className="infra-settings-row">
              <div>
                <div className="infra-settings-label">Global Rate Limit</div>
                <div className="infra-settings-hint">Max requests per IP per minute</div>
              </div>
              <input className="infra-settings-input" defaultValue="300" style={{ width: 80 }} />
            </div>
            <div className="infra-settings-row">
              <div>
                <div className="infra-settings-label">OTP Rate Limit</div>
                <div className="infra-settings-hint">Max OTP requests per student</div>
              </div>
              <input className="infra-settings-input" defaultValue="5" style={{ width: 80 }} />
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ marginTop: 24 }}>
        <button className="infra-save-btn">Save All Changes</button>
      </div>
    </div>
  )
}
