import { Link } from 'react-router-dom'
import { BarChart3, ArrowLeft, Users, Building2, GraduationCap, FileText } from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/student.css'

const collections = [
  {
    name: 'admins',
    icon: 'primary',
    fields: [
      { name: '_id', type: 'ObjectId' },
      { name: 'email', type: 'String' },
      { name: 'password', type: 'String (hashed)' },
      { name: 'name', type: 'String' },
      { name: 'role', type: 'String' },
      { name: 'createdAt', type: 'Date' },
    ]
  },
  {
    name: 'clients',
    icon: 'blue',
    fields: [
      { name: '_id', type: 'ObjectId' },
      { name: 'institutionName', type: 'String' },
      { name: 'email', type: 'String' },
      { name: 'password', type: 'String (hashed)' },
      { name: 'portalExpiresAt', type: 'Date' },
      { name: 'status', type: 'String (enum)' },
      { name: 'createdAt', type: 'Date' },
    ]
  },
  {
    name: 'students',
    icon: 'green',
    fields: [
      { name: '_id', type: 'ObjectId' },
      { name: 'clientId', type: 'ObjectId (ref)' },
      { name: 'rollNumber', type: 'String' },
      { name: 'name', type: 'String' },
      { name: 'email', type: 'String' },
      { name: 'program', type: 'String' },
      { name: 'semester', type: 'Number' },
      { name: 'createdAt', type: 'Date' },
    ]
  },
  {
    name: 'results',
    icon: 'orange',
    fields: [
      { name: '_id', type: 'ObjectId' },
      { name: 'studentId', type: 'ObjectId (ref)' },
      { name: 'clientId', type: 'ObjectId (ref)' },
      { name: 'semester', type: 'Number' },
      { name: 'subjects', type: 'Array<Object>' },
      { name: 'sgpa', type: 'Number' },
      { name: 'cgpa', type: 'Number' },
      { name: 'totalCredits', type: 'Number' },
      { name: 'status', type: 'String (enum)' },
      { name: 'publishedAt', type: 'Date' },
    ]
  },
]

const iconMap: Record<string, React.ReactNode> = {
  primary: <Users size={20} />,
  blue: <Building2 size={20} />,
  green: <GraduationCap size={20} />,
  orange: <FileText size={20} />,
}

function DatabaseStructure() {
  return (
    <div className="database-page">
      <header className="database-header">
        <Link to="/" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <BarChart3 size={18} />
          </div>
          ResultScale
        </Link>
        <Link to="/" className="btn btn-outline">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </header>
      
      <div className="database-content">
        <h1 className="database-title">Database Structure</h1>
        <p className="database-subtitle">
          MongoDB collections schema for the ResultScale platform
        </p>
        
        <div className="collections-grid">
          {collections.map((collection) => (
            <div key={collection.name} className="collection-card">
              <div className="collection-header">
                <div className={`collection-icon ${collection.icon}`}>
                  {iconMap[collection.icon]}
                </div>
                <h2 className="collection-name">{collection.name}</h2>
              </div>
              <div className="collection-body">
                <div className="field-list">
                  {collection.fields.map((field) => (
                    <div key={field.name} className="field-item">
                      <span className="field-name">{field.name}</span>
                      <span className="field-type">{field.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DatabaseStructure
