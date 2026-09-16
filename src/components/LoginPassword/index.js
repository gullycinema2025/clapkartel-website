import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiConstants } from '../../utils/apiConstants';
import { showToast } from '../../utils/toast';
import backgroundImage from '../../assets/background.png';
import logoText from '../../assets/Clap kartel Logo White.svg';
import logo from '../../assets/logo.png';
import './index.css';

const LoginPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const digits = formData.phoneNumber.replace(/\D/g, '');
    if (!digits) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (digits.length !== 10) {
      newErrors.phoneNumber = 'Enter a valid 10-digit mobile number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading) return;

    if (!validate()) {
      return;
    }

    setLoading(true);
    const loginUrl = `${ApiConstants.baseUrl}${ApiConstants.loginWithPassword}`;
    const cleanPhone = formData.phoneNumber.replace(/\D/g, '');

    const requestBody = {
      phoneNumber: `+91${cleanPhone}`,
      password: formData.password
    };

    console.log('API Call: Post', loginUrl);
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));

      if (response.ok || data.message === "Login successful") {
        showToast('Login successful', 'success');

        // Store tokens and user data
        localStorage.setItem('token', data.access_token || '');
        localStorage.setItem('refreshToken', data.refresh_token || '');
        if (data.userData) {
          localStorage.setItem('userData', JSON.stringify(data.userData));
          localStorage.setItem('pstatus', data.userData.pstatus || '');
          localStorage.setItem('userid', data.userData.userId || '');
          localStorage.setItem('name_key', data.userData.userName || '');
          localStorage.setItem('userAccount', data.userData.userCategory || '');
          localStorage.setItem('email_key', data.userData.userEmailid || '');
          localStorage.setItem('contact_key', data.userData.userContact || '');
          localStorage.setItem('userProfileImage', data.userData.userProfileImage || '');
          localStorage.setItem('userlookingFor', data.userData.userLookingFor || '');
        }

        navigate('/');
      } else {
        const errorMsg = data.message || data.error || 'Login failed';
        let userFriendlyError = errorMsg;
        let fieldError = {};

        if (errorMsg.toLowerCase().includes('password')) {
          userFriendlyError = 'Invalid password. Please try again.';
          fieldError = { password: userFriendlyError };
        } else if (
          errorMsg.toLowerCase().includes('user') ||
          errorMsg.toLowerCase().includes('phone') ||
          errorMsg.toLowerCase().includes('found') ||
          errorMsg.toLowerCase().includes('mobile')
        ) {
          userFriendlyError = 'User not found. Please check your number or sign up.';
          fieldError = { phoneNumber: userFriendlyError };
        }

        showToast(userFriendlyError, 'error');
        setErrors(prev => ({ ...prev, ...fieldError, api: userFriendlyError }));
      }
    } catch (error) {
      console.error('Login Error:', error);
      showToast('An error occurred during login. Please try again.', 'error');
      setErrors({ api: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phoneNumber: digits }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.api) {
      setErrors(prev => ({ ...prev, api: '' }));
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
          <div className="clapkart-login-logo-container">
            <img src={logo} alt="Clap Kartel Logo" className="clapkart-login-form-logo" />
          </div>

          <h2 className="clapkart-login-auth-title">Login with Password</h2>
          <p className="clapkart-login-auth-subtitle">Please enter your credentials to continue to your account.</p>

          <form onSubmit={handleSubmit} className="clapkart-login-auth-form">
            {/* Mobile number field */}
            <div className="clapkart-login-form-group">
              <label className="clapkart-login-form-label">Mobile Number</label>
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Enter 10-digit mobile number"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`clapkart-login-form-input ${errors.phoneNumber ? 'input-error' : ''}`}
                maxLength="10"
                disabled={loading}
                autoComplete="tel"
              />
              {errors.phoneNumber && (
                <span className="clapkart-login-field-error">{errors.phoneNumber}</span>
              )}
            </div>

            {/* Password field */}
            <div className="clapkart-login-form-group" style={{ marginTop: '20px' }}>
              <label className="clapkart-login-form-label">Password</label>
              <div className="clapkart-login-password-field-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`clapkart-login-form-input ${errors.password ? 'input-error' : ''}`}
                  disabled={loading}
                  autoComplete="current-password"
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

            {/* Action options row */}
            <div className="clapkart-login-options-row">
              <span
                className="clapkart-login-action-link"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </span>
              <span
                className="clapkart-login-action-link"
                onClick={() => navigate('/login')}
              >
                Login With OTP
              </span>
            </div>

            {errors.api && (
              <div className="clapkart-login-error-message">{errors.api}</div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="clapkart-login-submit-button"
              disabled={loading || formData.phoneNumber.length !== 10 || !formData.password}
            >
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

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
                <p style={{ marginTop: '10px', color: '#333' }}>Logging in, please wait…</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPassword;