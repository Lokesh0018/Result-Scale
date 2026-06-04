import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, ArrowLeft, Building2 } from 'lucide-react'
import { useToast } from '../components/Toast'
import { apiFetch } from '../utils/api'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/auth.css'

function ClientLogin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'client' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('authToken') && localStorage.getItem('userRole') === 'client') {
      navigate('/client/dashboard', { replace: true });
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      showToast(Object.values(validationErrors)[0] || 'Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/client/login', { method: 'POST', body: formData });
      showToast('Login successful! Redirecting...', 'success');
      localStorage.setItem('authToken', data.user.token);
      localStorage.setItem('clientId', data.user._id);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userRole', data.user.role);
      navigate('/client/dashboard');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-form-container">
          <Link to="/" className="back-link"><ArrowLeft size={16} />Back to home</Link>
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon"><BarChart3 size={24} /></div>
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
                id="email" type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="institution@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                autoComplete="username"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password" type="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                autoComplete="current-password"
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>
            <div className="form-row">
              <label className="form-checkbox">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/request-quotation">Request Access</Link>
          </p>
        </div>
      </div>
      <div className="auth-right client">
        <div className="auth-right-content">
          <div className="auth-right-icon"><Building2 size={40} /></div>
          <h2 className="auth-right-title">Institution Portal</h2>
          <p className="auth-right-description">Upload student results, manage access permissions, and track who has viewed their results — all in one place.</p>
        </div>
      </div>
    </div>
  );
}

export default ClientLogin;
