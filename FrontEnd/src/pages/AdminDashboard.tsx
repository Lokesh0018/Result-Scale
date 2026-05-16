import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  BarChart3, LayoutDashboard, Users, Settings, LogOut, 
  Bell, Search, Building2, UserCheck, Clock, Menu, X,
  Plus, Pencil, Trash2, Mail, Calendar, Shield, Database
} from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/dashboard.css'

const mockClients = [
  { id: 1, name: 'ABC University', email: 'admin@abcuniversity.edu', students: 2500, status: 'active', expiresAt: '2025-06-30' },
  { id: 2, name: 'XYZ College', email: 'results@xyzcollege.edu', students: 1200, status: 'active', expiresAt: '2025-05-15' },
  { id: 3, name: 'Tech Institute', email: 'admin@techinstitute.edu', students: 800, status: 'expired', expiresAt: '2024-12-31' },
  { id: 4, name: 'City College', email: 'results@citycollege.edu', students: 3200, status: 'active', expiresAt: '2025-08-20' },
]

const mockStudents = [
  { id: 1, rollNo: '2024CS001', name: 'John Doe', email: 'john@email.com', institution: 'ABC University', sgpa: 8.5, status: 'published' },
  { id: 2, rollNo: '2024CS002', name: 'Jane Smith', email: 'jane@email.com', institution: 'ABC University', sgpa: 9.2, status: 'published' },
  { id: 3, rollNo: '2024EE001', name: 'Bob Wilson', email: 'bob@email.com', institution: 'XYZ College', sgpa: 7.8, status: 'draft' },
  { id: 4, rollNo: '2024ME001', name: 'Alice Brown', email: 'alice@email.com', institution: 'Tech Institute', sgpa: 8.9, status: 'published' },
  { id: 5, rollNo: '2024CS003', name: 'Charlie Davis', email: 'charlie@email.com', institution: 'City College', sgpa: 7.2, status: 'draft' },
]

