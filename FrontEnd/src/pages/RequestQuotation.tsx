import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Building2, Calendar, Check, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react'
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
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentCount, setStudentCount] = useState(1000);
  const [accessDurationDays, setAccessDurationDays] = useState(7);
  const [expectedReleaseDate, setExpectedReleaseDate] = useState('');
  const [otpRequired, setOtpRequired] = useState(true);
  const [marksMemoRequired, setMarksMemoRequired] = useState(true);

  // Field Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClearForm = () => {
    setInstitutionName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setStudentCount(1000);
    setAccessDurationDays(7);
    setExpectedReleaseDate('');
    setOtpRequired(true);
    setMarksMemoRequired(true);
    setErrors({});
    showToast('Form cleared successfully', 'info');
  };

  const handleInstitutionNameChange = (val: string) => {
    setInstitutionName(val);
    if (val.trim()) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.institutionName;
        return copy;
      });
    }
  };

  const handleContactPersonChange = (val: string) => {
    setContactPerson(val);
    if (val.trim()) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.contactPerson;
        return copy;
      });
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (val.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.email;
        return copy;
      });
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (val.trim() && /^[+]?[0-9\s-]{7,15}$/.test(val)) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.phone;
        return copy;
      });
    }
  };

  const handleDateChange = (val: string) => {
    setExpectedReleaseDate(val);
    if (val) {
      const selectedDate = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate >= today) {
        setErrors(prev => {
          const copy = { ...prev };
          delete copy.expectedReleaseDate;
          return copy;
        });
      } else {
        setErrors(prev => ({ ...prev, expectedReleaseDate: 'Release date cannot be in the past' }));
      }
    } else {
      setErrors(prev => ({ ...prev, expectedReleaseDate: 'Expected Result Release Date is required' }));
    }
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
    
    if (!expectedReleaseDate) {
      tempErrors.expectedReleaseDate = 'Expected Result Release Date is required';
    } else {
      const selectedDate = new Date(expectedReleaseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        tempErrors.expectedReleaseDate = 'Release date cannot be in the past';
      }
    }
    
    const students = Number(studentCount);
    if (isNaN(students) || students <= 0) {
      tempErrors.studentCount = 'Student count must be a positive number';
    }

    const duration = Number(accessDurationDays);
    if (isNaN(duration) || duration <= 0) {
      tempErrors.accessDurationDays = 'Access duration must be a positive number of days';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Calculations: ₹1.5 per student per day
  const hostingCost = studentCount * accessDurationDays * 1.5;
  const otpCost = 0;
  const estimatedTotal = hostingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the errors in the form before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);
    const requestData = {
      institutionName: institutionName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      studentCount: Number(studentCount),
      accessDurationDays: Number(accessDurationDays),
      expectedReleaseDate,
      otpRequired,
      marksMemoRequired,
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
      
      saveToLocalRequests(requestData);

    } catch (err: any) {
      console.warn('API submission failed, using local storage fallback:', err.message);
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
      hostingCost,
      otpCost,
      estimatedTotal,
      status: 'Pending',
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
                          onChange={(e) => handleInstitutionNameChange(e.target.value)}
                        />
                        {errors.institutionName && <span className="form-field-error">{errors.institutionName}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Contact Person Name *</label>
                        <input
                          type="text"
                          className={`form-input ${errors.contactPerson ? 'invalid' : ''}`}
                          placeholder="e.g. Prof. Alan Turing"
                          value={contactPerson}
                          onChange={(e) => handleContactPersonChange(e.target.value)}
                        />
                        {errors.contactPerson && <span className="form-field-error">{errors.contactPerson}</span>}
                      </div>
                    </div>

                    <div className="form-row-2col">
                      <div className="form-group">
                        <label className="form-label">Official Email Address *</label>
                        <input
                          type="email"
                          className={`form-input ${errors.email ? 'invalid' : ''}`}
                          placeholder="admin@institution.edu"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                        />
                        {errors.email && <span className="form-field-error">{errors.email}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input
                          type="text"
                          className={`form-input ${errors.phone ? 'invalid' : ''}`}
                          placeholder="e.g. +91 98765 43210"
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                        />
                        {errors.phone && <span className="form-field-error">{errors.phone}</span>}
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
                          min="1"
                          value={studentCount}
                          onChange={(e) => setStudentCount(Math.max(1, Number(e.target.value)))}
                        />
                        {errors.studentCount && <span className="form-field-error">{errors.studentCount}</span>}
                      </div>

                      <div className="form-group">
                        <label className="form-label">Access Duration (Days) *</label>
                        <input
                          type="number"
                          className={`form-input ${errors.accessDurationDays ? 'invalid' : ''}`}
                          min="1"
                          value={accessDurationDays}
                          onChange={(e) => setAccessDurationDays(Math.max(1, Number(e.target.value)))}
                        />
                        {errors.accessDurationDays && <span className="form-field-error">{errors.accessDurationDays}</span>}
                      </div>
                    </div>

                    <div className="form-row-2col">
                      <div className="form-group">
                        <label className="form-label">Expected Result Release Date *</label>
                        <input
                          type="date"
                          className={`form-input ${errors.expectedReleaseDate ? 'invalid' : ''}`}
                          value={expectedReleaseDate}
                          onChange={(e) => handleDateChange(e.target.value)}
                        />
                        {errors.expectedReleaseDate && <span className="form-field-error">{errors.expectedReleaseDate}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Additional Options */}
                <div className="request-form-card">
                  <div className="request-form-card-header">
                    <ShieldCheck size={16} />
                    Additional Features (No Extra Cost)
                  </div>
                  <div className="request-form-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                    <div 
                      className={`feature-toggle-card ${otpRequired ? 'selected' : ''}`}
                      onClick={() => setOtpRequired(!otpRequired)}
                    >
                      <div className="feature-toggle-info">
                        <span className="feature-toggle-name">Email OTP Verification</span>
                        <span className="feature-toggle-desc">Students verify via secure code</span>
                      </div>
                      <input 
                        type="checkbox" 
                        className="feature-toggle-switch" 
                        checked={otpRequired}
                        onChange={(e) => setOtpRequired(e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div 
                      className={`feature-toggle-card ${marksMemoRequired ? 'selected' : ''}`}
                      onClick={() => setMarksMemoRequired(!marksMemoRequired)}
                    >
                      <div className="feature-toggle-info">
                        <span className="feature-toggle-name">Marks Memo Downloads</span>
                        <span className="feature-toggle-desc">Allow students to download PDF results</span>
                      </div>
                      <input 
                        type="checkbox" 
                        className="feature-toggle-switch" 
                        checked={marksMemoRequired}
                        onChange={(e) => setMarksMemoRequired(e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* Right Column: Sticky Summary Card */}
              <div className="request-summary-sidebar">
                <div className="summary-card">
                  <div className="summary-card-header">Request Summary & Pricing</div>
                  <div className="summary-card-body">
                    <div className="summary-institution-title">
                      {institutionName.trim() || 'Your Institution'}
                    </div>

                    <div className="summary-list">
                      <div className="summary-item">
                        <span className="summary-item-label">Student Count:</span>
                        <span className="summary-item-value">{studentCount.toLocaleString('en-IN')} students</span>
                      </div>

                      <div className="summary-item">
                        <span className="summary-item-label">Access Duration:</span>
                        <span className="summary-item-value">{accessDurationDays} Days</span>
                      </div>

                      <div className="calculator-divider" style={{ margin: 'var(--spacing-sm) 0', borderTop: '1px dashed var(--color-border)' }}></div>

                      <div className="summary-item">
                        <span className="summary-item-label">Hosting Cost:</span>
                        <span className="summary-item-value">₹{hostingCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="summary-item">
                        <span className="summary-item-label">OTP Verification:</span>
                        <span className="summary-item-value" style={{ color: otpRequired ? '#10B981' : 'var(--color-text-muted)', fontWeight: 600 }}>
                          {otpRequired ? 'Included / Free' : 'Excluded'}
                        </span>
                      </div>

                      <div className="summary-item">
                        <span className="summary-item-label">Marks Memo Download:</span>
                        <span className="summary-item-value" style={{ color: marksMemoRequired ? '#10B981' : 'var(--color-text-muted)', fontWeight: 600 }}>
                          {marksMemoRequired ? 'Included' : 'Excluded'}
                        </span>
                      </div>

                      <div className="calculator-divider" style={{ margin: 'var(--spacing-sm) 0', borderTop: '1px solid var(--color-border)' }}></div>

                      <div className="summary-item" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        <span className="summary-item-label" style={{ color: 'var(--color-text)' }}>Total Estimated Cost:</span>
                        <span className="summary-item-value" style={{ color: '#EF4444' }}>₹{estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
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
                    <strong style={{ color: 'var(--color-text)' }}>Transparent Pricing</strong><br />
                    Billing is flat at ₹1.5 per student per day of portal access. Mandatory secure OTP email verification is included at no extra charge.
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
              Thank you for choosing ResultScale! Our team will review your portal requirements and contact you at <strong style={{ color: 'var(--color-text)' }}>{email}</strong> shortly to finalize the quotation.
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
