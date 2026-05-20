import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Printer, Download, Home } from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/student.css'

function StudentResult() {
  const location = useLocation()
  const student = location.state?.student

  const mockResult = {
    student: student || { name: 'N/A', rollNo: 'N/A', program: 'B.Tech', semester: 'N/A', sgpa: 0 },
    subjects: [
      { code: 'CS401', name: 'Data Structures', credits: 4, grade: 'A', points: 9 },
      { code: 'CS402', name: 'Database Systems', credits: 4, grade: 'A+', points: 10 },
      { code: 'CS403', name: 'Operating Systems', credits: 3, grade: 'B+', points: 8 },
      { code: 'CS404', name: 'Computer Networks', credits: 3, grade: 'A', points: 9 },
      { code: 'CS405', name: 'Software Engineering', credits: 3, grade: 'B', points: 7 },
      { code: 'CS406', name: 'Mathematics IV', credits: 3, grade: 'A', points: 9 },
    ],
    cgpa: 8.42,
    totalCredits: 20,
  }

  const getGradeClass = (grade: string) => {
    if (grade.startsWith('A')) return 'grade-a'
    if (grade.startsWith('B')) return 'grade-b'
    return 'grade-c'
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
              <span className="result-info-value">{mockResult.student.name}</span>
            </div>
            <div className="result-info-item">
              <span className="result-info-label">Roll Number</span>
              <span className="result-info-value">{mockResult.student.rollNo}</span>
            </div>
            <div className="result-info-item">
              <span className="result-info-label">Program</span>
              <span className="result-info-value">B.Tech</span>
            </div>
            <div className="result-info-item">
              <span className="result-info-label">Semester</span>
              <span className="result-info-value">{mockResult.student.semester}</span>
            </div>
          </div>

          <h3 className="result-grades-title">Subject-wise Grades</h3>
          <table className="result-grades-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject</th>
                <th>Credits</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {mockResult.subjects.map((subject) => (
                <tr key={subject.code}>
                  <td style={{ fontWeight: 500, fontFamily: 'monospace' }}>{subject.code}</td>
                  <td>{subject.name}</td>
                  <td>{subject.credits}</td>
                  <td>
                    <span className={`grade-badge ${getGradeClass(subject.grade)}`}>
                      {subject.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="result-summary">
            <div className="result-summary-item">
              <div className="result-summary-value">{mockResult.student.sgpa?.toFixed(2) ?? '0.00'}</div>
              <div className="result-summary-label">SGPA</div>
            </div>
            <div className="result-summary-item">
              <div className="result-summary-value">{mockResult.cgpa.toFixed(2)}</div>
              <div className="result-summary-label">CGPA</div>
            </div>
            <div className="result-summary-item">
              <div className="result-summary-value">{mockResult.totalCredits}</div>
              <div className="result-summary-label">Total Credits</div>
            </div>
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
