import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './index.css';

const SupportContact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    category: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setFormData(prev => ({ ...prev, phone: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="clapkart-contact-auth-container">
      <div className="clapkart-contact-auth-right">
        <div className="clapkart-contact-auth-form-container">
          <div className="clapkart-contact-logo-container">
            <img src={logo} alt="Clap Kartel Logo" className="clapkart-contact-form-logo" />
          </div>

          {submitted ? (
            <div className="clapkart-contact-success-container">
              <svg viewBox="0 0 24 24" fill="none" stroke="#bf8906" strokeWidth="2" width="64" height="64">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="clapkart-contact-auth-title" style={{ marginTop: '20px' }}>Submitted!</h2>
              <p className="clapkart-contact-auth-subtitle" style={{ textAlign: 'center', marginBottom: '30px' }}>
                Your request has been submitted successfully.
              </p>
              <button
                className="clapkart-contact-submit-button"
                onClick={() => navigate('/')}
              >
                Return to Home
              </button>
            </div>
          ) : (
            <>
              <h2 className="clapkart-contact-auth-title">Contact Us</h2>
              <p className="clapkart-contact-auth-subtitle">We'd love to hear from you. Please fill out the form below.</p>

              <form onSubmit={handleSubmit}>
                <div className="clapkart-contact-form-group">
                  <label className="clapkart-contact-form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="clapkart-contact-form-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="clapkart-contact-form-group">
                  <label className="clapkart-contact-form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="clapkart-contact-form-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="clapkart-contact-form-row">
                  <div className="clapkart-contact-form-group" style={{ flex: 1 }}>
                    <label className="clapkart-contact-form-label">Phone <span className="optional-text">(Optional)</span></label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-digit number"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="clapkart-contact-form-input"
                      maxLength="10"
                      disabled={loading}
                    />
                  </div>
                  <div className="clapkart-contact-form-group" style={{ flex: 1 }}>
                    <label className="clapkart-contact-form-label">Issue Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="clapkart-contact-form-input clapkart-contact-form-select"
                      required
                      disabled={loading}
                    >
                      <option value="" disabled>Select category</option>
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="clapkart-contact-form-group">
                  <label className="clapkart-contact-form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="What is this regarding?"
                    value={formData.subject}
                    onChange={handleChange}
                    className="clapkart-contact-form-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="clapkart-contact-form-group" style={{ marginBottom: '24px' }}>
                  <label className="clapkart-contact-form-label">Message</label>
                  <textarea
                    name="message"
                    placeholder="Please describe your issue or query..."
                    value={formData.message}
                    onChange={handleChange}
                    className="clapkart-contact-form-textarea"
                    rows="4"
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="clapkart-contact-submit-button"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </>
          )}

          <div className="clapkart-contact-auth-footer">
            <span className="clapkart-contact-footer-text">Back to </span>
            <span className="clapkart-contact-footer-link" onClick={() => navigate('/')}>Home</span>
          </div>

          {loading && (
            <div className="loading-overlay">
              <div className="loading-dialog">
                <div className="loader"></div>
                <p style={{ marginTop: '10px', color: '#333' }}>Please wait...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportContact;
