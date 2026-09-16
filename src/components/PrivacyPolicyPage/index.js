import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../SettingsPage/index.css';

const PrivacyPolicyPage = () => {
    const navigate = useNavigate();

    return (
        <div className="settings-page-wrapper">
            <div className="settings-header">
                <span className="settings-back-arrow" onClick={() => navigate(-1)}>‹</span>
                <h1 className="settings-title">Privacy Policy</h1>
            </div>

            <div className="settings-container-card text-content-card">
                <h2 className="text-content-title">Privacy Policy</h2>

                {/* Introduction */}
                <h3 className="text-content-subtitle">Your Privacy Matters</h3>
                <p className="text-content-paragraph">
                    Welcome to Clap Kartel. Your privacy is important to us.
                    This Privacy Policy explains how we collect, use, disclose
                    and safeguard your information when you use our mobile application ("App") and associated services.
                </p>
                <p className="text-content-paragraph">
                    By downloading or using the App, you agree to the terms of this Privacy Policy.
                </p>

                {/* 01. Information We Collect */}
                <h3 className="text-content-subtitle">01. Information We Collect</h3>
                <p className="text-content-paragraph">
                    We may collect and process the following types of data:
                </p>

                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>Personal Information</h4>
                <ul className="text-content-list">
                    <li>Name, mobile number and email address.</li>
                    <li>Profile details such as profession, experience and location.</li>
                    <li>Social media links.</li>
                    <li>Photos, videos and audio files uploaded to your profile.</li>
                </ul>

                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>Usage Data</h4>
                <ul className="text-content-list">
                    <li>Device type, operating system and unique identifiers.</li>
                    <li>IP address and browsing behavior within the App.</li>
                    <li>Crash reports and performance analytics.</li>
                </ul>

                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>Location Information</h4>
                <p className="text-content-paragraph">
                    With your consent, we may collect approximate or precise location information to improve profile accuracy and provide filtered searches.
                </p>

                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>Files and Media</h4>
                <p className="text-content-paragraph">
                    You may upload images, videos, audio files and PDF documents to showcase your work. These files remain under your control and may be modified or deleted subject to applicable platform policies.
                </p>

                {/* 02. How We Use Your Information */}
                <h3 className="text-content-subtitle">02. How We Use Your Information</h3>
                <ul className="text-content-list">
                    <li>Create and manage your user profile.</li>
                    <li>Facilitate networking and collaboration among users.</li>
                    <li>Display and filter listings based on your preferences.</li>
                    <li>Send important application updates and promotional messages, with available opt-out options.</li>
                    <li>Improve user experience through analytics and user feedback.</li>
                </ul>

                {/* 03. Sharing & Disclosure */}
                <h3 className="text-content-subtitle">03. Sharing & Disclosure</h3>
                <p className="text-content-paragraph">
                    We do not sell your personal information. However, we may share information in the following circumstances:
                </p>
                <ul className="text-content-list">
                    <li>With other users according to your profile visibility settings.</li>
                    <li>With trusted service providers for hosting, analytics and communication.</li>
                    <li>To comply with legal obligations or protect our legal rights.</li>
                </ul>

                {/* 04. Data Security */}
                <h3 className="text-content-subtitle">04. Data Security</h3>
                <p className="text-content-paragraph">
                    We implement industry-standard security measures including encryption, secure servers and restricted access to protect your information.
                </p>
                <p className="text-content-paragraph">
                    However, no method of internet transmission or electronic storage is completely secure. Therefore, we cannot guarantee absolute security of your information.
                </p>

                {/* 05. Your Rights */}
                <h3 className="text-content-subtitle">05. Your Rights</h3>
                <p className="text-content-paragraph">
                    Depending on applicable laws, you may have the right to:
                </p>
                <ul className="text-content-list">
                    <li>Access and update your personal information.</li>
                    <li>Delete your profile or request removal of your data.</li>
                    <li>Withdraw consent for specific features such as location sharing.</li>
                </ul>
                <p className="text-content-paragraph">
                    To exercise these rights, please contact us using the contact information provided below.
                </p>

                {/* 06. Third-Party Services */}
                <h3 className="text-content-subtitle">06. Third-Party Services</h3>
                <p className="text-content-paragraph">
                    The App may include links to third-party websites or services. We are not responsible for the privacy practices of these platforms.
                </p>
                <p className="text-content-paragraph">
                    Users are encouraged to review the privacy policies of third-party services separately before providing them with personal information.
                </p>

                {/* 07. Children's Privacy */}
                <h3 className="text-content-subtitle">07. Children's Privacy</h3>
                <p className="text-content-paragraph">
                    Our App is not intended for children under the age of 13. We do not knowingly collect personal information from children.
                </p>
                <p className="text-content-paragraph">
                    If you believe that a child has provided personal information through the App, please contact us so that appropriate action can be taken.
                </p>

                {/* 08. Policy Updates */}
                <h3 className="text-content-subtitle">08. Policy Updates</h3>
                <p className="text-content-paragraph">
                    We may update this Privacy Policy from time to time. Any changes will be reflected by the "Last Updated" date and may also be communicated within the App.
                </p>

                {/* Contact Us */}
                <h3 className="text-content-subtitle">Contact Us</h3>
                <p className="text-content-paragraph">
                    For questions or concerns regarding this Privacy Policy, please contact us:
                </p>
                <p className="text-content-paragraph">
                    <strong>Email:</strong> support@gullycinema.com<br />
                    <strong>Registered Office:</strong> [Insert registered office address]
                </p>

                {/* Last Updated */}
                <p className="text-content-paragraph" style={{ fontStyle: 'italic', marginTop: '16px', color: '#666' }}>
                    Last Updated: August 2026
                </p>

                {/* Footer */}
                <div className="settings-version-footer" style={{ marginTop: '36px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <p style={{ fontWeight: '700', color: '#111', marginBottom: '4px' }}>CLAP KARTEL PRIVATE LIMITED</p>
                    <p>© 2026 Clap Kartel. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
