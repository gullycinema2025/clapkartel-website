import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase';
import { ApiConstants } from '../../utils/apiConstants';
import { showToast } from '../../utils/toast';
import backgroundImage from '../../assets/background.png';
import logoText from '../../assets/clap-kartel-logo.svg';
import logo from '../../assets/logo.png';
import './index.css';

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setMobileNumber(value);
    }
  };

  // Initialize reCAPTCHA
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (response) => {
            console.log('✅ reCAPTCHA verified successfully');
          },
          'expired-callback': () => {
            console.log('❌ reCAPTCHA expired');
            showToast('reCAPTCHA expired. Please try again.', 'error');
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = null;
            }
          }
        });

        // Render the reCAPTCHA
        window.recaptchaVerifier.render().then(() => {
          console.log('✅ reCAPTCHA widget rendered');
        }).catch((error) => {
          console.error('❌ reCAPTCHA render error:', error);
        });
      } catch (error) {
        console.error('❌ reCAPTCHA setup error:', error);
      }
    }
  };

  // Verify phone number with backend API
  const verifyPhoneNumberForLogin = async (phoneNumber) => {
    const url = `${ApiConstants.baseUrl}${ApiConstants.verifyOtp}`;
    console.log('Requesting URL:', url);

    const body = JSON.stringify({
      phoneNumber: `+91${phoneNumber}`,
    });

    console.log('Request body:', body);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      // Read the response body first
      const responseText = await response.text();

      console.log('HTTP Status:', response.status);
      console.log('Response Body:', responseText);

      if (response.status === 400) {
        // User exists, proceed with Firebase OTP
        return true;
      } else {
        showToast('Invalid Mobile Number. Please Sign Up', 'error');
        console.log('Verification failed');
        return false;
      }
    } catch (e) {
      console.error('Error during verification:', e);
      showToast('An error occurred. Please try again.', 'error');
      return false;
    }
  };

  // Handle Firebase Phone Authentication
  const handleTap = async () => {
    if (loading) return;

    console.log('Starting phone verification...');

    const phone = mobileNumber.trim();

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        `+91${phone}`,
        appVerifier
      );

      console.log('OTP sent successfully');

      // Store verification details in localStorage
      localStorage.setItem('phone', `+91${phone}`);
      localStorage.setItem('verificationId', confirmationResult.verificationId);

      // Store the confirmation result for verification
      window.confirmationResult = confirmationResult;

      showToast('OTP sent successfully', 'success');

      // Navigate to OTP screen
      navigate('/verify-otp');

    } catch (error) {
      console.error('Error during phone verification:', error);
      setLoading(false);

      // More specific error messages
      if (error.code === 'auth/invalid-phone-number') {
        showToast('Invalid phone number format', 'error');
      } else if (error.code === 'auth/too-many-requests') {
        showToast('Too many requests. Please try again later.', 'error');
      } else if (error.code === 'auth/captcha-check-failed') {
        showToast('reCAPTCHA verification failed. Please refresh and try again.', 'error');
      } else {
        showToast(`Verification failed: ${error.message}`, 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('=== FORM SUBMIT TRIGGERED ===');
    console.log('Mobile Number:', mobileNumber);
    console.log('Mobile Number Length:', mobileNumber.length);
    console.log('Loading State:', loading);

    if (mobileNumber.length !== 10) {
      console.log('Validation failed: Phone number must be 10 digits');
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    console.log('Starting login process...');
    setLoading(true);

    try {
      const phoneNumber = mobileNumber.trim();
      console.log('Trimmed phone number:', phoneNumber);

      // First verify with backend
      console.log('Calling verifyPhoneNumberForLogin...');
      const canProceed = await verifyPhoneNumberForLogin(phoneNumber);
      console.log('Backend verification result:', canProceed);

      if (canProceed) {
        // If backend verification passes, send OTP via Firebase
        console.log('Proceeding to Firebase OTP...');
        await handleTap();
      } else {
        console.log('Backend verification failed, stopping here');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login Error:', error);
      showToast(error.message || 'Login failed', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="clapkart-login-auth-container">
      <div className="clapkart-login-auth-left" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <img src={logoText} alt="CLAP KARTEL" className="clapkart-login-clap-kartel-logo" />
      </div>

      <div className="clapkart-login-auth-right">
        <div className="clapkart-login-auth-form-container">
          <div className="clapkart-login-logo-container">
            <img src={logo} alt="Clap Kartel Logo" className="clapkart-login-form-logo" />
          </div>

          <h2 className="clapkart-login-auth-title">Login</h2>
          <p className="clapkart-login-auth-subtitle">Please login to continue to your account.</p>

          <form onSubmit={handleSubmit}>
            <div className="clapkart-login-form-group">
              <label className="clapkart-login-form-label">Mobile Number</label>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={handlePhoneNumberChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading && mobileNumber.length === 10) {
                    handleSubmit(e);
                  }
                }}
                className="clapkart-login-form-input"
                maxLength="10"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="clapkart-login-submit-button"
              disabled={loading || mobileNumber.length !== 10}
              onClick={(e) => {
                console.log('Button clicked!');
                console.log('Mobile number:', mobileNumber);
                console.log('Loading:', loading);
                console.log('Length:', mobileNumber.length);
              }}
            >
              {loading ? 'Processing...' : 'Send Verification Code'}
            </button>

            {/* reCAPTCHA container (visible for development) */}
            <div id="recaptcha-container"></div>
          </form>

          <div className="clapkart-login-auth-footer" style={{ marginTop: '20px' }}>
            <span className="clapkart-login-footer-text">Need an account? </span>
            <a href="/signup" className="clapkart-login-footer-link">Create one</a>
          </div>

          {/* Loading Dialog */}
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

export default Login;
