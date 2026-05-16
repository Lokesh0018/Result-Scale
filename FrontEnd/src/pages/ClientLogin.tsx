import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, ArrowLeft, Building2 } from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/auth.css'

function ClientLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would authenticate here
    navigate('/client/dashboard')
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
            <h1 className="auth-title">Client Login</h1>
            <p className="auth-subtitle">Sign in to manage your institution&apos;s results</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="institution@example.com"
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
            Don&apos;t have an account? <Link to="/admin/login">Contact Admin</Link>
          </p>
        </div>
      </div>
      
      <div className="auth-right client">
        <div className="auth-right-content">
          <div className="auth-right-icon">
            <Building2 size={40} />
          </div>
          <h2 className="auth-right-title">Institution Portal</h2>
          <p className="auth-right-description">
            Upload student results, manage access permissions, and track 
            who has viewed their results - all in one place.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ClientLogin
