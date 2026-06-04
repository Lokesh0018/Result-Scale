import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BarChart3, ArrowLeft, GraduationCap, Loader2 } from 'lucide-react'
import { useToast } from '../components/Toast'
import { apiFetch } from '../utils/api'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/auth.css'

function StudentLogin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const institutionEmail = searchParams.get('institutionEmail');
  const [selectedInst, setSelectedInst] = useState<any>(null);
  const [loadingInst, setLoadingInst] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ rollNo: '', email: '' });
  const [errors, setErrors] = useState<{ rollNo?: string; email?: string }>({});

  useEffect(() => {
    if (!institutionEmail) {
      navigate('/student/select-institution');
      return;
    }
    setLoadingInst(true);
    apiFetch('/student/institutions')
      .then((data) => {
        const inst = (data.data || []).find((i: any) => i.email === institutionEmail);
        if (!inst) {
          showToast('Selected institution is not active or has expired.', 'error');
          navigate('/student/select-institution');
          return;
        }
        setSelectedInst(inst);
      })
      .catch((err) => {
        console.error(err);
        showToast('Error loading institution details.', 'error');
        navigate('/student/select-institution');
      })
      .finally(() => setLoadingInst(false));
  }, [institutionEmail, navigate]);

  const validateForm = () => {
    const newErrors: { rollNo?: string; email?: string } = {};
    if (!formData.rollNo.trim()) newErrors.rollNo = 'Roll number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      showToast(Object.values(validationErrors).filter(Boolean)[0] || 'Please fill in all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiFetch('/student/login', {
        method: 'POST',
        body: {
          email: formData.email,
          rollNo: formData.rollNo,
          // Send both — backend resolves clientId from clientEmail
          clientEmail: institutionEmail,
          clientId: selectedInst?._id,
        },
      });
      showToast(data.message || 'OTP sent to your email address!', 'success');
      navigate('/student/verify-otp', {
        state: { email: formData.email, rollNo: formData.rollNo },
      });
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (loadingInst) {
    return (
      <div className="auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)', color: 'var(--color-text-muted)' }}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
          <p>Verifying institution access...</p>
        </div>
      </div>
    );
  }

  const fallbackLetters = selectedInst?.institutionName
    ? selectedInst.institutionName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'RS';

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-form-container">
          <Link to="/student/select-institution" className="back-link">
            <ArrowLeft size={16} />Back to institutions
          </Link>
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon"><BarChart3 size={24} /></div>
            ResultScale
          </Link>
          <div className="auth-header">
            <h1 className="auth-title">Student Login</h1>
            <p className="auth-subtitle">Enter details to access your result portal</p>
          </div>

          {selectedInst && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', margin: 'var(--spacing-sm) 0 var(--spacing-lg) 0', padding: '12px 16px', background: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', width: '100%' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#fee2e2', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, fontWeight: 'bold' }}>
                {selectedInst.logoUrl ? (
                  <img src={selectedInst.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : <span>{fallbackLetters}</span>}
              </div>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Portal Selected</div>
                <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedInst.institutionName}>
                  {selectedInst.institutionName}
                </div>
              </div>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="rollNo">Roll Number</label>
              <input
                id="rollNo" type="text"
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
                id="email" type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
              {submitting ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>

          <div className="auth-divider">
            <div className="auth-divider-line"></div>
            <span className="auth-divider-text">Secure Access</span>
            <div className="auth-divider-line"></div>
          </div>
          <p className="auth-footer">An OTP will be sent to your registered email address for verification.</p>
        </div>
      </div>
      <div className="auth-right student">
        <div className="auth-right-content">
          <div className="auth-right-icon"><GraduationCap size={40} /></div>
          <h2 className="auth-right-title">{selectedInst ? selectedInst.institutionName : 'Student Portal'}</h2>
          <p className="auth-right-description">View your academic results securely with OTP verification. Download or print your result card anytime.</p>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
