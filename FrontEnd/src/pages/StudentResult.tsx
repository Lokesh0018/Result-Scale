import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Printer, Download, Home } from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/student.css'

function StudentResult() {
  const location = useLocation()
  const student = location.state?.student

  if (!student) {
    return (
      <div className="student-page">
        <div className="result-card">
          <div className="result-header">
            <div className="result-header-logo">
              <div className="result-header-logo-icon">
                <BarChart3 size={18} />
              </div>
              ResultScale
            </div>
            <h1 className="result-header-title">No Result Found</h1>
            <p className="result-header-subtitle">Please login to view your result</p>
          </div>
          <div className="result-footer">
            <Link to="/student/login" className="btn btn-primary">
              <Home size={16} />
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="student-page">
      <div className="result-card">
        <div className="result-header">
          <div className="result-header-logo">
            <div className="result-header-logo-icon">
              <BarChart3 size={18} />
            </div>
            ResultScale
          </div>
          <h1 className="result-header-title">Semester Result</h1>
          <p className="result-header-subtitle">Academic Year 2024-25</p>
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
              <span className="result-info-label">Semester</span>
              <span className="result-info-value">{student.semester}</span>
            </div>
            {student.institutionName && (
              <div className="result-info-item">
                <span className="result-info-label">Institution</span>
                <span className="result-info-value">{student.institutionName}</span>
              </div>
            )}
          </div>

          <div className="result-summary" style={{ marginTop: 'var(--spacing-xl)' }}>
            <div className="result-summary-item">
              <div className="result-summary-value">{student.sgpa ? student.sgpa.toFixed(2) : 'N/A'}</div>
              <div className="result-summary-label">SCGPA</div>
            </div>
          </div>

          <div style={{ 
            marginTop: 'var(--spacing-xl)', 
            padding: 'var(--spacing-md)', 
            background: 'var(--color-bg-secondary)', 
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              This result is generated from the uploaded CSV data by your institution.
              <br />
              For detailed subject-wise grades, please contact your institution.
            </p>
          </div>
        </div>

        <div className="result-footer">
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={16} />
            Print
          </button>
          <button className="btn btn-outline">
            <Download size={16} />
            Download PDF
          </button>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default StudentResult
