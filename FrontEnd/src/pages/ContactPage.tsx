import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  BarChart3, 
  MoonStar, 
  Sun, 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Check, 
  Building2, 
  ShieldAlert 
} from 'lucide-react'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/contact.css'
import { useTheme } from "../components/ThemeProvider"
import { useToast } from "../components/Toast"

const API_URL = (import.meta as any).env.VITE_API_URL;

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

function ContactPage() {
  const { theme, toggleTheme } = useTheme()
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
      const response = await fetch(`${API_URL}/contact/submit`, {
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
    <div className="contact-page">
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
          <a href="/#features" className="nav-link">Features</a>
          <a href="/#pricing" className="nav-link">Pricing</a>
          <a href="/#about" className="nav-link">About</a>
          <Link to="/database" className="nav-link">Database</Link>
          <Link to="/admin/login" className="btn btn-primary">Get Started</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="contact-hero">
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
                    <a href="mailto:support@resultscale.com" className="info-value link-highlight">
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
                    <a href="tel:+919876543210" className="info-value link-highlight">
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
      <section className="contact-faq">
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
          &copy; {new Date().getFullYear()} ResultScale. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default ContactPage
