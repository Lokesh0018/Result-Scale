import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3, Shield, Clock, Upload, Users, ChevronRight,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldAlert, Check, GraduationCap, Building2, Settings, MoonStar, Sun, Server
} from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/landing.css'
import { useTheme } from "../components/ThemeProvider"
import { useToast } from "../components/Toast"

const VITE_RENDER_API_URL = (import.meta as any).env.VITE_RENDER_API_URL;

interface FormFields {
  fullName: string
  institutionName: string
  email: string
  phone: string
  subject: string
  message: string
}

interface FormErrors {
  fullName?: string
  institutionName?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
}

interface FAQItem {
  question: string
  answer: string
}

function LandingPage() {

  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast()

  // Form States
  const [fields, setFields] = useState<FormFields>({
    fullName: '',
    institutionName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<keyof FormFields, boolean>>({
    fullName: false,
    institutionName: false,
    email: false,
    phone: false,
    subject: false,
    message: false,
  })

  // FAQ Accordion State
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const faqs: FAQItem[] = [
    {
      question: "How long does it take to set up an institution portal?",
      answer: "Portal setup is instant! Once an administrator creates an account, they can immediately invite clients, who can then upload results and configure student portal access parameters."
    },
    {
      question: "What security measures are in place for student results?",
      answer: "We secure results using role-based encryption and strict time-based portal locks. Students can only gain access to their results after passing a secure, one-time passcode (OTP) email validation step."
    },
    {
      question: "Can we integrate ResultScale with our existing student database?",
      answer: "Yes. ResultScale supports bulk uploads via CSV files exported from standard school database managers (e.g. ERPs/SIS). Direct API integrations are also available on our Enterprise plan."
    },
    {
      question: "Is there support available for onboarding client staff?",
      answer: "Absolutely! We provide exhaustive database structure guides, manual documentation, and direct email support to ensure clients can manage their results without any technical complexity."
    }
  ]

  // Form Validation Logic
  const validateField = (name: keyof FormFields, value: string): string => {
    switch (name) {
      case 'fullName':
        return value.trim() ? '' : 'Full Name is required.'
      case 'institutionName':
        return value.trim() ? '' : 'Institution Name is required.'
      case 'email':
        if (!value.trim()) return 'Email address is required.'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value) ? '' : 'Please enter a valid email address.'
      case 'phone':
        if (!value.trim()) return 'Phone number is required.'
        const phoneRegex = /^[+]?[0-9\s-]{7,15}$/
        return phoneRegex.test(value) ? '' : 'Please enter a valid phone number (7-15 digits).'
      case 'subject':
        return value.trim() ? '' : 'Subject is required.'
      case 'message':
        if (!value.trim()) return 'Message is required.'
        return value.trim().length >= 10 ? '' : 'Message must be at least 10 characters long.'
      default:
        return ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: keyof FormFields; value: string }
    setFields(prev => ({ ...prev, [name]: value }))

    if (touched[name]) {
      const errorMsg = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: errorMsg }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const fieldName = name as keyof FormFields
    setTouched(prev => ({ ...prev, [fieldName]: true }))

    const errorMsg = validateField(fieldName, value)
    setErrors(prev => ({ ...prev, [fieldName]: errorMsg }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Mark all fields as touched and validate them
    const newTouched = { ...touched }
    Object.keys(fields).forEach(key => {
      newTouched[key as keyof FormFields] = true
    })
    setTouched(newTouched)

    const newErrors: FormErrors = {}
    let hasErrors = false

    Object.entries(fields).forEach(([key, val]) => {
      const errorMsg = validateField(key as keyof FormFields, val)
      if (errorMsg) {
        newErrors[key as keyof FormFields] = errorMsg
        hasErrors = true
      }
    })

    setErrors(newErrors)

    if (hasErrors) {
      showToast("Please fix the validation errors before submitting.", "error")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${VITE_RENDER_API_URL}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fields),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        showToast("Your message has been sent successfully.", "success")
        // Reset form
        setFields({
          fullName: '',
          institutionName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        })
        setTouched({
          fullName: false,
          institutionName: false,
          email: false,
          phone: false,
          subject: false,
          message: false,
        })
      } else {
        showToast(data.message || "Failed to submit inquiry. Please try again.", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("Network error. Make sure the backend server is running.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(prev => (prev === index ? null : index))
  }
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <a href="#home" className="logo">
          <div className="logo-icon">
            <BarChart3 size={20} />
          </div>
          ResultScale
        </a>
        <nav className="header-nav">
          <button onClick={toggleTheme} className="nav-link">
            {theme === "light" ? <MoonStar /> : <Sun />}
          </button>
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
          <a href="#faq" className="nav-link">FAQ</a>
          <Link to="/request-quotation" className="btn btn-primary">Get a Quotation</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id='home'>
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
            <Link to="/request-quotation" className="btn btn-primary btn-lg">
              Request a Quotation
              <ChevronRight size={20} />
            </Link>
            <Link to="/admin/login" className="btn btn-outline btn-lg">
              Sign In
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

            <Link to="/student/select-institution" className="portal-card">
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
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-xl)', maxWidth: '800px', margin: '0 auto' }}>
          <div className="pricing-card popular">
            <span className="popular-badge">Pay-As-You-Go</span>
            <div className="pricing-name">Standard Plan</div>
            <div className="pricing-price">₹1.50<span>/student/day</span></div>
            <p className="pricing-description">Perfect for institutions of all sizes. Pay only for the scale and duration you need.</p>
            <div className="pricing-features">
              <div className="pricing-feature">
                <Check size={16} />
                <span>Flexible student scale</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>Mandatory secure Email OTP</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>CSV result uploads</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>Student memo PDF downloads</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>Standard dashboard analytics</span>
              </div>
            </div>
            <Link to="/request-quotation" className="btn btn-primary pricing-btn">Request a Quotation</Link>
          </div>

          <div className="pricing-card">
            <div className="pricing-name">Enterprise Plan</div>
            <div className="pricing-price">Custom<span> pricing</span></div>
            <p className="pricing-description">For large universities and examination boards requiring dedicated infrastructure.</p>
            <div className="pricing-features">
              <div className="pricing-feature">
                <Check size={16} />
                <span>Custom domain & branding</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>High peak-traffic allocation</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>API & ERP database sync</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>Dedicated account manager</span>
              </div>
              <div className="pricing-feature">
                <Check size={16} />
                <span>SLA uptime guarantees</span>
              </div>
            </div>
            <Link to="/request-quotation" className="btn btn-outline pricing-btn">Contact Sales</Link>
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

      {/* Contact */}
      <div className="contact-page">
        {/* Hero Section */}
        <section className="contact-hero" id='contact'>
          <div className="hero-container">
            <span className="contact-badge">Get in Touch</span>
            <h1 className="hero-title">
              Contact the <span>ResultScale Team</span>
            </h1>
            <p className="hero-description">
              We’re here to help educational institutions with onboarding, support, and platform inquiries.
            </p>
          </div>
        </section>

        {/* Main Form & Info Grid */}
        <main className="contact-container">
          <div className="contact-grid">
            {/* Left Column: Contact Cards */}
            <div className="contact-info-column">
              <div className="info-card">
                <h2 className="info-card-title">Contact Information</h2>
                <p className="info-card-intro">
                  Have questions about portals, database structures, or security? Reach out to us directly.
                </p>

                <div className="info-list">
                  <div className="info-item">
                    <div className="info-icon email-theme">
                      <Mail size={20} />
                    </div>
                    <div className="info-text">
                      <span className="info-label">Email Support</span>
                      <a href="mailto:resultscale@gmail.com" className="info-value link-highlight">
                        resultscale@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon phone-theme">
                      <Phone size={20} />
                    </div>
                    <div className="info-text">
                      <span className="info-label">Call Support</span>
                      <a href="tel:+917396287000" className="info-value link-highlight">
                        +91 73962 87000
                      </a>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon clock-theme">
                      <Clock size={20} />
                    </div>
                    <div className="info-text">
                      <span className="info-label">Support Hours</span>
                      <span className="info-value">Mon–Fri • 9 AM to 6 PM</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-icon location-theme">
                      <MapPin size={20} />
                    </div>
                    <div className="info-text">
                      <span className="info-label">Office Headquarters</span>
                      <span className="info-value">Visakhapatnam, India</span>
                    </div>
                  </div>
                </div>

                <div className="trust-badge">
                  <div className="trust-badge-dot"></div>
                  <span>Usually responds within 24 hours.</span>
                </div>
              </div>

              {/* Mock Map Placeholder */}
              <div className="map-card">
                <div className="map-placeholder">
                  <div className="map-grid-bg"></div>
                  <div className="map-marker">
                    <div className="map-marker-ping"></div>
                    <MapPin size={28} className="map-marker-icon" />
                  </div>
                  <div className="map-overlay">
                    <h4>ResultScale HQ</h4>
                    <p>Visakhapatnam, Andhra Pradesh, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="contact-form-column">
              <form onSubmit={handleSubmit} className="contact-form" noValidate>
                <h3 className="form-title">Send a Message</h3>

                <div className="form-grid">
                  {/* Full Name */}
                  <div className="input-group">
                    <label htmlFor="fullName" className="input-label">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={fields.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="John Doe"
                      className={`input ${touched.fullName && errors.fullName ? 'input-error' : ''}`}
                      disabled={isSubmitting}
                    />
                    {touched.fullName && errors.fullName && (
                      <span className="error-message">
                        <ShieldAlert size={14} /> {errors.fullName}
                      </span>
                    )}
                  </div>

                  {/* Institution Name */}
                  <div className="input-group">
                    <label htmlFor="institutionName" className="input-label">Institution Name *</label>
                    <input
                      type="text"
                      id="institutionName"
                      name="institutionName"
                      value={fields.institutionName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="St. Xavier's College"
                      className={`input ${touched.institutionName && errors.institutionName ? 'input-error' : ''}`}
                      disabled={isSubmitting}
                    />
                    {touched.institutionName && errors.institutionName && (
                      <span className="error-message">
                        <ShieldAlert size={14} /> {errors.institutionName}
                      </span>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="input-group">
                    <label htmlFor="email" className="input-label">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={fields.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="john.doe@institution.edu"
                      className={`input ${touched.email && errors.email ? 'input-error' : ''}`}
                      disabled={isSubmitting}
                    />
                    {touched.email && errors.email && (
                      <span className="error-message">
                        <ShieldAlert size={14} /> {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="input-group">
                    <label htmlFor="phone" className="input-label">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={fields.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="+91 98765 43210"
                      className={`input ${touched.phone && errors.phone ? 'input-error' : ''}`}
                      disabled={isSubmitting}
                    />
                    {touched.phone && errors.phone && (
                      <span className="error-message">
                        <ShieldAlert size={14} /> {errors.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="input-group">
                  <label htmlFor="subject" className="input-label">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={fields.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Onboarding demo request"
                    className={`input ${touched.subject && errors.subject ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {touched.subject && errors.subject && (
                    <span className="error-message">
                      <ShieldAlert size={14} /> {errors.subject}
                    </span>
                  )}
                </div>

                {/* Message */}
                <div className="input-group">
                  <label htmlFor="message" className="input-label">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={fields.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Tell us about your institution's hosting requirements..."
                    className={`input textarea-input ${touched.message && errors.message ? 'input-error' : ''}`}
                    disabled={isSubmitting}
                  />
                  {touched.message && errors.message && (
                    <span className="error-message">
                      <ShieldAlert size={14} /> {errors.message}
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="spinner-icon" size={18} />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>

        {/* FAQ Mini Section */}
        <section className="contact-faq" id='faq'>
          <div className="faq-container">
            <span className="faq-badge">F.A.Q</span>
            <h2 className="faq-title">Frequently Asked Questions</h2>

            <div className="faq-list">
              {faqs.map((faq, index) => {
                const isOpen = openFAQIndex === index
                return (
                  <div
                    key={index}
                    className={`faq-item-card ${isOpen ? 'active' : ''}`}
                    onClick={() => toggleFAQ(index)}
                  >
                    <div className="faq-item-header">
                      <h4 className="faq-item-question">{faq.question}</h4>
                      <span className="faq-item-toggle">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </div>
                    <div className={`faq-item-body ${isOpen ? 'show' : ''}`}>
                      <p className="faq-item-answer">{faq.answer}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <p className="footer-text">
            &copy; 2026 ResultScale. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default LandingPage;
