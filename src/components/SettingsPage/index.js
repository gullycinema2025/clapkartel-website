import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    return (
        <div className="settings-page-wrapper">
            {/* Header Area */}
            <div className="settings-header">
                <span className="settings-back-arrow" onClick={() => navigate(-1)}>‹</span>
                <h1 className="settings-title">Settings</h1>
            </div>

            <div className="settings-container-card">
                {/* General Section */}
                <div className="settings-section">
                    <h2 className="settings-section-title">General</h2>

                    <div className="settings-item-card toggle-card">
                        <div className="settings-item-left">
                            <span className="settings-icon">🔔</span>
                            <span className="settings-item-text">Notifications</span>
                        </div>
                        <div
                            className={`settings-toggle ${notificationsEnabled ? 'active' : ''}`}
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        >
                            <div className="settings-toggle-circle"></div>
                        </div>
                    </div>
                </div>

                {/* Support Section */}
                <div className="settings-section">
                    <h2 className="settings-section-title">Support</h2>

                    {/* Change Password */}
                    <div className="settings-item-card" onClick={() => navigate('/change-password')}>
                        <div className="settings-item-left">
                            <span className="settings-icon">🔑</span>
                            <span className="settings-item-text">Change Password</span>
                        </div>
                        <span className="settings-arrow">›</span>
                    </div>

                    {/* Privacy Policy */}
                    <div className="settings-item-card" onClick={() => navigate('/privacy-policy')}>
                        <div className="settings-item-left">
                            <span className="settings-icon">🛡️</span>
                            <span className="settings-item-text">Privacy Policy</span>
                        </div>
                        <span className="settings-arrow">›</span>
                    </div>

                    {/* Account Settings */}
                    <div className="settings-item-card" onClick={() => navigate('/account-settings')}>
                        <div className="settings-item-left">
                            <span className="settings-icon">👤</span>
                            <span className="settings-item-text">Account Settings</span>
                        </div>
                        <span className="settings-arrow">›</span>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="settings-item-card" onClick={() => navigate('/terms-conditions')}>
                        <div className="settings-item-left">
                            <span className="settings-icon">📄</span>
                            <span className="settings-item-text">Terms &amp; Conditions</span>
                        </div>
                        <span className="settings-arrow">›</span>
                    </div>

                    {/* Help */}
                    <div className="settings-item-card" onClick={() => navigate('/support')}>
                        <div className="settings-item-left">
                            <span className="settings-icon">❓</span>
                            <span className="settings-item-text">Help</span>
                        </div>
                        <span className="settings-arrow">›</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
