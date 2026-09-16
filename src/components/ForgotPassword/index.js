import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiConstants } from '../../utils/apiConstants';
import { showToast } from '../../utils/toast';
import backgroundImage from '../../assets/background.png';
import logoText from '../../assets/Clap kartel Logo White.svg';
import logo from '../../assets/logo.png';
import './index.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Resend countdown timer
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer, canResend]);

  // Validation for Step 1
  const validateStep1 = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validation for Step 2
  const validateStep2 = () => {
    const errs = {};
    if (!otp.trim()) {
      errs.otp = 'OTP is required';
    } else if (otp.trim().length < 4) {
      errs.otp = 'Please enter a valid OTP';
    }

    if (!password) {
      errs.password = 'New password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading || !validateStep1()) return;

    setLoading(true);
    setErrors({});

    const forgotUrl = `${ApiConstants.baseUrl}${ApiConstants.forgotPassword}`;
    const formData = new FormData();
    formData.append('email', email.trim());

    try {
      /* console.log('=== [Forgot Password] Calling:', forgotUrl, 'with email:', email.trim()); */
      const response = await fetch(forgotUrl, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      /* console.log('=== [Forgot Password] Response:', data); */

      if (
        response.ok &&
        (data.status === true ||
          data.status === 1 ||
          data.message?.toLowerCase().includes('otp sent') ||
          data.message?.toLowerCase().includes('success'))
      ) {
        showToast(data.message || 'OTP sent to your email successfully!', 'success');
        setStep(2);
        setTimer(60);
        setCanResend(false);
      } else {
        const errorMsg =
          data.message || data.error || 'Failed to send OTP. Please check your email and try again.';
        showToast(errorMsg, 'error');
        setErrors({ email: errorMsg });
      }
    } catch (error) {
      /* console.error('=== [Forgot Password] Error:', error); */
      showToast('Network error while requesting OTP. Please try again.', 'error');
      setErrors({ api: 'Network error. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading || !validateStep2()) return;

    setLoading(true);
    setErrors({});

    const resetUrl = `${ApiConstants.baseUrl}${ApiConstants.resetPassword}`;
    const formData = new FormData();
    formData.append('email', email.trim());
    formData.append('otp', otp.trim());
    formData.append('password', password);

    try {
      /* console.log('=== [Reset Password] Calling:', resetUrl, 'with email:', email.trim(), 'otp:', otp.trim()); */
      const response = await fetch(resetUrl, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      /* console.log('=== [Reset Password] Response:', data); */

      if (
        response.ok &&
        (data.status === true ||
          data.status === 1 ||
          data.message?.toLowerCase().includes('success') ||
          data.message?.toLowerCase().includes('reset'))
      ) {
        showToast(data.message || 'Password reset successfully! Please login.', 'success');
        setTimeout(() => {
          navigate('/login-password');
        }, 1200);
      } else {
        const errorMsg =
          data.message || data.error || 'Failed to reset password. Please verify the OTP and try again.';
        showToast(errorMsg, 'error');
        setErrors({ api: errorMsg });
      }
    } catch (error) {
      /* console.error('=== [Reset Password] Error:', error); */
      showToast('Network error while resetting password. Please try again.', 'error');
      setErrors({ api: 'Network error. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clapkart-login-auth-container">
      {/* Left hero side matching /login */}
      <div
        className="clapkart-login-auth-left"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <img src={logoText} alt="CLAP KARTEL" className="clapkart-login-clap-kartel-logo" />
      </div>

      {/* Right form side matching /login */}
      <div className="clapkart-login-auth-right">
        <div className="clapkart-login-auth-form-container">
          
          {/* Back button */}
          <div className="forgot-password-top-nav">
            <button
              type="button"
              className="forgot-password-nav-back"
              onClick={() => {
                if (step === 2) {
                  setStep(1);
                } else {
                  navigate('/login-password');
                }
              }}
            >
              <ArrowLeft size={16} />
              <span>{step === 2 ? 'Change Email' : 'Back to Login'}</span>
            </button>
          </div>

          <div className="clapkart-login-logo-container">
            <img src={logo} alt="Clap Kartel Logo" className="clapkart-login-form-logo" />
          </div>

          <h2 className="clapkart-login-auth-title">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </h2>
          <p className="clapkart-login-auth-subtitle">
            {step === 1
              ? 'Enter your registered email address to receive a verification OTP.'
              : `Enter the OTP sent to ${email} and your new password.`}
          </p>

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="clapkart-login-auth-form">
              <div className="clapkart-login-form-group">
                <label className="clapkart-login-form-label">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter registered email (e.g. name@domain.com)"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    if (errors.api) setErrors((prev) => ({ ...prev, api: '' }));
                  }}
                  className={`clapkart-login-form-input ${errors.email ? 'input-error' : ''}`}
                  disabled={loading}
                  autoFocus
                  autoComplete="email"
                />
                {errors.email && (
                  <span className="clapkart-login-field-error">{errors.email}</span>
                )}
              </div>

              {errors.api && (
                <div className="clapkart-login-error-message">{errors.api}</div>
              )}

              <button
                type="submit"
                className="clapkart-login-submit-button"
                style={{ marginTop: '10px' }}
                disabled={loading || !email.trim()}
              >
                {loading ? 'Sending OTP…' : 'Send Verification OTP'}
              </button>

              <div className="clapkart-login-options-row" style={{ marginTop: '16px', justifyContent: 'center', gap: '20px' }}>
                <span
                  className="clapkart-login-action-link"
                  onClick={() => navigate('/login-password')}
                >
                  Login With Password
                </span>
                <span
                  className="clapkart-login-action-link"
                  onClick={() => navigate('/login')}
                >
                  Login With OTP
                </span>
              </div>
            </form>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="clapkart-login-auth-form">
              {/* OTP Input */}
              <div className="clapkart-login-form-group">
                <label className="clapkart-login-form-label">Verification OTP</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
                    if (errors.api) setErrors((prev) => ({ ...prev, api: '' }));
                  }}
                  className={`clapkart-login-form-input ${errors.otp ? 'input-error' : ''}`}
                  disabled={loading}
                  autoFocus
                />
                {errors.otp && (
                  <span className="clapkart-login-field-error">{errors.otp}</span>
                )}
              </div>

              {/* Resend OTP countdown */}
              <div className="forgot-password-resend-container">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="forgot-password-resend-action"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="forgot-password-timer-info">
                    Resend OTP in <strong>{timer}s</strong>
                  </span>
                )}
              </div>

              {/* New Password */}
              <div className="clapkart-login-form-group" style={{ marginTop: '14px' }}>
                <label className="clapkart-login-form-label">New Password</label>
                <div className="clapkart-login-password-field-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min 6 chars)"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    className={`clapkart-login-form-input ${errors.password ? 'input-error' : ''}`}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="clapkart-login-pw-toggle-btn"
                    disabled={loading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="clapkart-login-field-error">{errors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="clapkart-login-form-group" style={{ marginTop: '14px' }}>
                <label className="clapkart-login-form-label">Confirm Password</label>
                <div className="clapkart-login-password-field-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    className={`clapkart-login-form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="clapkart-login-pw-toggle-btn"
                    disabled={loading}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="clapkart-login-field-error">{errors.confirmPassword}</span>
                )}
              </div>

              {errors.api && (
                <div className="clapkart-login-error-message">{errors.api}</div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                className="clapkart-login-submit-button"
                style={{ marginTop: '16px' }}
                disabled={loading || !otp.trim() || !password || !confirmPassword}
              >
                {loading ? 'Resetting Password…' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="clapkart-login-auth-footer" style={{ marginTop: '24px' }}>
            <span className="clapkart-login-footer-text">Need an account? </span>
            <Link to="/signup" className="clapkart-login-footer-link">Create one</Link>
          </div>

          {/* Loading overlay */}
          {loading && (
            <div className="loading-overlay">
              <div className="loading-dialog">
                <div className="loader" />
                <p style={{ marginTop: '10px', color: '#333' }}>
                  {step === 1 ? 'Sending OTP, please wait…' : 'Updating password, please wait…'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
