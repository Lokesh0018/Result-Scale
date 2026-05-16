import { Link } from 'react-router-dom'
import { BarChart3, Shield, Clock, Upload, Users, ChevronRight, Check, GraduationCap, Building2, Settings, MoonStar, Sun } from 'lucide-react'
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
              <div className="stat-value">500+</div>
              <div className="stat-label">Institutions</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">1M+</div>
              <div className="stat-label">Results Hosted</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">99.9%</div>
              <div className="stat-label">Uptime</div>
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
