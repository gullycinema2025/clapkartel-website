import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdPhone } from 'react-icons/md';
import '../SettingsPage/index.css';

const SupportPage = () => {
    const navigate = useNavigate();

    const handleEmailClick = () => {
        window.location.href = 'mailto:gullycinema@gmail.com';
    };

    const handlePhoneClick = () => {
        window.location.href = 'tel:9000022211';
    };

    return (
        <div className="settings-page-wrapper">
            <div className="settings-header">
                <span className="settings-back-arrow" onClick={() => navigate(-1)}>‹</span>
                <h1 className="settings-title">Support</h1>
            </div>

            <div className="settings-container-card">
                <h2 className="text-content-title">Contact Support</h2>
                <div style={{ height: '20px' }}></div>

                {/* Email Card */}
                <div className="settings-item-card support-contact-card" onClick={handleEmailClick} style={{ cursor: 'pointer' }}>
                    <div className="settings-item-left">
                        <span className="settings-icon">
                            <MdEmail size={24} style={{ color: '#B68515' }} />
                        </span>
                        <div className="support-info-text">
                            <span className="support-title">Email</span>
                            <span className="support-value" style={{ color: '#0066cc', textDecoration: 'underline' }}>gullycinema@gmail.com</span>
                        </div>
                    </div>
                </div>

                <div style={{ height: '10px' }}></div>

                {/* Phone Card */}
                <div className="settings-item-card support-contact-card" onClick={handlePhoneClick} style={{ cursor: 'pointer' }}>
                    <div className="settings-item-left">
                        <span className="settings-icon">
                            <MdPhone size={24} style={{ color: '#4CAF50' }} />
                        </span>
                        <div className="support-info-text">
                            <span className="support-title">Phone Number</span>
                            <span className="support-value" style={{ color: '#0066cc', textDecoration: 'underline' }}>9000022211</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