function AdminDashboard() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.institution.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNavClick = (section: string) => {
    setActiveSection(section)
    setSearchTerm('')
    setSidebarOpen(false)
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <BarChart3 size={18} />
            </div>
            ResultScale
          </Link>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main</div>
            <button 
              className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            <button 
              className={`nav-item ${activeSection === 'clients' ? 'active' : ''}`}
              onClick={() => handleNavClick('clients')}
            >
              <Building2 size={18} />
              Clients
            </button>
            <button 
              className={`nav-item ${activeSection === 'students' ? 'active' : ''}`}
              onClick={() => handleNavClick('students')}
            >
              <Users size={18} />
              Students
            </button>
          </div>
          
          <div className="nav-section">
            <div className="nav-section-title">System</div>
            <button 
              className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => handleNavClick('settings')}
            >
              <Settings size={18} />
              Settings
            </button>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">A</div>
            <div className="user-details">
              <div className="user-name">Admin User</div>
              <div className="user-role">Super Admin</div>
            </div>
            <button onClick={() => navigate('/')} className="action-btn">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="page-title">
              {activeSection === 'dashboard' && 'Admin Dashboard'}
              {activeSection === 'clients' && 'Client Management'}
              {activeSection === 'students' && 'All Students'}
              {activeSection === 'settings' && 'Settings'}
            </h1>
          </div>
          <div className="header-right">
            <button className="header-btn">
              <Search size={20} />
            </button>
            <button className="header-btn">
              <Bell size={20} />
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Total Clients</span>
                    <div className="stat-card-icon primary">
                      <Building2 size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">24</div>
                  <div className="stat-card-change positive">+3 this month</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Active Portals</span>
                    <div className="stat-card-icon green">
                      <UserCheck size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">18</div>
                  <div className="stat-card-change">75% of total</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Total Students</span>
                    <div className="stat-card-icon blue">
                      <Users size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">12,450</div>
                  <div className="stat-card-change positive">+850 this month</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Expiring Soon</span>
                    <div className="stat-card-icon orange">
                      <Clock size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">5</div>
                  <div className="stat-card-change">Within 30 days</div>
                </div>
              </div>

              {/* Recent Clients Preview */}
              <div className="table-section">
                <div className="table-header">
                  <h2 className="table-title">Recent Clients</h2>
                  <button className="btn btn-outline" onClick={() => setActiveSection('clients')}>
                    View All
                  </button>
                </div>
                
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Institution</th>
                      <th>Email</th>
                      <th>Students</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockClients.slice(0, 3).map((client) => (
                      <tr key={client.id}>
                        <td style={{ fontWeight: 500 }}>{client.name}</td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{client.email}</td>
                        <td>{client.students.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                            {client.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Clients Section */}
          {activeSection === 'clients' && (
            <div className="table-section">
              <div className="table-header">
                <h2 className="table-title">Client Institutions</h2>
                <div className="table-actions">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} />
                    Add Client
                  </button>
                </div>
              </div>
              
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Institution</th>
                    <th>Email</th>
                    <th>Students</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td style={{ fontWeight: 500 }}>{client.name}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{client.email}</td>
                      <td>{client.students.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                          {client.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{client.expiresAt}</td>
                      <td>
                        <button className="action-btn edit">
                          <Pencil size={14} />
                        </button>
                        <button className="action-btn delete">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Students Section */}
          {activeSection === 'students' && (
            <div className="table-section">
              <div className="table-header">
                <h2 className="table-title">All Student Records</h2>
                <div className="table-actions">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Institution</th>
                    <th>Email</th>
                    <th>SGPA</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 500 }}>{student.rollNo}</td>
                      <td>{student.name}</td>
                      <td>{student.institution}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{student.email}</td>
                      <td>{student.sgpa.toFixed(1)}</td>
                      <td>
                        <span className={`badge ${student.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="settings-container">
              <div className="settings-section">
                <h2 className="settings-title">
                  <Shield size={20} />
                  Account Settings
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Admin Email</strong>
                      <span>Primary contact for system notifications</span>
                    </div>
                    <div className="settings-value">
                      <input type="email" className="form-input" defaultValue="admin@resultscale.com" />
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Password</strong>
                      <span>Update your account password</span>
                    </div>
                    <div className="settings-value">
                      <button className="btn btn-outline">Change Password</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-title">
                  <Mail size={20} />
                  Email Configuration
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>SMTP Server</strong>
                      <span>Email server for OTP delivery</span>
                    </div>
                    <div className="settings-value">
                      <input type="text" className="form-input" defaultValue="smtp.resultscale.com" />
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Sender Email</strong>
                      <span>From address for outgoing emails</span>
                    </div>
                    <div className="settings-value">
                      <input type="email" className="form-input" defaultValue="noreply@resultscale.com" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-title">
                  <Calendar size={20} />
                  Default Settings
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>OTP Expiry Time</strong>
                      <span>How long OTP codes remain valid</span>
                    </div>
                    <div className="settings-value">
                      <select className="form-input">
                        <option>5 minutes</option>
                        <option>10 minutes</option>
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                      </select>
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Default Portal Duration</strong>
                      <span>Default client portal access period</span>
                    </div>
                    <div className="settings-value">
                      <select className="form-input">
                        <option>3 months</option>
                        <option>6 months</option>
                        <option>1 year</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-title">
                  <Database size={20} />
                  System
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Database</strong>
                      <span>View database structure documentation</span>
                    </div>
                    <div className="settings-value">
                      <Link to="/database" className="btn btn-outline">View Schema</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--spacing-xl)' }}>
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Client Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Client</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form className="modal-form">
                <div className="form-group">
                  <label className="form-label">Institution Name</label>
                  <input type="text" className="form-input" placeholder="Enter institution name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="Enter email address" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" placeholder="Create password" />
                </div>
                <div className="form-group">
                  <label className="form-label">Portal Expiry Date</label>
                  <input type="date" className="form-input" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>Create Client</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
