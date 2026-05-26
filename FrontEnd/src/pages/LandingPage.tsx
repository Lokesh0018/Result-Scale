import { Link } from 'react-router-dom'
import { BarChart3, Shield, Clock, Upload, Users, ChevronRight, Check, GraduationCap, Building2, Settings, MoonStar, Sun, Server } from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/landing.css'
import { useTheme } from "../components/ThemeProvider";

function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <BarChart3 size={20} />
          </div>
          ResultScale
        </Link>
        <nav className="header-nav">
          <button onClick={toggleTheme} className="nav-link">
            {theme === "light" ? <MoonStar /> : <Sun />}
          </button>
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#about" className="nav-link">About</a>
          <Link to="/database" className="nav-link">Database</Link>
          <Link to="/admin/login" className="btn btn-primary">Get Started</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-left">
          <div className="hero-badge">
            <Shield size={16} />
            Secure & Reliable
          </div>
          <h1 className="hero-title">
            Simple Result Hosting for <span>Educational Institutions</span>
          </h1>
          <p className="hero-description">
            A beginner-friendly platform to securely host, manage, and share student results
            with OTP verification and time-based access control.
          </p>
          <div className="hero-buttons">
            <Link to="/admin/login" className="btn btn-primary btn-lg">
              Start Free Trial
              <ChevronRight size={20} />
            </Link>
            <Link to="/database" className="btn btn-outline btn-lg">
              View Database Schema
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">🚀</div>
              <div className="stat-label">Ready to Empower Institutions</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">✨</div>
              <div className="stat-label">Built for Seamless Result Hosting</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">🔒</div>
              <div className="stat-label">Secure & Scalable from Day One</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <h2 className="portals-title">Choose Your Portal</h2>
          <div className="portals-grid">
            <Link to="/admin/login" className="portal-card">
              <div className="portal-icon admin">
                <Settings size={24} />
              </div>
              <div className="portal-content">
                <div className="portal-title">Admin Portal</div>
                <div className="portal-description">Manage clients and platform settings</div>
              </div>
              <ChevronRight size={20} className="portal-arrow" />
            </Link>

            <Link to="/client/login" className="portal-card">
              <div className="portal-icon client">
                <Building2 size={24} />
              </div>
              <div className="portal-content">
                <div className="portal-title">Client Portal</div>
                <div className="portal-description">Upload and manage student results</div>
              </div>
              <ChevronRight size={20} className="portal-arrow" />
            </Link>

            <Link to="/student/login" className="portal-card">
              <div className="portal-icon student">
                <GraduationCap size={24} />
              </div>
              <div className="portal-content">
                <div className="portal-title">Student Portal</div>
                <div className="portal-description">View your results securely</div>
              </div>
              <ChevronRight size={20} className="portal-arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-badge">Features</span>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-description">
            Powerful features designed to make result management simple and secure
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={28} />
            </div>
            <h3 className="feature-title">OTP Verification</h3>
            <p className="feature-description">
              Secure access with one-time passwords sent directly to registered email addresses
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Clock size={28} />
            </div>
            <h3 className="feature-title">Time-Based Access</h3>
            <p className="feature-description">
              Set expiry dates for result portals to control when students can access their results
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Upload size={28} />
            </div>
            <h3 className="feature-title">Bulk Upload</h3>
            <p className="feature-description">
              Import results via CSV files or add them manually with our intuitive interface
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Users size={28} />
            </div>
            <h3 className="feature-title">Multi-Role Access</h3>
            <p className="feature-description">
              Separate dashboards for admins, institutions, and students with role-based permissions
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <BarChart3 size={28} />
            </div>
            <h3 className="feature-title">Analytics Dashboard</h3>
            <p className="feature-description">
              Track result views, student engagement, and platform usage with detailed analytics
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <GraduationCap size={28} />
            </div>
            <h3 className="feature-title">Result Cards</h3>
            <p className="feature-description">
              Beautiful, printable result cards with grades, SGPA, CGPA, and detailed breakdowns
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section" id="pricing">
        <div className="section-header">
          <span className="section-badge">Pricing</span>
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-description">
            Choose the plan that fits your institution&apos;s needs
          </p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-name">Starter</div>
            <div className="pricing-price">$29<span>/month</span></div>
            <p className="pricing-description">Perfect for small institutions</p>
            <div className="pricing-features">
              <div className="pricing-feature">
                <Check size={16} />
                <span>Up to 500 students</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>Email OTP verification</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>CSV bulk upload</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>Basic analytics</span>
              </div>
            </div>
            <Link to="/admin/login" className="btn btn-outline pricing-btn">Get Started</Link>
          </div>

          <div className="pricing-card popular">
            <span className="popular-badge">Most Popular</span>
            <div className="pricing-name">Professional</div>
            <div className="pricing-price">$79<span>/month</span></div>
            <p className="pricing-description">For growing institutions</p>
            <div className="pricing-features">
              <div className="pricing-feature">
                <Check size={16} />
                <span>Up to 5,000 students</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>SMS + Email OTP</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>Advanced analytics</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>Custom branding</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>Priority support</span>
              </div>
            </div>
            <Link to="/admin/login" className="btn btn-primary pricing-btn">Get Started</Link>
          </div>

          <div className="pricing-card">
            <div className="pricing-name">Enterprise</div>
            <div className="pricing-price">$199<span>/month</span></div>
            <p className="pricing-description">For large universities</p>
            <div className="pricing-features">
              <div className="pricing-feature">
                <Check size={16} />
                <span>Unlimited students</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>White-label solution</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>API access</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>Dedicated support</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>SLA guarantee</span>
              </div>
            </div>
            <Link to="/admin/login" className="btn btn-outline pricing-btn">Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="section-header">
          <span className="section-badge">Trusted by Educational Institutions</span>
          <h2 className="section-title">
            Built to Simplify <span>Secure Result Hosting</span>
          </h2>
          <p className="section-description">
            ResultScale helps schools, colleges, and training institutions securely host, manage, and share student results online. Designed for simplicity and reliability, the platform offers OTP verification, role-based access, and an intuitive portal system for administrators, clients, and students.
          </p>
        </div>

        {/* Feature Cards Grid (horizontal style matching portal cards) */}
        <div className="about-cards-grid">
          <div className="about-card">
            <div className="about-card-icon secure">
              <Shield size={24} />
            </div>
            <div className="about-card-content">
              <h3 className="about-card-title">Secure Access</h3>
              <p className="about-card-description">
                OTP verification and protected result access for students.
              </p>
            </div>
          </div>

          <div className="about-card">
            <div className="about-card-icon management">
              <Upload size={24} />
            </div>
            <div className="about-card-content">
              <h3 className="about-card-title">Easy Management</h3>
              <p className="about-card-description">
                Upload, organize, and manage results without technical complexity.
              </p>
            </div>
          </div>

          <div className="about-card">
            <div className="about-card-icon scalable">
              <Server size={24} />
            </div>
            <div className="about-card-content">
              <h3 className="about-card-title">Scalable Platform</h3>
              <p className="about-card-description">
                Built for institutions of all sizes with reliable cloud infrastructure.
              </p>
            </div>
          </div>
        </div>

        {/* Split Mission Section */}
        <div className="about-mission-section">
          <div className="about-mission-left">
            <div className="dashboard-preview">
              <div className="mock-sidebar">
                <div className="mock-logo"></div>
                <div className="mock-nav-item active">
                  <div className="mock-nav-circle"></div>
                </div>
                <div className="mock-nav-item">
                  <div className="mock-nav-circle"></div>
                </div>
                <div className="mock-nav-item">
                  <div className="mock-nav-circle"></div>
                </div>
              </div>
              <div className="mock-main">
                <div className="mock-header">
                  <div className="mock-header-title"></div>
                  <div className="mock-header-profile"></div>
                </div>
                <div className="mock-content">
                  <div className="mock-stats">
                    <div className="mock-stat-card">
                      <div className="mock-stat-label"></div>
                      <div className="mock-stat-value"></div>
                    </div>
                    <div className="mock-stat-card">
                      <div className="mock-stat-label"></div>
                      <div className="mock-stat-value"></div>
                    </div>
                    <div className="mock-stat-card">
                      <div className="mock-stat-label"></div>
                      <div className="mock-stat-value"></div>
                    </div>
                  </div>
                  <div className="mock-chart">
                    <div className="mock-chart-header">
                      <div className="mock-chart-title"></div>
                      <div className="mock-chart-legend"></div>
                    </div>
                    <div className="mock-chart-bars">
                      <div className="mock-chart-bar" style={{ height: '40%' }}></div>
                      <div className="mock-chart-bar active" style={{ height: '70%' }}></div>
                      <div className="mock-chart-bar" style={{ height: '55%' }}></div>
                      <div className="mock-chart-bar" style={{ height: '85%' }}></div>
                      <div className="mock-chart-bar" style={{ height: '50%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="about-mission-right">
            <div className="mission-content">
              <span className="mission-badge">Our Mission</span>
              <h3 className="mission-title">Empowering Education with Simplicity</h3>
              <p className="mission-text">
                To make result management simple, secure, and accessible for every educational institution.
              </p>
              <ul className="mission-bullets">
                <li>
                  <Check size={16} className="bullet-icon" />
                  <span>Streamlined administrator and student portals</span>
                </li>
                <li>
                  <Check size={16} className="bullet-icon" />
                  <span>Zero technical expertise required to host results</span>
                </li>
                <li>
                  <Check size={16} className="bullet-icon" />
                  <span>Robust security and privacy compliance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Start Managing Results Smarter</h2>
          <p className="cta-subtext">
            Join institutions already using ResultScale to securely publish and manage academic results.
          </p>
          <div className="cta-buttons">
            <Link to="/admin/login" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg cta-btn-outline">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p className="footer-text">
          &copy; {new Date().getFullYear()} ResultScale. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default LandingPage
