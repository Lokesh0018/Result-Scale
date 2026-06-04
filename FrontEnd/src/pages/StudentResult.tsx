import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, Printer, Home } from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/student.css'

function StudentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const student = location.state?.student;

  // Guard: if no student data, redirect
  useEffect(() => {
    if (!student) {
      navigate('/student/select-institution', { replace: true });
    }
  }, [student, navigate]);

  if (!student) return null;

  const handlePrint = () => window.print();

  const getSgpaClass = (sgpa: number) => {
    if (sgpa >= 9) return 'grade-a';
    if (sgpa >= 7) return 'grade-b';
    return 'grade-c';
  };

  const getSgpaLabel = (sgpa: number) => {
    if (sgpa >= 9.5) return 'Outstanding';
    if (sgpa >= 9) return 'Excellent';
    if (sgpa >= 8) return 'Very Good';
    if (sgpa >= 7) return 'Good';
    if (sgpa >= 6) return 'Average';
    return 'Below Average';
  };

  return (
    <div className="student-page">
      <div className="result-card">
        <div className="result-header">
          <div className="result-header-logo">
            <div className="result-header-logo-icon"><BarChart3 size={18} /></div>
            ResultScale
          </div>
          <h1 className="result-header-title">Semester Result</h1>
          <p className="result-header-subtitle">{student.institutionName}</p>
        </div>

        <div className="result-body">
          <div className="result-student-info">
            <div className="result-info-item">
              <span className="result-info-label">Student Name</span>
              <span className="result-info-value">{student.name}</span>
            </div>
            <div className="result-info-item">
              <span className="result-info-label">Roll Number</span>
              <span className="result-info-value">{student.rollNo}</span>
            </div>
            <div className="result-info-item">
              <span className="result-info-label">Email</span>
              <span className="result-info-value">{student.email}</span>
            </div>
            <div className="result-info-item">
              <span className="result-info-label">Semester</span>
              <span className="result-info-value">Semester {student.semester}</span>
            </div>
          </div>

          <div className="result-summary" style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className="result-summary-item">
              <div className={`result-summary-value grade-badge ${getSgpaClass(student.sgpa)}`} style={{ padding: '8px 16px', display: 'inline-block' }}>
                {student.sgpa?.toFixed(2) ?? '0.00'}
              </div>
              <div className="result-summary-label">SGPA</div>
            </div>
            <div className="result-summary-item">
              <div className="result-summary-value">{getSgpaLabel(student.sgpa)}</div>
              <div className="result-summary-label">Performance</div>
            </div>
          </div>

          <div style={{ marginTop: 'var(--spacing-lg)', padding: '16px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            <p>This result card shows your SGPA for Semester {student.semester}.</p>
            <p style={{ marginTop: '4px' }}>Contact your institution for detailed subject-wise marks.</p>
          </div>
        </div>

        <div className="result-footer">
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={16} />Print
          </button>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StudentResult;
