import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, ArrowLeft, GraduationCap } from 'lucide-react'
import { useToast } from '../components/Toast'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/auth.css'

function StudentLogin() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    rollNumber: '',
    email: ''
  })
  const [errors, setErrors] = useState<{ rollNumber?: string; email?: string }>({})

  const validateForm = () => {
    const newErrors: { rollNumber?: string; email?: string } = {}
    
    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required'
    } else if (formData.rollNumber.length < 3) {
      newErrors.rollNumber = 'Please enter a valid roll number'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      const errorMessages = Object.values(errors).filter(Boolean)
      if (errorMessages.length > 0) {
        showToast(errorMessages[0] || 'Please fill in all required fields', 'error')
      }
      return
    }

    showToast('OTP sent to your email address!', 'success')
    setTimeout(() => {
      navigate('/student/verify-otp')
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined })
    }
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
                className={`form-input ${errors.rollNumber ? 'input-error' : ''}`}
                placeholder="e.g., 2024CS001"
                value={formData.rollNumber}
                onChange={(e) => handleInputChange('rollNumber', e.target.value)}
              />
              {errors.rollNumber && <span className="form-error">{errors.rollNumber}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="email">Registered Email</label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
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
