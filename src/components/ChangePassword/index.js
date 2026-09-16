import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import '../SettingsPage/index.css';
import './index.css';

const ChangePassword = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.new_password !== formData.confirm_password) {
            setMessage({ type: 'error', text: 'New password and confirm password do not match.' });
            return;
        }

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            const token = localStorage.getItem('token');
            const formDataObj = new FormData();
            formDataObj.append('current_password', formData.current_password);
            formDataObj.append('new_password', formData.new_password);
            formDataObj.append('confirm_password', formData.confirm_password);

            const response = await fetch('https://www.whysocial.in/clap-kartel/public/user-change-password', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: formDataObj
            });

            const result = await response.json();

            if (response.ok || result.status === 'success' || result.status === true) {
                setMessage({ type: 'success', text: result.message || 'Password changed successfully!' });
                setFormData({ current_password: '', new_password: '', confirm_password: '' });
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to change password. Please check your current password and try again.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while changing password. Please try again.' });
            console.error('Change password error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-page-wrapper">
            <div className="settings-header">
                <span className="settings-back-arrow" onClick={() => navigate(-1)}>‹</span>
                <h1 className="settings-title">Change Password</h1>
            </div>

            <div className="settings-container-card text-content-card">
                <h2 className="text-content-title" style={{ marginBottom: '24px' }}>Update Password</h2>

                {message.text && (
                    <div className={`message-banner ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="change-password-form">
                    <div className="form-group">
                        <label>Current Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleChange}
                                placeholder="Enter current password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;