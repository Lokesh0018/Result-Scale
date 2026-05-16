import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, ArrowLeft, GraduationCap } from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/auth.css'

function StudentLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    rollNumber: '',
    email: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send OTP here
    navigate('/student/verify-otp')
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
            <h1 className="auth-title">Student Login</h1>
            <p className="auth-subtitle">Enter your details to receive an OTP</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="rollNumber">Roll Number</label>
              <input
                id="rollNumber"
                type="text"
                className="form-input"
                placeholder="e.g., 2024CS001"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="email">Registered Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary auth-submit">
              Send OTP
            </button>
          </form>
          
          <div className="auth-divider">
            <div className="auth-divider-line"></div>
            <span className="auth-divider-text">Secure Access</span>
            <div className="auth-divider-line"></div>
          </div>
          
          <p className="auth-footer">
            An OTP will be sent to your registered email address for verification.
          </p>
        </div>
      </div>
      
      <div className="auth-right student">
        <div className="auth-right-content">
          <div className="auth-right-icon">
            <GraduationCap size={40} />
          </div>
          <h2 className="auth-right-title">Student Portal</h2>
          <p className="auth-right-description">
            View your academic results securely with OTP verification. 
            Download or print your result card anytime.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StudentLogin
