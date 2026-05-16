import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  BarChart3, LayoutDashboard, Upload, Users, Settings, LogOut, 
  Bell, Search, Menu, X, FileText, UserCheck, Eye, Plus, Pencil, Trash2,
  Mail, Calendar, Shield, Building2, MoonStar, Sun
} from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/dashboard.css'
import { useTheme } from "../components/ThemeProvider";

const mockStudents = [
  { id: 1, rollNo: '2024CS001', name: 'John Doe', email: 'john@email.com', semester: 4, sgpa: 8.5, cgpa: 8.2, status: 'published' },
  { id: 2, rollNo: '2024CS002', name: 'Jane Smith', email: 'jane@email.com', semester: 4, sgpa: 9.2, cgpa: 9.0, status: 'published' },
  { id: 3, rollNo: '2024CS003', name: 'Bob Wilson', email: 'bob@email.com', semester: 4, sgpa: 7.8, cgpa: 7.5, status: 'draft' },
  { id: 4, rollNo: '2024CS004', name: 'Alice Brown', email: 'alice@email.com', semester: 4, sgpa: 8.9, cgpa: 8.7, status: 'published' },
  { id: 5, rollNo: '2024CS005', name: 'Charlie Davis', email: 'charlie@email.com', semester: 4, sgpa: 7.2, cgpa: 7.4, status: 'draft' },
]

