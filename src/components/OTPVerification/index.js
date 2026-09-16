import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase';
import { ApiConstants } from '../../utils/apiConstants';
import { showToast } from '../../utils/toast';
import backgroundImage from '../../assets/background.png';
import logoText from '../../assets/Clap kartel Logo White.svg';
import logo from '../../assets/logo.png';
import './index.css';

const OTPVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [isResendEnabled, setIsResendEnabled] = useState(false);
    const [timer, setTimer] = useState(30);
    const [phone, setPhone] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    // reCAPTCHA cleanup and setup for Resend
    const cleanupRecaptcha = () => {
        try { if (window.recaptchaVerifier) { window.recaptchaVerifier.clear(); window.recaptchaVerifier = null; } } catch (e) { }
        const c = document.getElementById('recaptcha-container');
        if (c) {
            const parent = c.parentNode;
            if (parent) {
                const newC = document.createElement('div');
                newC.id = 'recaptcha-container';
                parent.replaceChild(newC, c);
            } else {
                c.innerHTML = '';
            }
        }
    };

    const setupRecaptcha = () => new Promise((resolve, reject) => {
        cleanupRecaptcha();
        setTimeout(() => { 
            try { 
                const v = new RecaptchaVerifier(auth, 'recaptcha-container', { 
                    size: 'invisible', 
                    callback: () => { }, 
                    'expired-callback': () => cleanupRecaptcha(), 
                    'error-callback': () => cleanupRecaptcha() 
                }); 
                window.recaptchaVerifier = v; 
                resolve(v); 
            } catch (err) { 
                reject(err); 
            } 
        }, 300);
    });

    useEffect(() => {
        // Get phone number from localStorage
        const storedPhone = localStorage.getItem('phone');
        if (!storedPhone) {
            showToast('Phone number not found. Please login again.', 'error');
            navigate('/login');
            return;
        }
        setPhone(storedPhone);

        return () => cleanupRecaptcha();
    }, [navigate]);

    // Timer countdown
    useEffect(() => {
        let interval = null;
        if (timer > 0 && !isResendEnabled) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setIsResendEnabled(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer, isResendEnabled]);

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspace and Enter
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'Enter') {
            if (otp.join('').length === 6 && !loading) {
                verifyOtpAndSignIn();
            }
        }
    };

    // Login API Call
    const callLoginAPI = async () => {
        const url = `${ApiConstants.baseUrl}${ApiConstants.login}`;
        setErrorMessage('');

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: phone }),
            });

            const responseData = await response.json().catch(() => ({}));
            console.log('Login API Status:', response.status, 'Data:', responseData);

            const isSuccess = response.status === 200 &&
                (responseData.access_token || responseData.accessToken || responseData.token) &&
                responseData.status !== false &&
                responseData.status !== 0 &&
                responseData.status !== '0';

            if (isSuccess) {
                const accessToken = responseData.access_token || responseData.accessToken || responseData.token || '';
                const refreshToken = responseData.refresh_token || responseData.refreshToken || '';

                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', refreshToken);
                localStorage.setItem('token', accessToken); // Primary token key for API calls

                console.log('✅ Token saved to localStorage');

                if (responseData.userData) {
                    localStorage.setItem('pstatus', responseData.userData.pstatus || '');
                    localStorage.setItem('userid', responseData.userData.userId || '');
                    localStorage.setItem('name_key', responseData.userData.userName || '');
                    localStorage.setItem('userAccount', responseData.userData.userCategory || '');
                    localStorage.setItem('email_key', responseData.userData.userEmailid || '');
                    localStorage.setItem('contact_key', responseData.userData.userContact || '');
                    localStorage.setItem('userProfileImage', responseData.userData.userProfileImage || '');
                    localStorage.setItem('userlookingFor', responseData.userData.userLookingFor || '');
                    localStorage.setItem('skill_Update', responseData.skill_Update || false);
                }

                showToast(responseData.message || 'Login successful', 'success');
                setLoading(false);

                // Navigate to home
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 500);
            } else {
                // Account is deactivated or login failed
                let errorMsg = responseData?.message || responseData?.messages?.error || responseData?.error || responseData?.msg;
                if (!errorMsg || typeof errorMsg !== 'string') {
                    errorMsg = 'This account is deactivated or login failed. Please contact support or sign up.';
                }

                console.warn('Login failed:', errorMsg);
                setLoading(false);
                setErrorMessage(errorMsg);
                showToast(errorMsg, 'error');

                // Redirect to login page after 2.5 seconds so user can read error
                setTimeout(() => {
                    navigate('/login', { replace: true, state: { loginError: errorMsg } });
                }, 2500);
            }
        } catch (e) {
            console.error('Login API Error:', e);
            const errorMsg = 'An error occurred during login. Please try again.';
            setLoading(false);
            setErrorMessage(errorMsg);
            showToast(errorMsg, 'error');

            setTimeout(() => {
                navigate('/login', { replace: true, state: { loginError: errorMsg } });
            }, 2500);
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP and Sign In
    const verifyOtpAndSignIn = async () => {
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            showToast('Please enter the 6-digit OTP code', 'error');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            // Get the confirmation result from window (stored during login)
            const confirmationResult = window.confirmationResult;

            if (!confirmationResult) {
                throw new Error('Verification session expired. Please login again.');
            }

            // Verify the OTP with Firebase
            const userCredential = await confirmationResult.confirm(otpCode);
            const user = userCredential.user;

            if (user) {
                console.log('Phone Verified Successfully:', user);
                // Call the login API
                await callLoginAPI();
            } else {
                throw new Error('User not found after OTP verification');
            }
        } catch (error) {
            console.error('Verification Error:', error);
            setLoading(false);

            let msg = 'Verification failed. Please try again.';
            if (error.code === 'auth/code-expired' || error.code === 'auth/session-expired') {
                msg = 'OTP has expired. Please click Resend Code.';
            } else if (error.code === 'auth/invalid-verification-code') {
                msg = 'Invalid OTP. Please check the code and try again.';
            } else if (error.message) {
                msg = error.message;
            }

            setErrorMessage(msg);
            showToast(msg, 'error');

            if (error.message && error.message.includes('Verification session expired')) {
                setTimeout(() => {
                    navigate('/login', { replace: true, state: { loginError: msg } });
                }, 2000);
            }
        } finally {
            // Ensure loading is never stuck
        }
    };

    // Resend OTP
    const resendCode = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const v = await setupRecaptcha();
            await v.render();
            const confirmationResult = await signInWithPhoneNumber(auth, phone, v);
            window.confirmationResult = confirmationResult;

            setTimer(30);
            setIsResendEnabled(false);
            setOtp(['', '', '', '', '', '']);
            showToast('A new OTP has been sent successfully.', 'success');
        } catch (error) {
            cleanupRecaptcha();
            console.error('Resend Error:', error);
            showToast(error.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.' : error.message || 'Failed to resend code', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="clapkart-login-auth-container">
            <div className="clapkart-login-auth-left" style={{ backgroundImage: `url(${backgroundImage})` }}>
                <img src={logoText} alt="CLAP KARTEL" className="clapkart-login-clap-kartel-logo" />
            </div>

            <div className="clapkart-login-auth-right">
                <div id="recaptcha-container"></div>
                <div className="clapkart-login-auth-form-container">
                    <div className="clapkart-login-logo-container">
                        <img src={logo} alt="Clap Kartel Logo" className="clapkart-login-form-logo" />
                    </div>

                    <h2 className="clapkart-login-auth-title">Verification Code</h2>
                    <p className="clapkart-login-auth-subtitle">
                        We have sent a verification code to:<br />
                        <strong>{phone}</strong>
                    </p>

                    {/* Error message banner */}
                    {errorMessage && (
                        <div style={{
                            backgroundColor: '#fee2e2',
                            border: '1px solid #ef4444',
                            color: '#b91c1c',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '500',
                            marginBottom: '16px',
                            textAlign: 'center',
                            lineHeight: '1.4'
                        }}>
                            <div>{errorMessage}</div>
                            <div style={{ marginTop: '4px', fontSize: '11px', color: '#991b1b' }}>
                                Redirecting to login page...
                            </div>
                        </div>
                    )}

                    {/* OTP Input Fields */}
                    <div className="otp-container">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="otp-input"
                                disabled={loading}
                            />
                        ))}
                    </div>

                    {/* Timer and Resend */}
                    <div style={{ textAlign: 'center', marginTop: '12px', marginBottom: '14px' }}>
                        <p style={{ fontSize: '13px', color: '#BF8906', marginBottom: '6px', fontFamily: 'Sen, sans-serif' }}>
                            {timer > 0 ? `Resend Code in ${timer} seconds` : 'You can resend the code now'}
                        </p>
                        <button
                            type="button"
                            onClick={resendCode}
                            disabled={!isResendEnabled || loading}
                            className="resend-button"
                            style={{
                                background: 'none',
                                border: 'none',
                                color: isResendEnabled ? '#3498db' : '#ccc',
                                textDecoration: 'underline',
                                cursor: isResendEnabled ? 'pointer' : 'not-allowed',
                                fontSize: '14px',
                            }}
                        >
                            Resend Code
                        </button>
                    </div>

                    {/* Login Button */}
                    <button
                        type="button"
                        onClick={verifyOtpAndSignIn}
                        className="clapkart-login-submit-button"
                        disabled={loading || otp.join('').length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Login'}
                    </button>

                    {/* Back to Login link */}
                    <div style={{ textAlign: 'center', marginTop: '18px' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            disabled={loading}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#666',
                                fontSize: '14px',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontFamily: 'Sen, sans-serif'
                            }}
                        >
                            ← Back to Login
                        </button>
                    </div>

                    {/* Loading Dialog */}
                    {loading && (
                        <div className="loading-overlay">
                            <div className="loading-dialog">
                                <div className="loader"></div>
                                <p style={{ marginTop: '10px', color: '#333' }}>Please wait...</p>
                                <button
                                    type="button"
                                    style={{
                                        marginTop: '12px',
                                        background: 'none',
                                        border: '1px solid #ccc',
                                        borderRadius: '6px',
                                        padding: '4px 14px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#555',
                                    }}
                                    onClick={() => {
                                        setLoading(false);
                                        navigate('/login');
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OTPVerification;
