import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, ArrowLeft, GraduationCap } from 'lucide-react'
import { useToast } from '../components/Toast'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/auth.css'
const API_URL = (import.meta as any).env.VITE_API_URL;

function StudentLogin() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    rollNo: '',
    email: ''
  })
  const [errors, setErrors] = useState<{
    rollNo?: string;
    email?: string;
  }>({})

  const validateForm = () => {
    const newErrors: { rollNo?: string; email?: string } = {}

    if (!formData.rollNo.trim()) {
      newErrors.rollNo = 'Roll number is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors).filter(Boolean)
      if (errorMessages.length > 0) {
        showToast(errorMessages[0] || 'Please fill in all required fields', 'error')
      }
      return
    }

    fetch(`${API_URL}/student/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message);
    }).then((data) => {
      showToast('OTP sent to your email address!', 'success');
      navigate('/student/verify-otp', {
        state: {
          email: formData.email,
          rollNo: formData.rollNo,
        },
      });
    }).catch((err: any) => {
      showToast(err.message, "error");
    })
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
              <label className="form-label" htmlFor="rollNo">Roll Number</label>
              <input
                id="rollNo"
                type="text"
                className={`form-input ${errors.rollNo ? 'input-error' : ''}`}
                placeholder="e.g., 2024CS001"
                value={formData.rollNo}
                onChange={(e) => handleInputChange('rollNo', e.target.value)}
              />
              {errors.rollNo && <span className="form-error">{errors.rollNo}</span>}
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
