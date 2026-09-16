import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

const AboutAppPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('about'); // 'about' or 'advisory'

    // Advisory Members Data (Photo | Full Name | About the Member)
    const advisoryMembers = [
        {
            id: 1,
            name: "Industry Steering Committee",
            role: "Senior Advisory Panel",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300",
            about: "Comprising veteran directors, producers, and technicians bringing decades of cinema leadership to guide Clap Kartel's ecosystem."
        },
        {
            id: 2,
            name: "Technical & Crafts Directorate",
            role: "24 Crafts Advisory",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
            about: "Overseeing standards, training frameworks, and verified skill criteria across all 24 film crafts and 200+ sub-sections."
        },
        {
            id: 3,
            name: "Global Outreach & Legal Affairs",
            role: "International & Legal Mentor",
            image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300",
            about: "Fostering international distribution channels, IP protection, and cross-border collaborations between Indian and global film markets."
        },
        {
            id: 4,
            name: "Talent Development & Placements",
            role: "Academic & Youth Advisory",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
            about: "Dedicated to mentoring emerging artists, structured placements, and connecting fresh talent with industry opportunities."
        }
    ];

    // Mobile App Features List
    const appFeatures = [
        { id: 1, name: "Industry Directory", icon: "👥" },
        { id: 2, name: "Jobs & Opportunities", icon: "💼" },
        { id: 3, name: "Videos & Reels", icon: "🎬" },
        { id: 4, name: "Learning Resources", icon: "📖" },
        { id: 5, name: "Podcasts", icon: "🎙️" },
        { id: 6, name: "Networking & Messaging", icon: "💬" }
    ];

    return (
        <div className="about-app-page-wrapper">
            {/* Header Area */}
            <div className="about-app-header">
                <span className="about-app-back-arrow" onClick={() => navigate(-1)}>‹</span>
                <h1 className="about-app-title">About Clap Kartel</h1>
            </div>

            <div className="about-app-container-card">
                {/* Navigation Tabs */}
                <div className="about-app-tabs">
                    <button
                        className={`about-app-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveTab('about')}
                    >
                        📖 About Us &amp; Features
                    </button>
                    <button
                        className={`about-app-tab-btn ${activeTab === 'advisory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('advisory')}
                    >
                        👥 Advisory Members
                    </button>
                </div>

                {/* TAB 1: ABOUT US & FEATURES */}
                {activeTab === 'about' && (
                    <div className="about-us-content fade-in">
                        {/* Mission Section */}
                        <div className="mission-card">
                            <p className="mission-text">
                                Our mission is to bridge the gap between talented individuals and the entertainment industry by providing a trusted platform where creativity meets opportunity.
                            </p>
                        </div>

                        {/* Detailed Description */}
                        <div className="about-text-card">
                            <p>
                                <strong>CLAP KARTEL</strong> is the world’s first dedicated digital platform targeted as the <strong>Global Verified Directory of the Film and Entertainment Industry</strong>, acting as a one-stop solution for discovering Talent, Services and Learning Opportunities within India, Bollywood, Tollywood, Kollywood, etc., and exploring other International Markets of the USA, UK among others.
                            </p>
                            <p>
                                Today’s world is driven by <strong>Visual and Video content</strong>. From Traditional Theatre and Skits to Movies, Television, YouTube, Social media and Corporate branding, every sector now depends on Skilled professionals to get creative Content.
                            </p>
                            <p>
                                <strong>CLAP KARTEL</strong> bridges the gap between the Industry and Technicians by bringing together all <strong>24 Crafts</strong>, along with <strong>200+ Sub-sections</strong> under one platform.
                            </p>
                        </div>

                        {/* Vision Section */}
                        <div className="vision-card">
                            <div className="vision-header">
                                <span className="vision-icon">👁️</span>
                                <h3>OUR VISION</h3>
                            </div>
                            <p className="vision-quote">
                                “To create the most complete and trusted ecosystem for the Global Film and Entertainment Industry where people can <span>Learn</span>, <span>Connect</span>, <span>Hire</span>, <span>Grow</span> and <span>Succeed</span>.”
                            </p>
                        </div>

                        {/* Mobile Features List */}
                        <div className="features-section">
                            <h3 className="features-title">Features</h3>
                            <div className="mobile-features-list">
                                {appFeatures.map((item) => (
                                    <div key={item.id} className="mobile-feature-item">
                                        <div className="mobile-feature-icon-box">
                                            {item.icon}
                                        </div>
                                        <span className="mobile-feature-name">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Copyright Footer */}
                        <div className="app-copyright-footer">
                            <p>© 2026 Clap Kartel Pvt. Ltd.</p>
                            <p>All Rights Reserved.</p>
                        </div>
                    </div>
                )}

                {/* TAB 2: ADVISORY MEMBERS CONTENT */}
                {activeTab === 'advisory' && (
                    <div className="advisory-members-content fade-in">
                        <div className="advisory-header-info">
                            <h2>Advisory Board Members</h2>
                            <p>Distinguished leaders and mentors driving direction and excellence at Clap Kartel.</p>
                        </div>

                        <div className="advisory-grid">
                            {advisoryMembers.map((member) => (
                                <div key={member.id} className="advisory-card">
                                    <div className="advisory-image-container">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="advisory-photo"
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/300x300/BF8906/ffffff?text=Advisory+Member';
                                            }}
                                        />
                                    </div>
                                    <div className="advisory-details">
                                        <h3 className="advisory-name">{member.name}</h3>
                                        <span className="advisory-role">{member.role}</span>
                                        <p className="advisory-about">{member.about}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="app-copyright-footer">
                            <p>© 2026 Clap Kartel Pvt. Ltd.</p>
                            <p>All Rights Reserved.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AboutAppPage;
