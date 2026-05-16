import { Link } from 'react-router-dom'
import { BarChart3, Clock, Mail, Phone, Home } from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/student.css'

function ExpiredAccess() {
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
        </div>
        
        <div className="student-card-body">
          <div className="expired-icon">
            <Clock size={36} />
          </div>
          
          <h1 className="expired-title">Access Expired</h1>
          
          <p className="expired-description">
            The result viewing portal for your institution has expired. 
            Please contact your institution&apos;s administration to request 
            an extension or access to your results.
          </p>
          
          <div className="contact-info">
            <h3 className="contact-title">Contact Your Institution</h3>
            <div className="contact-item">
              <Mail size={16} />
              <span>results@yourinstitution.edu</span>
            </div>
            <div className="contact-item">
              <Phone size={16} />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </div>
        
        <div className="student-card-footer">
          <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ExpiredAccess
