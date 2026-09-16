import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../SettingsPage/index.css';

const TermsConditionPage = () => {
    const navigate = useNavigate();

    return (
        <div className="settings-page-wrapper">
            <div className="settings-header">
                <span className="settings-back-arrow" onClick={() => navigate(-1)}>‹</span>
                <h1 className="settings-title">Terms & Conditions</h1>
            </div>

            <div className="settings-container-card text-content-card">
                <h2 className="text-content-title">Terms & Conditions</h2>

                {/* Introduction */}
                <h3 className="text-content-subtitle">Our Commitment</h3>
                <p className="text-content-paragraph">
                    Clap Kartel is committed to providing a Safe, Professional, Respectful and Secure Platform for
                    Artists, Technicians, Creators, Recruiters, Collaborators and for all who are related to the
                    Film and Entertainment Industry.
                </p>
                <p className="text-content-paragraph">
                    By accessing or using the platform, users agree to follow all platform guidelines, policies and
                    applicable laws.
                </p>

                {/* 01. User Responsibilities */}
                <h3 className="text-content-subtitle">01. User Responsibilities</h3>
                <ul className="text-content-list">
                    <li>Users must provide accurate, genuine and updated information.</li>
                    <li>All communication and interactions on the platform must remain professional and respectful.</li>
                    <li>Users are responsible for maintaining the confidentiality and security of their account credentials.</li>
                    <li>Child artist accounts must operate under valid parent or guardian consent and supervision.</li>
                </ul>

                {/* 02. Strictly Prohibited Activities */}
                <h3 className="text-content-subtitle">02. Strictly Prohibited Activities</h3>
                <ul className="text-content-list">
                    <li>Fake profiles, impersonation, scams, fraudulent activities or misleading information.</li>
                    <li>Harassment, bullying, threats, discrimination, exploitation or abusive behavior.</li>
                    <li>Uploading obscene, offensive, illegal, inappropriate or copyrighted content without permission.</li>
                    <li>Spam, unauthorized promotions, repeated unwanted communication or misuse of platform features.</li>
                    <li>Sharing or requesting sensitive personal information unnecessarily.</li>
                </ul>

                {/* 03. Content & Intellectual Property */}
                <h3 className="text-content-subtitle">03. Content & Intellectual Property</h3>
                <ul className="text-content-list">
                    <li>Users retain ownership of their uploaded portfolios, scripts, images, videos and creative works.</li>
                    <li>By uploading content, users confirm they own the rights or have proper authorization to use it.</li>
                    <li>Content may not be copied, reused, distributed or published without permission.</li>
                    <li>Clap Kartel reserves the right to remove content that violates platform policies or legal requirements.</li>
                </ul>

                {/* 04. Payments & Platform Disclaimer */}
                <h3 className="text-content-subtitle">04. Payments & Platform Disclaimer</h3>
                <ul className="text-content-list">
                    <li>Paid memberships, subscriptions or services are non-refundable unless mentioned in the refund policy.</li>
                    <li>Clap Kartel acts only as a connecting and information provider platform and does not guarantee auditions, projects, hiring or job placements.</li>
                    <li>The platform is not responsible for disputes, agreements, losses or damages between users and third parties.</li>
                </ul>

                {/* 05. Compliance & Enforcement */}
                <h3 className="text-content-subtitle">05. Compliance & Enforcement</h3>
                <ul className="text-content-list">
                    <li>Users may report misconduct, fake profiles, harassment or policy violations to Clap Kartel.</li>
                    <li>Accounts violating platform policies or applicable laws may be suspended, restricted or permanently terminated without prior notice.</li>
                    <li>Serious violations may be reported to legal authorities where necessary.</li>
                </ul>

                {/* 06. Legal Clauses */}
                <h3 className="text-content-subtitle">06. Legal Clauses</h3>
                <ul className="text-content-list">
                    <li>Clap Kartel reserves the right to verify user identity, company details or uploaded information and may request supporting documents whenever necessary.</li>
                    <li>Clap Kartel shall not be liable for any direct, indirect, incidental, financial, legal or consequential damages arising from the use of the platform, user interactions, auditions, hiring decisions or third-party activities.</li>
                    <li>Clap Kartel shall not be held responsible for delays, interruptions, data loss or service failures caused by events beyond reasonable control, including technical failures, cyber-attacks, natural disasters, government actions or internet disruptions.</li>
                    <li>All disputes shall be governed by and interpreted in accordance with the laws of India. Any disputes arising from the use of the platform shall be subject to the exclusive jurisdiction of the courts located in Hyderabad, Telangana.</li>
                </ul>

                {/* 07. Users Agree to Comply With */}
                <h3 className="text-content-subtitle">07. Users Agree to Comply With</h3>
                <ul className="text-content-list">
                    <li>Information Technology Act, 2000 and amendments thereto.</li>
                    <li>Information Technology Rules applicable in India.</li>
                    <li>Digital Personal Data Protection Act, 2023.</li>
                    <li>Intellectual Property Laws.</li>
                    <li>Any other applicable laws and regulations.</li>
                </ul>

                {/* 08. Copyright Notice */}
                <h3 className="text-content-subtitle">08. Copyright Notice</h3>
                <ul className="text-content-list">
                    <li>© 2026 Clap Kartel. All Rights Reserved.</li>
                    <li>Unauthorized reproduction, distribution, modification or use of any content, trademarks, logos, software, text, images, audio or videos available on the platform is strictly prohibited without prior written permission.</li>
                </ul>

                {/* Disclaimer */}
                <h3 className="text-content-subtitle">Disclaimer</h3>
                <p className="text-content-paragraph">
                    The Platform acts only as an information-sharing and networking medium and shall not be held
                    responsible or liable for any loss, damage, dispute, fraud, misunderstanding, financial loss, legal
                    issue or any direct or indirect consequences arising from the use of the platform or reliance on the
                    information provided.
                </p>

                {/* 09. Privacy Policy */}
                <h3 className="text-content-subtitle">09. Privacy Policy</h3>
                <ul className="text-content-list">
                    <li>User information such as profile details, portfolios, communication data and usage information may be collected to improve platform services and connect opportunities.</li>
                    <li>Personal information will not be sold or misused and may only be shared with recruiters, partners or authorities when required for platform operations, safety or legal compliance.</li>
                    <li>Users may update, edit, deactivate or request removal of their account information subject to applicable policies.</li>
                    <li>While industry-standard security measures are used, users are advised not to share confidential information publicly.</li>
                </ul>

                {/* 10. Policy Updates */}
                <h3 className="text-content-subtitle">10. Policy Updates</h3>
                <ul className="text-content-list">
                    <li>Clap Kartel reserves the right to update or modify platform policies, terms or privacy guidelines at any time. Continued use of the platform indicates acceptance of the updated policies and terms.</li>
                </ul>

                {/* 11. Terms of Use */}
                <h3 className="text-content-subtitle">11. Terms of Use</h3>
                
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>User Account and Access</h4>
                <ul className="text-content-list">
                    <li>To access certain features of Clap Kartel, users may be required to register and log in using their Mobile Number, Email Address, Username or any other authentication method provided by the platform.</li>
                    <li>Users are responsible for maintaining the confidentiality of their login credentials and for all activities that occur under their account. Clap Kartel shall not be liable for any loss or damage arising from unauthorized use of a user's account.</li>
                </ul>

                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>Content Submission and Ownership</h4>
                <ul className="text-content-list">
                    <li>Users may upload, post, share, submit or publish content on the platform including profiles, portfolios, photographs, videos, audio files, scripts, resumes, project details, reviews, comments, ratings, reactions, messages and other materials.</li>
                    <li>You are the rightful owner of the Content or possess all necessary rights, permissions, licenses and authorizations.</li>
                    <li>The Content does not violate the rights of any third party.</li>
                    <li>You are solely responsible for the Content submitted by you.</li>
                </ul>

                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>License Granted to Clap Kartel</h4>
                <ul className="text-content-list">
                    <li>By uploading content, you grant Clap Kartel a non-exclusive, worldwide, royalty-free, transferable, sublicensable, perpetual and irrevocable license to store, host, reproduce, display, publish, distribute, promote and use the Content.</li>
                    <li>The Content may be made available to other users and may be used to create derivative works and promotional materials.</li>
                    <li>Users retain ownership of their original content.</li>
                </ul>

                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>Prohibited Content</h4>
                <ul className="text-content-list">
                    <li>False, misleading or fraudulent content.</li>
                    <li>Defamatory, abusive, threatening, hateful or offensive content.</li>
                    <li>Pornographic, obscene or sexually explicit material.</li>
                    <li>Content harming minors.</li>
                    <li>Copyright infringement.</li>
                    <li>Malware, spyware or harmful code.</li>
                    <li>Content violating applicable laws.</li>
                </ul>

                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>Content Moderation and Removal</h4>
                <ul className="text-content-list">
                    <li>Clap Kartel may review, restrict, suspend, remove or disable access to content that violates platform policies or legal requirements without prior notice.</li>
                </ul>

                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>Role of Clap Kartel</h4>
                <ul className="text-content-list">
                    <li>Clap Kartel operates as a technology platform facilitating interaction and networking within the Film and Entertainment Industry.</li>
                    <li>Clap Kartel does not guarantee job postings, casting calls, project opportunities or user-generated content.</li>
                </ul>

                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>Authority to Use Services</h4>
                <ul className="text-content-list">
                    <li>You are legally authorized to enter into this agreement.</li>
                    <li>Your use complies with all applicable laws.</li>
                    <li>You possess authority when acting on behalf of another entity.</li>
                </ul>

                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>Age Requirement</h4>
                <ul className="text-content-list">
                    <li>Users must be at least 18 years old or have reached the age of majority under applicable laws.</li>
                    <li>Parents or legal guardians are responsible for supervising minors.</li>
                </ul>

                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>Acceptable User Conduct</h4>
                <ul className="text-content-list">
                    <li>Users agree not to obtain unauthorized access to systems.</li>
                    <li>Users must not use the platform for unlawful purposes.</li>
                    <li>Users must not interfere with platform operations.</li>
                    <li>Users must not upload spam or unauthorized advertisements.</li>
                    <li>Users must not misuse personal information of other users.</li>
                    <li>Users must not use bots, crawlers or automated tools.</li>
                    <li>Users must not misrepresent identity or qualifications.</li>
                </ul>

                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginTop: '16px', marginBottom: '8px' }}>Use of Platform Services</h4>
                <ul className="text-content-list">
                    <li>Users shall use the platform only for lawful purposes.</li>
                    <li>Users shall not reproduce, duplicate, copy, sell or commercially exploit any portion of the platform.</li>
                    <li>Users shall not frame or mirror any part of the platform.</li>
                    <li>Users shall not use automated methods to access platform data.</li>
                    <li>Users shall not circumvent security measures.</li>
                    <li>Clap Kartel reserves the right to modify, suspend or discontinue any feature or service without prior notice.</li>
                </ul>

                {/* User Agreement */}
                <h3 className="text-content-subtitle">User Agreement</h3>
                <p className="text-content-paragraph">
                    By accessing or using Clap Kartel, you acknowledge that you have read, understood and agreed to
                    comply with these Terms and Conditions.
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

export default TermsConditionPage;
