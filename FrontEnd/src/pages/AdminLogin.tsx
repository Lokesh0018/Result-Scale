import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, ArrowLeft, Settings } from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/auth.css'

function AdminLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would authenticate here
    navigate('/admin/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-form-container">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            Back to home
          </Link>
          
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">
              <BarChart3 size={24} />
            </div>
            ResultScale
          </Link>
          
          <div className="auth-header">
            <h1 className="auth-title">Admin Login</h1>
            <p className="auth-subtitle">Sign in to manage your platform</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="admin@resultscale.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            
            <div className="form-row">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                />
                Remember me
              </label>
              <a href="#" className="form-link">Forgot password?</a>
            </div>
            
            <button type="submit" className="btn btn-primary auth-submit">
              Sign In
            </button>
          </form>
          
          <p className="auth-footer">
            Need help? <a href="#">Contact Support</a>
          </p>
        </div>
      </div>
      
      <div className="auth-right admin">
        <div className="auth-right-content">
          <div className="auth-right-icon">
            <Settings size={40} />
          </div>
          <h2 className="auth-right-title">Admin Dashboard</h2>
          <p className="auth-right-description">
            Manage clients, monitor platform usage, and configure system settings 
            from your centralized admin dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
