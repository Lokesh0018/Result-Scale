import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, ArrowLeft, Building2 } from 'lucide-react'
import { useToast } from '../components/Toast'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/auth.css'

function ClientLogin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: "client",
  });
  const [data, setData] = useState<any>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [remember, setRemember] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors);

      showToast(
        errorMessages[0] || "Please fill in all required fields",
        "error"
      );

      return;
    }

    fetch("http://localhost:3000/client/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }
      return data;
    }).then((data) => {
      setData(data);
      showToast("Login successful! Redirecting...", "success");
      localStorage.setItem("clientId",data.user._id);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userRole", data.user.role);
      navigate("/client/dashboard");
    }).catch((err) => {
      showToast(err.message, 'error');
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
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
            <h1 className="auth-title">Client Login</h1>
            <p className="auth-subtitle">Sign in to manage your institution&apos;s results</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="institution@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-row">
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => handleInputChange('remember', e.target.checked)}
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
