import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, Mail } from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/student.css'
import { useToast } from '../components/Toast';

const VITE_RENDER_API_URL = (import.meta as any).env.VITE_RENDER_API_URL;
const VITE_RAILWAY_API_URL = (import.meta as any).env.VITE_RAILWAY_API_URL;

function VerifyOTP() {
  const location = useLocation();
  const { showToast } = useToast();
  const email = location.state?.email;
  const rollNo = location.state?.rollNo;
  const navigate = useNavigate()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(300)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  function convertLastChar(str: string): number {
    if (!str) return 0;
    const lastChar = str.at(-1)!;
    if (/\d/.test(lastChar)) {
      return Number(lastChar);
    }
    const code = lastChar.toLowerCase().charCodeAt(0);
    if (code >= 97 && code <= 122) {
      return (code - 97) % 10;
    }
    return 0;
  }

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      showToast("Enter a valid OTP", "error");
      return;
    }

    try {
      const apiUrl =
        convertLastChar(rollNo) % 2 === 0
          ? VITE_RENDER_API_URL
          : VITE_RAILWAY_API_URL;

      const res = await fetch(
        `${apiUrl}/student/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: otpValue,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      showToast(data.message, "success");

      navigate("/student/result", {
        state: {
          student: data.student,
        },
      });
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleResend = async () => {
    if (!email || !rollNo) {
      showToast(
        "Missing login information. Please try logging in again.",
        "error"
      );
      return;
    }

    try {
      const apiUrl =
        convertLastChar(rollNo) % 2 === 0
          ? VITE_RENDER_API_URL
          : VITE_RAILWAY_API_URL;

      const res = await fetch(`${apiUrl}/student/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          rollNo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to resend OTP"
        );
      }

      showToast(
        data.message || "OTP resent to your email address!",
        "success"
      );

      setTimer(300);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);

    } catch (err: any) {
      showToast(err.message, "error");
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="student-page">
      <div className="student-card">
        <div className="student-card-header">
          <Link to="/" className="student-logo">
            <div className="student-logo-icon">
              <BarChart3 size={24} />
            </div>
            ResultScale
          </Link>
          <h1 className="student-card-title">Verify OTP</h1>
          <p className="student-card-subtitle">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div className="student-card-body">
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#f0fdf4',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              color: '#22c55e'
            }}>
              <Mail size={28} />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
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
              {timer > 0 ? (
                <>Code expires in <span>{formatTime(timer)}</span></>
              ) : (
                'Code expired'
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={otp.some(d => !d)}
            >
              Verify & View Result
            </button>
          </form>

          <button
            className="resend-btn"
            onClick={handleResend}
            disabled={!canResend}
          >
            {canResend ? 'Resend OTP' : `Resend in ${formatTime(timer)}`}
          </button>
        </div>

        <div className="student-card-footer">
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Didn&apos;t receive the code? Check your spam folder or{' '}
            <Link to="/student/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
              try again
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP
