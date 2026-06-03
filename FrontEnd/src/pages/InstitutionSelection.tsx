import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, Search, GraduationCap, Building2, ChevronRight, ArrowLeft, Users, ShieldAlert, MoonStar, Sun } from 'lucide-react'
import { useTheme } from '../components/ThemeProvider'
import { useToast } from '../components/Toast'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/institution-selection.css'

const VITE_RENDER_API_URL = (import.meta as any).env.VITE_RENDER_API_URL;
const VITE_RAILWAY_API_URL = (import.meta as any).env.VITE_RAILWAY_API_URL;

interface Institution {
  _id: string;
  email:string;
  institutionName: string;
  institutionType: string;
  logoUrl?: string;
  students: number;
  portalExpiryDate: string;
}

function InstitutionSelection() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { theme, toggleTheme } = useTheme()
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = () => {
    setLoading(true)
    setError(null)

    const fetchFromUrl = (url: string) => {
      return fetch(`${url}/student/institutions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }).then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch institutions")
        }
        return data
      })
    };

    fetchFromUrl(VITE_RENDER_API_URL)
      .catch((err) => {
        console.warn("Render API failed, trying Railway API as fallback...", err.message);
        return fetchFromUrl(VITE_RAILWAY_API_URL);
      })
      .then((data) => {
        // Only show active and non-expired portals as per business logic
        const activeList = (data.data || []).filter((inst: Institution) => {
          const isExpired = new Date(inst.portalExpiryDate).getTime() < Date.now();
          return !isExpired;
        });
        setInstitutions(activeList);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Something went wrong while loading portals");
        showToast(err.message || "Failed to load institutions", "error");
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // Filter institutions in real-time
  const filteredInstitutions = institutions.filter((inst) =>
    inst.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.institutionType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectInstitution = (instEmail: string) => {
    navigate(`/student/login?institutionEmail=${instEmail}`);
  };

  return (
    <div className="selection-page">
      {/* Header */}
      <header className="selection-header">
        <Link to="/" className="selection-logo-container">
          <div className="selection-logo-icon">
            <BarChart3 size={18} />
          </div>
          ResultScale
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <button onClick={toggleTheme} className="nav-link" style={{ cursor: 'pointer' }}>
            {theme === "light" ? <MoonStar size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="selection-container">
        {/* Back navigation */}
        <Link to="/" className="back-to-home-link" style={{ marginBottom: 'var(--spacing-lg)', display: 'inline-flex' }}>
          <ArrowLeft size={16} />
          Back to home
        </Link>

        {/* Title Section */}
        <div className="selection-title-section">
          <h1 className="selection-title">Select Your Institution</h1>
          <p className="selection-subtitle">Choose your institution to access examination results.</p>
        </div>

        {/* Search Box */}
        <div className="search-section">
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by institution name or type..."
              className="search-input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Display Portals */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading result portals...</p>
          </div>
        ) : error ? (
          <div className="empty-selection-state">
            <div className="empty-state-icon">
              <ShieldAlert size={36} />
            </div>
            <h3 className="empty-state-title">Connection Error</h3>
            <p className="empty-state-desc">{error}</p>
            <button className="btn btn-primary" onClick={fetchInstitutions} style={{ marginTop: 'var(--spacing-md)' }}>
              Try Again
            </button>
          </div>
        ) : filteredInstitutions.length === 0 ? (
          <div className="empty-selection-state">
            <div className="empty-state-icon">
              <Building2 size={36} />
            </div>
            <h3 className="empty-state-title">No Active Institutions</h3>
            <p className="empty-state-desc">
              {searchTerm
                ? `No active institutions found matching "${searchTerm}".`
                : "No active institutions available."}
            </p>
          </div>
        ) : (
          <div className="institution-grid">
            {filteredInstitutions.map((inst) => {
              const fallbackLetters = inst.institutionName
                ? inst.institutionName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                : 'RS';

              return (
                <div
                  key={inst._id}
                  className="institution-card"
                  onClick={() => handleSelectInstitution(inst.email)}
                >
                  <div className="card-header-banner">
                    <div className="institution-logo-wrap">
                      {inst.logoUrl ? (
                        <img
                          src={inst.logoUrl}
                          alt={`${inst.institutionName} Logo`}
                          className="institution-logo-img"
                          onError={(e) => {
                            // If logo fails to load, fallback to text logo
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const fallback = document.createElement('div');
                              fallback.className = 'institution-logo-fallback';
                              fallback.innerText = fallbackLetters;
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <div className="institution-logo-fallback">{fallbackLetters}</div>
                      )}
                    </div>
                    <div className="institution-meta-info">
                      <span className="institution-type-badge">
                        <GraduationCap size={14} />
                        {inst.institutionType || "University"}
                      </span>
                      <span className="badge badge-success" style={{ width: 'fit-content' }}>
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="card-body-content">
                    <h3 className="institution-name-title">{inst.institutionName}</h3>
                    <div className="card-stats-badges">
                      {inst.students > 0 && (
                        <div className="student-count-meta">
                          <Users size={14} />
                          <span>{inst.students} Students</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-action-btn-area">
                    <button className="card-access-button">
                      Access Results
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default InstitutionSelection;
