import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { ApiConstants } from '../../utils/apiConstants';
import { showToast } from '../../utils/toast';
import backgroundImage from '../../assets/background.png';
import logoText from '../../assets/Clap kartel Logo White.svg';
import logo from '../../assets/logo.png';
import './index.css';

// ─── Promise with hard timeout ────────────────────────────────────────────────
const withTimeout = (promise, ms, timeoutMsg) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(timeoutMsg)), ms)
        ),
    ]);

const Login = () => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageError, setPageError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Ref guard — prevents two submissions running at the same time
    const submittingRef = useRef(false);

    // ─── reCAPTCHA cleanup ────────────────────────────────────────────────────

    const cleanupRecaptcha = useCallback(() => {
        // 1. Firebase SDK release
        try {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
            }
        } catch (_) { }
        window.recaptchaVerifier = null;

        // 2. Replace container node so no stale iframe survives
        const old = document.getElementById('recaptcha-container'); 
        if (old && old.parentNode) {
            const fresh = document.createElement('div');
            fresh.id = 'recaptcha-container';
            old.parentNode.replaceChild(fresh, old);
        }

        // 3. Kill any global floating reCAPTCHA elements
        try {
            document.querySelectorAll(
                '.grecaptcha-badge, iframe[src*="recaptcha"], iframe[title*="reCAPTCHA"]'
            ).forEach(el => { try { el.remove(); } catch (_) { } });
        } catch (_) { }

        // 4. Reset internal widget counter
        try {
            if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
                window.grecaptcha.reset();
            }
        } catch (_) { }
    }, []);

    // ─── Mount / unmount ──────────────────────────────────────────────────────

    useEffect(() => {
        const resetSession = async () => {
            submittingRef.current = false;
            setLoading(false);
            try { 
                if (auth.currentUser) {
                    await signOut(auth); 
                }
            } catch (_) { }
            cleanupRecaptcha();
            window.confirmationResult = null;
        };
        resetSession();

        if (location.state?.loginError) {
            setPageError(location.state.loginError);
        }

        return () => { cleanupRecaptcha(); };
    }, [cleanupRecaptcha, location.state]);

    // ─── reCAPTCHA setup ─────────────────────────────────────────────────────

    const setupRecaptcha = useCallback(() => new Promise((resolve, reject) => {
        cleanupRecaptcha();

        // Let the DOM settle after the node replacement
        setTimeout(() => {
            try {
                const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    size: 'invisible',
                    callback: () => { /* console.log('✅ reCAPTCHA solved'); */ },
                    'expired-callback': () => {
                        /* console.warn('⚠️ reCAPTCHA expired'); */
                        cleanupRecaptcha();
                    },
                    'error-callback': () => {
                        /* console.error('❌ reCAPTCHA error'); */
                        cleanupRecaptcha();
                    },
                });
                window.recaptchaVerifier = verifier;
                resolve(verifier);
            } catch (err) {
                reject(err);
            }
        }, 300);
    }), [cleanupRecaptcha]);

    // ─── Backend phone-existence check ────────────────────────────────────────

    const verifyPhoneWithBackend = async (phone) => {
        const url = `${ApiConstants.baseUrl}${ApiConstants.verifyOtp}`;
        try {
            const response = await withTimeout(
                fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber: `+91${phone}` }),
                }),
                10000,
                'Backend check timed out'
            );
            /* console.log('Backend status:', response.status); */
            if (response.status === 400) return true; // user exists → proceed
            showToast('📵 This mobile number is not registered. Please sign up to create an account.', 'error');
            return false;
        } catch (err) {
            /* console.error('Backend check error:', err); */
            if (err.message === 'Backend check timed out') {
                showToast('⏱️ Server is taking too long to respond. Please check your connection and try again.', 'error');
            } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
                showToast('📶 No internet connection detected. Please check your network and try again.', 'error');
            } else {
                showToast('🚫 Unable to reach the server right now. Please try again in a moment.', 'error');
            }
            return false;
        }
    };

    // ─── Shared error reset ───────────────────────────────────────────────────

    const resetAfterError = useCallback((shouldReload = false) => {
        submittingRef.current = false;
        setLoading(false);
        cleanupRecaptcha();
        if (shouldReload) {
            // Wait 2.5 seconds so the user can read the toast message before reload
            setTimeout(() => {
                window.location.replace('/login');
            }, 2500);
        }
    }, [cleanupRecaptcha]);

    // ─── Main submit handler ──────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (submittingRef.current) return;

        const phone = mobileNumber.trim();
        if (phone.length !== 10) {
            showToast('⚠️ Please enter a valid 10-digit mobile number to continue.', 'error');
            return;
        }

        submittingRef.current = true;
        setLoading(true);

        try {
            // ── Step 1: backend check ──────────────────────────────────────
            const phoneOk = await verifyPhoneWithBackend(phone);
            if (!phoneOk) {
                resetAfterError(false);
                return;
            }

            // ── Step 2: reCAPTCHA verifier setup ───────────────────────────
            let verifier;
            try {
                verifier = await setupRecaptcha();
                // render() can silently hang — give it 10 s
                await withTimeout(
                    verifier.render(),
                    10000,
                    'reCAPTCHA render timed out'
                );
            } catch (rcErr) {
                /* console.error('reCAPTCHA setup/render failed:', rcErr); */
                showToast(
                    rcErr.message === 'reCAPTCHA render timed out'
                        ? '⏱️ Security check is taking too long. Please refresh the page and try again.'
                        : '🔒 Security verification failed to load. Please refresh the page and try again.',
                    'error'
                );
                resetAfterError(true);
                return;
            }

            // ── Step 3: send OTP — 15 s hard timeout ──────────────────────
            let confirmationResult;
            try {
                confirmationResult = await withTimeout(
                    signInWithPhoneNumber(auth, `+91${phone}`, verifier),
                    15000,
                    'OTP request timed out'
                );
            } catch (fbErr) {
                /* console.error('Firebase OTP error:', fbErr); */
                const msg =
                    fbErr.message === 'OTP request timed out'
                        ? '⏱️ OTP request timed out. Please try again.'
                        : fbErr.code === 'auth/invalid-phone-number'
                        ? '📵 The mobile number you entered is invalid. Please check and try again.'
                        : fbErr.code === 'auth/too-many-requests'
                        ? '🚫 Too many OTP requests from this number. Please wait a few minutes and try again.'
                        : fbErr.code === 'auth/captcha-check-failed'
                        ? '🔒 Security check failed. Please refresh the page and try again.'
                        : fbErr.code === 'auth/quota-exceeded'
                        ? '🚫 SMS quota exceeded. Please try again later.'
                        : fbErr.code === 'auth/user-disabled'
                        ? '🚫 This account has been disabled. Please contact support.'
                        : '❌ Failed to send OTP. Please check your number and try again.';
                showToast(msg, 'error');
                resetAfterError(true);
                return;
            }

            // ── Step 4: success ────────────────────────────────────────────
            window.confirmationResult = confirmationResult;
            localStorage.setItem('phone', `+91${phone}`);
            localStorage.setItem('verificationId', confirmationResult.verificationId);

            showToast('OTP sent successfully!', 'success');

            submittingRef.current = false;
            setLoading(false);
            navigate('/verify-otp');

        } catch (unexpected) {
            /* console.error('Unexpected login error:', unexpected); */
            showToast('❌ Something went wrong. Please try again or refresh the page.', 'error');
            resetAfterError(true);
        }
    };

    const handlePhoneNumberChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '');
        if (digits.length <= 10) setMobileNumber(digits);
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="clapkart-login-auth-container">
            <div
                className="clapkart-login-auth-left"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <img src={logoText} alt="CLAP KARTEL" className="clapkart-login-clap-kartel-logo" />
            </div>

            <div className="clapkart-login-auth-right">
                <div className="clapkart-login-auth-form-container">
                    <div className="clapkart-login-logo-container">
                        <img src={logo} alt="Clap Kartel Logo" className="clapkart-login-form-logo" />
                    </div>

                    <h2 className="clapkart-login-auth-title">Login</h2>
                    <p className="clapkart-login-auth-subtitle">Please login to continue to your account.</p>

                    {pageError && (
                        <div style={{
                            backgroundColor: '#fee2e2',
                            border: '1px solid #ef4444',
                            color: '#b91c1c',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '500',
                            marginBottom: '16px',
                            textAlign: 'center',
                            lineHeight: '1.4'
                        }}>
                            {pageError}
                        </div>
                    )}

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
                                autoComplete="tel"
                            />
                            <p
                                className="login-with-password"
                                onClick={() => navigate('/login-password')}
                            >
                                Login With Password
                            </p>
                        </div>

                        {/* Invisible reCAPTCHA anchor */}
                        <div id="recaptcha-container" />

                        <button
                            type="submit"
                            className="clapkart-login-submit-button"
                            disabled={loading || mobileNumber.length !== 10}
                        >
                            {loading ? 'Processing…' : 'Send Verification Code'}
                        </button>
                    </form>

                    <div className="clapkart-login-auth-footer" style={{ marginTop: '20px' }}>
                        <span className="clapkart-login-footer-text">Need an account? </span>
                        <a href="/signup" className="clapkart-login-footer-link">Create one</a>
                    </div>

                    {/* Loading overlay with cancel escape hatch */}
                    {loading && (
                        <div className="loading-overlay">
                            <div className="loading-dialog">
                                <div className="loader" />
                                <p style={{ marginTop: '10px', color: '#333' }}>Please wait…</p>
                                <button
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
                                    onClick={() => resetAfterError()}
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

export default Login;