function ClientDashboard() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [activeTab, setActiveTab] = useState('upload')
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
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
              className={`nav-item ${activeSection === 'upload' ? 'active' : ''}`}
              onClick={() => handleNavClick('upload')}
            >
              <Upload size={18} />
              Upload Results
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
              <div className="user-name">ABC University</div>
              <div className="user-role">Institution</div>
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
              {activeSection === 'dashboard' && 'Client Dashboard'}
              {activeSection === 'upload' && 'Upload Results'}
              {activeSection === 'students' && 'Student Records'}
              {activeSection === 'settings' && 'Settings'}
            </h1>
          </div>
          <div className="header-right">
            <button onClick={toggleTheme} className="header-btn">
              {theme === "light" ? <MoonStar /> : <Sun />}
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
                    <span className="stat-card-title">Total Students</span>
                    <div className="stat-card-icon primary">
                      <Users size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">2,450</div>
                  <div className="stat-card-change positive">+120 this semester</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Results Published</span>
                    <div className="stat-card-icon green">
                      <FileText size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">2,180</div>
                  <div className="stat-card-change">89% of total</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">Results Viewed</span>
                    <div className="stat-card-icon blue">
                      <Eye size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">1,856</div>
                  <div className="stat-card-change">85% view rate</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-title">OTPs Sent</span>
                    <div className="stat-card-icon orange">
                      <UserCheck size={20} />
                    </div>
                  </div>
                  <div className="stat-card-value">3,420</div>
                  <div className="stat-card-change">This month</div>
                </div>
              </div>

              {/* Recent Students Preview */}
              <div className="table-section">
                <div className="table-header">
                  <h2 className="table-title">Recent Students</h2>
                  <button className="btn btn-outline" onClick={() => setActiveSection('students')}>
                    View All
                  </button>
                </div>
                
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>SGPA</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStudents.slice(0, 3).map((student) => (
                      <tr key={student.id}>
                        <td style={{ fontWeight: 500 }}>{student.rollNo}</td>
                        <td>{student.name}</td>
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
            </>
          )}

          {/* Upload Results Section */}
          {activeSection === 'upload' && (
            <div className="tabs-container">
              <div className="tabs-header">
                <button 
                  className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upload')}
                >
                  CSV Upload
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
                  onClick={() => setActiveTab('manual')}
                >
                  Manual Entry
                </button>
              </div>
              
              <div className="tab-content">
                {activeTab === 'upload' && (
                  <div className="upload-area">
                    <div className="upload-icon">
                      <Upload size={32} />
                    </div>
                    <h3 className="upload-title">Upload CSV File</h3>
                    <p className="upload-description">
                      Drag and drop your CSV file here, or click to browse.
                      <br />
                      Supported format: .csv (max 10MB)
                    </p>
                    <button className="btn btn-primary" style={{ marginTop: 'var(--spacing-lg)' }}>
                      Select File
                    </button>
                    
                    <div className="upload-info">
                      <h4>CSV Format Requirements:</h4>
                      <ul>
                        <li>Headers: roll_no, name, email, semester, sgpa, cgpa</li>
                        <li>All fields are required</li>
                        <li>SGPA and CGPA should be numeric (0-10 scale)</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {activeTab === 'manual' && (
                  <form className="modal-form" style={{ maxWidth: '600px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                      <div className="form-group">
                        <label className="form-label">Roll Number</label>
                        <input type="text" className="form-input" placeholder="e.g., 2024CS005" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Student Name</label>
                        <input type="text" className="form-input" placeholder="Enter full name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" placeholder="student@email.com" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Semester</label>
                        <input type="text" className="form-input" placeholder="e.g., 4" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">SGPA</label>
                        <input type="number" step="0.01" className="form-input" placeholder="e.g., 8.5" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CGPA</label>
                        <input type="number" step="0.01" className="form-input" placeholder="e.g., 8.2" />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
                      Add Student Result
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Students Section */}
          {activeSection === 'students' && (
            <div className="table-section">
              <div className="table-header">
                <h2 className="table-title">Student Records</h2>
                <div className="table-actions">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} />
                    Add Student
                  </button>
                </div>
              </div>
              
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Semester</th>
                    <th>SGPA</th>
                    <th>CGPA</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 500 }}>{student.rollNo}</td>
                      <td>{student.name}</td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{student.email}</td>
                      <td>{student.semester}</td>
                      <td>{student.sgpa.toFixed(1)}</td>
                      <td>{student.cgpa.toFixed(1)}</td>
                      <td>
                        <span className={`badge ${student.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                          {student.status}
                        </span>
                      </td>
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

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="settings-container">
              <div className="settings-section">
                <h2 className="settings-title">
                  <Building2 size={20} />
                  Institution Profile
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Institution Name</strong>
                      <span>Your organization name</span>
                    </div>
                    <div className="settings-value">
                      <input type="text" className="form-input" defaultValue="ABC University" />
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Contact Email</strong>
                      <span>Primary contact for notifications</span>
                    </div>
                    <div className="settings-value">
                      <input type="email" className="form-input" defaultValue="admin@abcuniversity.edu" />
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Portal URL</strong>
                      <span>Your student result portal link</span>
                    </div>
                    <div className="settings-value">
                      <input type="text" className="form-input" defaultValue="results.abcuniversity.edu" readOnly />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-title">
                  <Shield size={20} />
                  Security Settings
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Password</strong>
                      <span>Update your account password</span>
                    </div>
                    <div className="settings-value">
                      <button className="btn btn-outline">Change Password</button>
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Two-Factor Authentication</strong>
                      <span>Add extra security to your account</span>
                    </div>
                    <div className="settings-value">
                      <button className="btn btn-outline">Enable 2FA</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-title">
                  <Mail size={20} />
                  Email Notifications
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>OTP Delivery</strong>
                      <span>Email service for sending OTPs</span>
                    </div>
                    <div className="settings-value">
                      <span className="badge badge-success">Active</span>
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Result Notification</strong>
                      <span>Notify students when results are published</span>
                    </div>
                    <div className="settings-value">
                      <label className="toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-title">
                  <Calendar size={20} />
                  Portal Status
                </h2>
                <div className="settings-card">
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Portal Expiry</strong>
                      <span>Your portal access expires on</span>
                    </div>
                    <div className="settings-value">
                      <span style={{ fontWeight: 500 }}>June 30, 2025</span>
                    </div>
                  </div>
                  <div className="settings-row">
                    <div className="settings-label">
                      <strong>Portal Status</strong>
                      <span>Current portal access status</span>
                    </div>
                    <div className="settings-value">
                      <span className="badge badge-success">Active</span>
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

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Student</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form className="modal-form">
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input type="text" className="form-input" placeholder="Enter roll number" />
                </div>
                <div className="form-group">
                  <label className="form-label">Student Name</label>
                  <input type="text" className="form-input" placeholder="Enter full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="Enter email address" />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input type="number" className="form-input" placeholder="Enter semester" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>Add Student</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientDashboard
