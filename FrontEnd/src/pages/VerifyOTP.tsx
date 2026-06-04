import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, Mail } from 'lucide-react'
import { useToast } from '../components/Toast'
import { apiFetch } from '../utils/api'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/student.css'

function VerifyOTP() {
  const location = useLocation();
  const { showToast } = useToast();
  const email = location.state?.email as string | undefined;
  const rollNo = location.state?.rollNo as string | undefined;
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If navigated here without state, redirect back
  useEffect(() => {
    if (!email || !rollNo) {
      showToast('Session expired. Please login again.', 'error');
      navigate('/student/select-institution');
    }
  }, [email, rollNo, navigate, showToast]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      showToast('Enter a valid 6-digit OTP', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiFetch('/student/verify-otp', {
        method: 'POST',
        body: { email, otp: otpValue },
      });
      showToast(data.message || 'OTP verified!', 'success');
      navigate('/student/result', { state: { student: data.student } });
    } catch (err: any) {
      showToast(err.message, 'error');
      // Clear OTP on failure so user can re-enter
      if (err.message.includes('Invalid OTP') || err.message.includes('expired')) {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || !rollNo) {
      showToast('Missing login information. Please try logging in again.', 'error');
      return;
    }
    setResending(true);
    try {
      const data = await apiFetch('/student/login', {
        method: 'POST',
        body: { email, rollNo },
      });
      showToast(data.message || 'OTP resent to your email address!', 'success');
      setTimer(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="student-page">
      <div className="student-card">
        <div className="student-card-header">
          <Link to="/" className="student-logo">
            <div className="student-logo-icon"><BarChart3 size={24} /></div>
            ResultScale
          </Link>
          <h1 className="student-card-title">Verify OTP</h1>
          <p className="student-card-subtitle">Enter the 6-digit code sent to your email</p>
        </div>

        <div className="student-card-body">
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ width: '64px', height: '64px', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#22c55e' }}>
              <Mail size={28} />
            </div>
            {email && (
              <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Sent to <strong>{email}</strong>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="otp-container" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="otp-timer">
              {timer > 0 ? <>Code expires in <span>{formatTime(timer)}</span></> : 'Code expired'}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={otp.some(d => !d) || submitting}
            >
              {submitting ? 'Verifying...' : 'Verify & View Result'}
            </button>
          </form>

          <button
            className="resend-btn"
            onClick={handleResend}
            disabled={!canResend || resending}
          >
            {resending ? 'Resending...' : canResend ? 'Resend OTP' : `Resend in ${formatTime(timer)}`}
          </button>
        </div>

        <div className="student-card-footer">
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Didn&apos;t receive the code? Check your spam folder or{' '}
            <Link to="/student/select-institution" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
              try again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;
