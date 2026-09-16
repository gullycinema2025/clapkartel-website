import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';
import backgroundImage from '../../assets/background.png';
import logo from '../../assets/logo.png';
import { showToast } from '../../utils/toast';
import './index.css';

const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';

// Hard timeout wrapper — prevents promises from hanging forever
const withTimeout = (promise, ms, timeoutMsg) =>
    Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(timeoutMsg)), ms)
        ),
    ]);

const Signup = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        lookingfor: '1', fullName: '', phoneNumber: '', emailId: '', password: '', confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showCpw, setShowCpw] = useState(false);

    // Ref guard — prevents double-submit
    const submittingRef = useRef(false);

    // ─── reCAPTCHA helpers ────────────────────────────────────────────────────

    const cleanupRecaptcha = useCallback(() => {
        // 1. Firebase SDK internal release
        try {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
            }
        } catch (_) { }
        window.recaptchaVerifier = null;

        // 2. Replace DOM container so no stale iframe can linger
        const oldNode = document.getElementById('recaptcha-container');
        if (oldNode && oldNode.parentNode) {
            const fresh = document.createElement('div');
            fresh.id = 'recaptcha-container';
            oldNode.parentNode.replaceChild(fresh, oldNode);
        }

        // 3. Kill any floating badge / iframes injected globally by the SDK
        try {
            document.querySelectorAll(
                '.grecaptcha-badge, iframe[src*="recaptcha"], iframe[title*="reCAPTCHA"]'
            ).forEach(el => { try { el.remove(); } catch (_) { } });
        } catch (_) { }

        // 4. Reset the internal widget counter if the API exposes it
        try {
            if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
                window.grecaptcha.reset();
            }
        } catch (_) { }
    }, []);

    // ─── Mount / unmount lifecycle ────────────────────────────────────────────

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

        return () => {
            cleanupRecaptcha();
            window.confirmationResult = null;
        };
    }, [cleanupRecaptcha]);

    // ─── Create a fresh RecaptchaVerifier ────────────────────────────────────

    const setupRecaptcha = useCallback(() => new Promise((resolve, reject) => {
        cleanupRecaptcha();
        // Allow the DOM node replacement to settle before Firebase touches it
        setTimeout(() => {
            try {
                const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    size: 'invisible',
                    callback: () => { },
                    'expired-callback': () => cleanupRecaptcha(),
                    'error-callback': () => cleanupRecaptcha(),
                });
                window.recaptchaVerifier = verifier;
                resolve(verifier);
            } catch (err) {
                reject(err);
            }
        }, 300);
    }), [cleanupRecaptcha]);

    // ─── Full reset after any error ───────────────────────────────────────────

    const resetAfterError = useCallback((shouldReload = false) => {
        submittingRef.current = false;
        setLoading(false);
        cleanupRecaptcha();
        if (shouldReload) {
            // Wait 2.5 seconds so the user can read the error message alert before reload
            setTimeout(() => {
                window.location.replace('/signup');
            }, 2500);
        }
    }, [cleanupRecaptcha]);

    // ─── Validation ───────────────────────────────────────────────────────────

    const validate = () => {
        const e = {};
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.fullName.trim()) e.fullName = 'Please enter your full name.';
        if (!formData.phoneNumber) e.phoneNumber = 'Please enter your phone number.';
        else if (formData.phoneNumber.length !== 10) e.phoneNumber = 'Phone number must be exactly 10 digits.';
        if (!formData.emailId.trim()) e.emailId = 'Please enter your email address.';
        else if (!emailRe.test(formData.emailId)) e.emailId = 'Please enter a valid email address (e.g. name@example.com).';
        if (!formData.password) e.password = 'Please create a password.';
        else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters long.';
        if (!formData.confirmPassword) e.confirmPassword = 'Please confirm your password.';
        else if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match. Please re-enter.';
        if (!agreeTerms) e.terms = 'You must accept the Terms of Service and Privacy Policy to continue.';
        setFormErrors(e);
        return Object.keys(e).length === 0;
    };

    // ─── Field change handlers ────────────────────────────────────────────────

    const handleChange = (ev) => {
        const { name, value } = ev.target;
        if (name === 'phoneNumber') {
            const digits = value.replace(/\D/g, '');
            if (digits.length <= 10) setFormData(p => ({ ...p, [name]: digits }));
        } else {
            setFormData(p => ({ ...p, [name]: value }));
        }
        if (formErrors[name]) setFormErrors(p => ({ ...p, [name]: '' }));
        setError('');
    };

    const handleOtpChange = (ev) => {
        const digits = ev.target.value.replace(/\D/g, '');
        if (digits.length <= 6) { setOtpCode(digits); setError(''); }
    };

    // ─── Send OTP ─────────────────────────────────────────────────────────────

    const handleSubmit = async (ev) => {
        if (ev && ev.preventDefault) ev.preventDefault();

        // Hard guard: never run two submissions concurrently
        if (submittingRef.current) return;
        if (!validate()) return;

        submittingRef.current = true;
        setLoading(true);
        setError('');

        try {
            // Check if user already exists
            const checkUrl = `${BASE_URL}/auth/verifyotp`;
            let userExists = false;
            try {
                const checkRes = await withTimeout(
                    fetch(checkUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phoneNumber: `+91${formData.phoneNumber}` }),
                    }),
                    10000,
                    'Backend check timed out'
                );
                if (checkRes.status === 400) {
                    userExists = true;
                }
            } catch (err) {
                console.error('Backend check error:', err);
                if (err.message === 'Backend check timed out') {
                    setError('⏱️ Server is taking too long to respond. Please check your connection and try again.');
                    resetAfterError(false);
                    return;
                }
            }

            if (userExists) {
                setError('📵 This mobile number or email is already registered. Please log in instead.');
                resetAfterError(false);
                return;
            }

            // Set up a clean reCAPTCHA verifier
            let verifier;
            try {
                verifier = await setupRecaptcha();
                // render() can silently hang — 10 s hard timeout
                await withTimeout(
                    verifier.render(),
                    10000,
                    'reCAPTCHA render timed out'
                );
            } catch (rcErr) {
                console.error('reCAPTCHA setup failed:', rcErr);
                setError(
                    rcErr.message === 'reCAPTCHA render timed out'
                        ? '⏱️ Security check is taking too long. Please refresh the page and try again.'
                        : '🔒 Security verification failed to load. Please refresh the page and try again.'
                );
                resetAfterError(true);
                return;
            }

            // Fire the OTP — 15 s hard timeout so it can never hang forever
            let confirmationResult;
            try {
                confirmationResult = await withTimeout(
                    signInWithPhoneNumber(auth, `+91${formData.phoneNumber}`, verifier),
                    15000,
                    'OTP request timed out'
                );
            } catch (fbErr) {
                console.error('Firebase OTP error:', fbErr);
                const msg =
                    fbErr.message === 'OTP request timed out'
                        ? '⏱️ OTP request timed out. Please try again.'
                        : fbErr.code === 'auth/too-many-requests'
                            ? '🚫 Too many OTP requests from this number. Please wait a few minutes and try again.'
                            : fbErr.code === 'auth/invalid-phone-number'
                                ? '📵 The mobile number you entered is invalid. Please check and try again.'
                                : fbErr.code === 'auth/captcha-check-failed'
                                    ? '🔒 Security check failed. Please refresh the page and try again.'
                                    : fbErr.code === 'auth/quota-exceeded'
                                        ? '🚫 SMS quota exceeded. Please try again later.'
                                        : '❌ Failed to send OTP. Please check your number and try again.';
                setError(msg);
                resetAfterError(true);
                return;
            }

            // Success
            window.confirmationResult = confirmationResult;
            submittingRef.current = false;
            setLoading(false);
            setOtpSent(true);

        } catch (unexpected) {
            console.error('Unexpected signup error:', unexpected);
            setError('❌ Something went wrong. Please try again or refresh the page.');
            resetAfterError(true);
        }
    };

    // ─── Verify OTP & register ────────────────────────────────────────────────

    const verifyOtp = async () => {
        if (!otpCode || otpCode.length !== 6) { setError('⚠️ Please enter the complete 6-digit OTP sent to your mobile.'); return; }
        if (submittingRef.current) return;

        submittingRef.current = true;
        setLoading(true);
        setError('');

        try {
            if (!window.confirmationResult) throw new Error('⏳ Your OTP session has expired. Please go back and request a new OTP.');

            const result = await window.confirmationResult.confirm(otpCode);
            const phone = result?.user?.phoneNumber || `+91${formData.phoneNumber}`;
            if (phone) localStorage.setItem('phoneNumber', phone);

            // Register with backend using multipart/form-data
            const body = new FormData();
            body.append('fullName', formData.fullName);
            body.append('phoneNumber', phone);
            body.append('email', formData.emailId);
            body.append('password', formData.password);
            body.append('secretKey', result?.user?.uid || '');
            // lookingfor: '1'=Skills → backend '0' ; '2'=Services → backend '1'
            // Mobile app sends '1' for Skills, '2' for Services — pass directly, no conversion
            body.append('lookingfor', formData.lookingfor);

            const res = await fetch(`${BASE_URL}/auth/register`, { method: 'POST', body });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || data?.error || 'Registration failed');

            // Persist auth tokens
            const token = data?.token || data?.access_token || data?.data?.token;
            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('access_token', token);
            }
            const refreshToken = data?.refresh_token || data?.refreshToken;
            if (refreshToken) {
                localStorage.setItem('refresh_token', refreshToken);
                localStorage.setItem('refreshToken', refreshToken);
            }
            if (data?.userData) {
                const u = data.userData;
                localStorage.setItem('userData', JSON.stringify(u));
                localStorage.setItem('pstatus', u.pstatus || '');
                localStorage.setItem('userid', u.userId || '');
                localStorage.setItem('name_key', u.userName || '');
                localStorage.setItem('userAccount', u.userCategory || '');
                localStorage.setItem('email_key', u.userEmailid || '');
                localStorage.setItem('contact_key', u.userContact || '');
                localStorage.setItem('industry_key', u.industry_id || '');
                localStorage.setItem('userlookingFor', u.userLookingFor || '');
            }

            showToast('Registration successful!', 'success');

            submittingRef.current = false;
            setLoading(false);

            // Redirect based on backend category or home page
            navigate('/');

        } catch (err) {
            console.error('OTP verify / register error:', err);
            submittingRef.current = false;
            setLoading(false);

            if (err.code === 'auth/code-expired' || err.code === 'auth/session-expired') {
                setError('⏳ Your OTP has expired. Please click "Resend OTP" to receive a new code.');
            } else if (err.code === 'auth/invalid-verification-code') {
                setError('❌ The OTP you entered is incorrect. Please double-check and try again.');
            } else if (err.code === 'auth/missing-verification-code') {
                setError('⚠️ Please enter the OTP sent to your mobile number.');
            } else if (err.message && err.message.includes('already exists')) {
                setError('📵 This mobile number is already registered. Please log in instead.');
            } else if (err.message && err.message.includes('Registration failed')) {
                setError('🚫 Registration failed. Please check your details and try again.');
            } else {
                setError(err.message || '❌ Verification failed. Please try again.');
            }
        }
    };

    // Resend: collapse OTP view → send a fresh OTP
    const handleResend = async () => {
        if (submittingRef.current) return;
        setOtpSent(false);
        setOtpCode('');
        setError('');
        cleanupRecaptcha();
        window.confirmationResult = null;
        setTimeout(() => handleSubmit({ preventDefault: () => { } }), 500);
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="su-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className="su-page-overlay" />

            <div id="recaptcha-container" />

            {!otpSent ? (
                <div className="su-card">
                    <img src={logo} alt="Clap Kartel" className="su-card-logo" />
                    <h2 className="su-card-title">Create an Account</h2>
                    <p className="su-card-sub">Step into the Cinema World</p>

                    {error && <div className="su-global-err" style={{ marginBottom: '16px' }}>{error}</div>}

                    <form onSubmit={handleSubmit} className="su-form">
                        <div className="su-provide">
                            <span className="su-provide-label">What do you want to provide?</span>
                            <div className="su-pills">
                                <label className={`su-pill ${formData.lookingfor === '1' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="lookingfor"
                                        value="1"
                                        checked={formData.lookingfor === '1'}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    Skills
                                </label>
                                <label className={`su-pill ${formData.lookingfor === '2' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="lookingfor"
                                        value="2"
                                        checked={formData.lookingfor === '2'}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    Services
                                </label>
                            </div>
                        </div>

                        <div className="su-f">
                            <label>Full Name</label>
                            <div className={`su-box ${formErrors.fullName ? 'err' : ''}`}>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter your name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                            {formErrors.fullName && <span className="su-err">{formErrors.fullName}</span>}
                        </div>

                        <div className="su-f">
                            <label>Phone Number</label>
                            <div className={`su-box ${formErrors.phoneNumber ? 'err' : ''}`}>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="Enter your mobile number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    maxLength="10"
                                    disabled={loading}
                                />
                            </div>
                            {formErrors.phoneNumber && <span className="su-err">{formErrors.phoneNumber}</span>}
                        </div>

                        <div className="su-f">
                            <label>Email ID</label>
                            <div className={`su-box ${formErrors.emailId ? 'err' : ''}`}>
                                <input
                                    type="email"
                                    name="emailId"
                                    placeholder="Enter your email address"
                                    value={formData.emailId}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                            {formErrors.emailId && <span className="su-err">{formErrors.emailId}</span>}
                        </div>

                        <div className="su-f">
                            <label>Password</label>
                            <div className={`su-box ${formErrors.password ? 'err' : ''}`}>
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="su-eye"
                                    onClick={() => setShowPw(!showPw)}
                                    tabIndex="-1"
                                >
                                    {showPw ? (
                                        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    ) : (
                                        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    )}
                                </button>
                            </div>
                            {formErrors.password && <span className="su-err">{formErrors.password}</span>}
                        </div>

                        <div className="su-f">
                            <label>Confirm Password</label>
                            <div className={`su-box ${formErrors.confirmPassword ? 'err' : ''}`}>
                                <input
                                    type={showCpw ? 'text' : 'password'}
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="su-eye"
                                    onClick={() => setShowCpw(!showCpw)}
                                    tabIndex="-1"
                                >
                                    {showCpw ? (
                                        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    ) : (
                                        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    )}
                                </button>
                            </div>
                            {formErrors.confirmPassword && <span className="su-err">{formErrors.confirmPassword}</span>}
                        </div>

                        <div className="su-terms">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                className="su-cb"
                                checked={agreeTerms}
                                onChange={(e) => {
                                    setAgreeTerms(e.target.checked);
                                    if (formErrors.terms) setFormErrors(p => ({ ...p, terms: '' }));
                                }}
                                disabled={loading}
                            />
                            <label htmlFor="agreeTerms" className="su-terms-txt">
                                By signing up, you agree to our <a href="/terms-conditions" style={{ color: '#BF8906', fontWeight: 600 }}>Terms of Service</a> and <a href="/privacy-policy" style={{ color: '#BF8906', fontWeight: 600 }}>Privacy Policy</a>
                            </label>
                        </div>
                        {formErrors.terms && <span className="su-err" style={{ display: 'block', marginTop: '-4px', marginBottom: '12px' }}>{formErrors.terms}</span>}

                        <button
                            type="submit"
                            className="su-btn"
                            disabled={loading}
                        >
                            {loading && <div className="su-spin" />}
                            {loading ? 'Processing…' : 'Send Verification Code'}
                        </button>
                    </form>

                    <div className="su-foot" style={{ marginTop: '20px' }}>
                        <span>Already have an account? </span>
                        <Link to="/login" className="su-foot-link">Login</Link>
                    </div>
                </div>
            ) : (
                <div className="su-card">
                    <img src={logo} alt="Clap Kartel" className="su-card-logo" />
                    <h2 className="su-card-title">Verify OTP</h2>
                    <p className="su-card-sub" style={{ textAlign: 'center', marginBottom: '20px' }}>
                        We have sent a verification code to <strong style={{ color: '#BF8906' }}>+91{formData.phoneNumber}</strong>
                    </p>

                    {error && <div className="su-global-err" style={{ marginBottom: '16px' }}>{error}</div>}

                    <div className="su-f">
                        <label>Verification Code</label>
                        <div className="su-box">
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otpCode}
                                onChange={handleOtpChange}
                                maxLength="6"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        onClick={verifyOtp}
                        className="su-btn"
                        disabled={loading || otpCode.length !== 6}
                        style={{ marginTop: '24px' }}
                    >
                        {loading && <div className="su-spin" />}
                        {loading ? 'Verifying…' : 'Create Account'}
                    </button>

                    <button
                        onClick={handleResend}
                        className="su-btn-ghost"
                        disabled={loading}
                        style={{ marginTop: '12px' }}
                    >
                        Resend Code
                    </button>

                    <div className="su-foot" style={{ marginTop: '20px' }}>
                        <span>Want to change details? </span>
                        <span onClick={() => setOtpSent(false)} className="su-foot-link" style={{ cursor: 'pointer' }}>Go Back</span>
                    </div>
                </div>
            )}

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
    );
};

export default Signup;