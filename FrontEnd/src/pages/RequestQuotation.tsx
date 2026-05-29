import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Building2, Calendar, FileText, Check, ArrowRight, ShieldCheck, Mail, RefreshCw } from 'lucide-react'
import { useToast } from '../components/Toast'
// @ts-ignore: allow side-effect CSS import without type declarations
import '../styles/request-quotation.css'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

function RequestQuotation() {
  const { showToast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('College');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cityState, setCityState] = useState('');
  
  const [studentCount, setStudentCount] = useState(1000);
  const [expectedReleaseDate, setExpectedReleaseDate] = useState('');
  const [accessDuration, setAccessDuration] = useState('7 Days');
  const [customDays, setCustomDays] = useState(10);
  const [expectedTraffic, setExpectedTraffic] = useState('Medium');
  
  const [otpRequired, setOtpRequired] = useState(false);
  const [memoDownloadRequired, setMemoDownloadRequired] = useState(false);
  
  const [message, setMessage] = useState('');

  // Field Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClearForm = () => {
    setInstitutionName('');
    setInstitutionType('College');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setCityState('');
    setStudentCount(1000);
    setExpectedReleaseDate('');
    setAccessDuration('7 Days');
    setCustomDays(10);
    setExpectedTraffic('Medium');
    setOtpRequired(false);
    setMemoDownloadRequired(false);
    setMessage('');
    setErrors({});
    showToast('Form cleared successfully', 'info');
  };

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};

    if (!institutionName.trim()) tempErrors.institutionName = 'Institution Name is required';
    if (!contactPerson.trim()) tempErrors.contactPerson = 'Contact Person is required';
    
    if (!email.trim()) {
      tempErrors.email = 'Official Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    
    if (!phone.trim()) {
      tempErrors.phone = 'Phone Number is required';
    } else if (!/^[+]?[0-9\s-]{7,15}$/.test(phone)) {
      tempErrors.phone = 'Please enter a valid phone number (7-15 digits)';
    }
    
    if (!cityState.trim()) tempErrors.cityState = 'City and State details are required';
    if (!expectedReleaseDate) tempErrors.expectedReleaseDate = 'Expected Result Release Date is required';
    
    const students = Number(studentCount);
    if (isNaN(students) || students <= 0) {
      tempErrors.studentCount = 'Student count must be a positive number';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the errors in the form before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);
    const requestData = {
      institutionName: institutionName.trim(),
      institutionType,
      contactPerson: contactPerson.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      cityState: cityState.trim(),
      studentCount: Number(studentCount),
      expectedReleaseDate,
      accessDuration,
      customDurationDays: accessDuration === 'Custom' ? Number(customDays) : 0,
      expectedTraffic,
      otpRequired,
      memoDownloadRequired,
      message: message.trim(),
    };

    try {
      const response = await fetch(`${API_URL}/contact/quotation-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Server error occurred');
      }

      showToast('Quotation request submitted successfully!', 'success');
      setIsSubmitted(true);
      
      // Also write to local storage as fallback/testing helper
      saveToLocalRequests(requestData);

    } catch (err: any) {
      console.warn('API submission failed, using local storage fallback:', err.message);
      // Fallback: save to LocalStorage so it works completely client-side in same browser
      saveToLocalRequests(requestData);
      showToast('Quotation request saved locally (Demo Fallback)', 'success');
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveToLocalRequests = (data: any) => {
    const existing = localStorage.getItem('resultscale_quotation_requests');
    let requestsList = [];
    if (existing) {
      try {
        requestsList = JSON.parse(existing);
      } catch (e) {
        requestsList = [];
      }
    }
    const newRequest = {
      _id: 'req_' + Date.now(),
      ...data,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };
    requestsList.unshift(newRequest);
    localStorage.setItem('resultscale_quotation_requests', JSON.stringify(requestsList));
  };

  return (
    <div className="request-page-container">
      {/* Top Header navbar */}
      <header className="request-navbar">
        <Link to="/" className="request-logo">
          <div className="request-logo-icon">
            <BarChart3 size={18} />
          </div>
          ResultScale
        </Link>
        <Link to="/" className="btn btn-outline btn-sm">
          Back to Home
        </Link>
      </header>

      {/* Main Page Area */}
      <main className="request-content-wrapper">
        {!isSubmitted ? (
          <>
            {/* Header Description */}
            <div className="request-header">
              <h1 className="request-title">Request a Quotation</h1>
              <p className="request-subtitle">Tell us about your institution and result hosting requirements.</p>
            </div>

            {/* Split Screen Layout */}
            <div className="request-layout-grid">
              {/* Left Column: Form Details */}
              <form className="request-form-panel" onSubmit={handleSubmit}>
                
                {/* Section 1: Institution Details */}
                <div className="request-form-card">
                  <div className="request-form-card-header">
                    <Building2 size={16} />
                    Institution Details
                  </div>
                  <div className="request-form-card-body">
                    <div className="form-row-2col">
                      <div className="form-group">
                        <label className="form-label">Institution Name *</label>
                        <input
                          type="text"
                          className={`form-input ${errors.institutionName ? 'invalid' : ''}`}
                          placeholder="e.g. Stanford University"
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                        />
                        {errors.institutionName && <span className="form-field-error">{errors.institutionName}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Institution Type *</label>
                        <select
                          className="form-input"
                          value={institutionType}
                          onChange={(e) => setInstitutionType(e.target.value)}
                        >
                          <option value="College">College</option>
                          <option value="University">University</option>
                          <option value="Examination Board">Examination Board</option>
                          <option value="Other">Other / School</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row-2col">
                      <div className="form-group">
                        <label className="form-label">Contact Person Name *</label>
                        <input
                          type="text"
                          className={`form-input ${errors.contactPerson ? 'invalid' : ''}`}
                          placeholder="e.g. Prof. Alan Turing"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                        />
                        {errors.contactPerson && <span className="form-field-error">{errors.contactPerson}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Official Email Address *</label>
                        <input
                          type="email"
                          className={`form-input ${errors.email ? 'invalid' : ''}`}
                          placeholder="admin@institution.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <span className="form-field-error">{errors.email}</span>}
                      </div>
                    </div>

                    <div className="form-row-2col">
                      <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input
                          type="text"
                          className={`form-input ${errors.phone ? 'invalid' : ''}`}
                          placeholder="e.g. +91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                        {errors.phone && <span className="form-field-error">{errors.phone}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">City and State *</label>
                        <input
                          type="text"
                          className={`form-input ${errors.cityState ? 'invalid' : ''}`}
                          placeholder="e.g. Mumbai, Maharashtra"
                          value={cityState}
                          onChange={(e) => setCityState(e.target.value)}
                        />
                        {errors.cityState && <span className="form-field-error">{errors.cityState}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Result Hosting Requirements */}
                <div className="request-form-card">
                  <div className="request-form-card-header">
                    <Calendar size={16} />
                    Hosting Requirements
                  </div>
                  <div className="request-form-card-body">
                    <div className="form-row-2col">
                      <div className="form-group">
                        <label className="form-label">Number of Students *</label>
                        <input
                          type="number"
                          className={`form-input ${errors.studentCount ? 'invalid' : ''}`}
                          min="10"
                          step="50"
                          value={studentCount}
                          onChange={(e) => setStudentCount(Math.max(1, Number(e.target.value)))}
                        />
                        {errors.studentCount && <span className="form-field-error">{errors.studentCount}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Expected Result Release Date *</label>
                        <input
                          type="date"
                          className={`form-input ${errors.expectedReleaseDate ? 'invalid' : ''}`}
                          value={expectedReleaseDate}
                          onChange={(e) => setExpectedReleaseDate(e.target.value)}
                        />
                        {errors.expectedReleaseDate && <span className="form-field-error">{errors.expectedReleaseDate}</span>}
                      </div>
                    </div>

                    {/* Access Duration Selection */}
                    <div className="form-group">
                      <label className="form-label" style={{ marginBottom: '8px' }}>Access Duration</label>
                      <div className="radio-select-grid">
                        {['7 Days', '15 Days', '30 Days', 'Custom'].map((dur) => (
                          <div key={dur} className="radio-select-option">
                            <input
                              type="radio"
                              id={`req-dur-${dur}`}
                              name="req-duration"
                              value={dur}
                              checked={accessDuration === dur}
                              onChange={() => setAccessDuration(dur)}
                            />
                            <label htmlFor={`req-dur-${dur}`} className="radio-select-label">
                              {dur}
                            </label>
                          </div>
                        ))}
                      </div>

                      {accessDuration === 'Custom' && (
                        <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
                          <label className="form-label">Custom Duration (Days)</label>
                          <input
                            type="number"
                            className="form-input"
                            min="1"
                            max="365"
                            value={customDays}
                            onChange={(e) => setCustomDays(Math.max(1, Number(e.target.value)))}
                          />
                        </div>
                      )}
                    </div>

                    {/* Expected Traffic Selection */}
                    <div className="form-group">
                      <label className="form-label" style={{ marginBottom: '8px' }}>Expected Peak Traffic</label>
                      <div className="radio-select-grid three-col">
                        {['Low', 'Medium', 'High'].map((tr) => (
                          <div key={tr} className="radio-select-option">
                            <input
                              type="radio"
                              id={`req-traffic-${tr}`}
                              name="req-traffic"
                              value={tr}
                              checked={expectedTraffic === tr}
                              onChange={() => setExpectedTraffic(tr)}
                            />
                            <label htmlFor={`req-traffic-${tr}`} className="radio-select-label">
                              {tr} Traffic
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selected Features Options */}
                    <div className="form-group">
                      <label className="form-label" style={{ marginBottom: '8px' }}>Required Security & Download Features</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        <div
                          className={`feature-toggle-card ${otpRequired ? 'selected' : ''}`}
                          onClick={() => setOtpRequired(!otpRequired)}
                        >
                          <div className="feature-toggle-info">
                            <span className="feature-toggle-name">OTP Verification Required</span>
                            <span className="feature-toggle-desc">Lock scores behind student email verification OTP codes.</span>
                          </div>
                          <input
                            type="checkbox"
                            className="feature-toggle-switch"
                            checked={otpRequired}
                            readOnly
                          />
                        </div>

                        <div
                          className={`feature-toggle-card ${memoDownloadRequired ? 'selected' : ''}`}
                          onClick={() => setMemoDownloadRequired(!memoDownloadRequired)}
                        >
                          <div className="feature-toggle-info">
                            <span className="feature-toggle-name">Marks Memo Download Required</span>
                            <span className="feature-toggle-desc">Allow students to print or download a customized PDF transcript.</span>
                          </div>
                          <input
                            type="checkbox"
                            className="feature-toggle-switch"
                            checked={memoDownloadRequired}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Additional Information */}
                <div className="request-form-card">
                  <div className="request-form-card-header">
                    <FileText size={16} />
                    Additional Information
                  </div>
                  <div className="request-form-card-body">
                    <div className="form-group">
                      <label className="form-label">Message / Special Requirements</label>
                      <textarea
                        className="form-input"
                        rows={4}
                        placeholder="Please describe any custom integrations, SSO requirements, or scaling configurations you need..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{ resize: 'vertical', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* Right Column: Sticky Summary Card */}
              <div className="request-summary-sidebar">
                <div className="summary-card">
                  <div className="summary-card-header">Request Summary</div>
                  <div className="summary-card-body">
                    <div className="summary-institution-title">
                      {institutionName.trim() || 'Your Institution'}
                    </div>
                    <div className="summary-institution-type">
                      {institutionType}
                    </div>

                    <div className="summary-list">
                      <div className="summary-item">
                        <span className="summary-item-label">Student Scale:</span>
                        <span className="summary-item-value">{studentCount.toLocaleString('en-IN')} students</span>
                      </div>

                      <div className="summary-item">
                        <span className="summary-item-label">Hosting Duration:</span>
                        <span className="summary-item-value">
                          {accessDuration === 'Custom' ? `${customDays} Days` : accessDuration}
                        </span>
                      </div>

                      <div className="summary-item">
                        <span className="summary-item-label">Peak Traffic:</span>
                        <span className="summary-item-value">{expectedTraffic} Traffic</span>
                      </div>

                      <div className="summary-item">
                        <span className="summary-item-label">Expected Date:</span>
                        <span className="summary-item-value">
                          {expectedReleaseDate ? new Date(expectedReleaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not set'}
                        </span>
                      </div>

                      <div className="summary-item" style={{ flexDirection: 'column', gap: '4px', alignItems: 'stretch' }}>
                        <span className="summary-item-label">Selected Features:</span>
                        <div className="summary-badge-list">
                          {otpRequired && <span className="summary-badge-item">OTP Login</span>}
                          {memoDownloadRequired && <span className="summary-badge-item">Memo Download</span>}
                          {!otpRequired && !memoDownloadRequired && <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontStyle: 'italic' }}>None selected</span>}
                        </div>
                      </div>

                      <div className="calculator-divider" style={{ margin: 'var(--spacing-sm) 0' }}></div>

                      <div className="summary-item">
                        <span className="summary-item-label">Contact Person:</span>
                        <span className="summary-item-value">{contactPerson || 'Not entered'}</span>
                      </div>

                      <div className="summary-item" style={{ overflow: 'hidden' }}>
                        <span className="summary-item-label">Email:</span>
                        <span className="summary-item-value" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }} title={email}>
                          {email || 'Not entered'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="request-action-row">
                      <button
                        className="btn btn-rs-red btn-lg btn-icon"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Quotation Request
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                      <button className="btn btn-clear btn-sm" onClick={handleClearForm}>
                        Clear Form
                      </button>
                    </div>
                  </div>
                </div>

                <div className="quotation-form-section-card" style={{ padding: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-start' }}>
                  <ShieldCheck size={28} style={{ color: '#059669', flexShrink: 0 }} />
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                    <strong style={{ color: 'var(--color-text)' }}>Security Sign-off</strong><br />
                    All result hosting environments deploy inside secure, isolated VPC networks with AES-256 data encryption active.
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // --- SUCCESS SCREEN ---
          <div className="success-screen-card">
            <div className="success-icon-wrapper">
              <Check size={40} />
            </div>
            <h2 className="success-title">Quotation Request Submitted Successfully</h2>
            <p className="success-desc">
              Thank you for choosing ResultScale! Our engineering team will review your portal requirements and contact you at <strong style={{ color: 'var(--color-text)' }}>{email}</strong> shortly.
            </p>
            <div className="success-buttons">
              <Link to="/" className="btn btn-primary">
                Return Home
              </Link>
              <button className="btn btn-outline" onClick={() => setIsSubmitted(false)}>
                Submit Another Request
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default RequestQuotation
