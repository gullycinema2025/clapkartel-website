import React from "react";
import { useNavigate } from "react-router-dom";
import { FaInstagram, FaYoutube, FaPinterestP } from "react-icons/fa";
import { FaThreads, FaXTwitter } from "react-icons/fa6";
import "./index.css";

// ─── ASSET IMPORTS ───────────────────────────────────────────────────────────
import logoUrl from "../../assets/New/footer-new-logo.svg";
import footerLogoUrl from "../../assets/New/landing-white-footer.svg";
import heroSceneUrl from "../../assets/New/hero-scene.png";
import introBgUrl from "../../assets/New/intro-bg.png";
import appMockupsUrl from "../../assets/New/app-mockups.png";
import goldenReelUrl from "../../assets/New/golden-reel.png";

// ─── SVG ICONS ───────────────────────────────────────────────────────────────

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 19.4V14.15m16.5 0V7.5A2.25 2.25 0 0018 5.25H6A2.25 2.25 0 003.75 7.5v6.65m16.5 0H3.75M12 9.75v3.3m0 0l-1.65-1.65m1.65 1.65l1.65-1.65" />
  </svg>
);

const PaperPlaneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClapboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125V10.5h19.5v7.875c0 .621-.504 1.125-1.125 1.125m-17.25 0V9M3 10.5V6a1.5 1.5 0 011.5-1.5h15A1.5 1.5 0 0121 6v4.5M3.75 4.5L20.25 9m-16.5-4.5V9M12 9l-1.5-3.75m0 0l3-1.5" />
  </svg>
);

const GroupIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const NetworkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* 1. HEADER */}
      <header className="home-header">
        <div className="logo-container">
          <img src={logoUrl} alt="CK Logo" className="landing-header-logo" />
        </div>
        <div className="auth-buttons">
          <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-eyebrow">World's Largest</span>
          <h1 className="hero-title">
            <span className="desktop-nowrap">Film and Entertainment</span> <br />
            <span className="desktop-nowrap">Industry's Platform for</span> <br />
            <span className="gold-text">Talent, Networking & Opportunities</span>
          </h1>
          <p className="hero-description">
            Every Talent Deserves an Opportunity and Every Opportunity Begins with a right Connection can change your Cinema Journey.
          </p>
          <div className="hero-cta-buttons">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Join Free <span className="arrow">→</span>
            </button>
            <button className="btn-secondary" onClick={() => navigate('/login')}>
              Explore Opportunities <span className="arrow">→</span>
            </button>
          </div>
          <div className="app-badges" style={{ marginTop: '24px', marginBottom: '30px' }}>
            <a href="https://play.google.com/store/apps/details?id=com.clapkartal.clapkartal" target="_blank" rel="noreferrer">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="store-badge" />
            </a>
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="store-badge" />
          </div>
        </div>
        <div className="hero-media">
          <img src={heroSceneUrl} alt="Cinematic Studio Setup" className="hero-image" />
        </div>
      </section>

      {/* 3. DARK INTRO BANNER */}
      <section className="intro-banner">
        <div className="intro-banner-content">
          <h2 className="intro-main-title">
            CLAP KARTEL Connects the <span className="gold-text">Right People</span> to the <span className="gold-text">Right Opportunities.</span>
          </h2>
          <div className="intro-cards-container">
            {/* LEFT CARD - FOR TALENTS */}
            <div className="intro-card for-talents">
              <div className="card-header-block">
                <div className="card-icon-wrapper">
                  <PersonIcon />
                </div>
                <h3 className="card-header-title">For Talents</h3>
              </div>
              <p className="card-intro-desc">
                You have Talent. We have the Platform and connections to take you further.
              </p>
              <ul className="card-bullets-list">
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Create Profile</span>
                    <span className="bullet-desc-text">Build your professional profile in minutes</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Showcase Portfolio</span>
                    <span className="bullet-desc-text">Display your work and stand out</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Apply Instantly</span>
                    <span className="bullet-desc-text">Apply to opportunities with just one click</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Get Discovered</span>
                    <span className="bullet-desc-text">Get noticed by casting directors &amp; producers</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Build Connections</span>
                    <span className="bullet-desc-text">Connect with Industry Professionals across the Globe</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Learn &amp; Glow</span>
                    <span className="bullet-desc-text">Access Workshop, Master Classes, Podcast &amp; Industry insights</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Grow your Career</span>
                    <span className="bullet-desc-text">Discover Opportunities, gain experience and take your career to the Next Level</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Stay Protected</span>
                    <span className="bullet-desc-text">Secure &amp; Trusted platform with verified opportunities &amp; professionals</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* RIGHT CARD - FOR USERS */}
            <div className="intro-card for-users">
              <div className="card-header-block">
                <div className="card-icon-wrapper">
                  <GroupIcon />
                </div>
                <h3 className="card-header-title">For Users</h3>
              </div>
              <p className="card-intro-desc">
                Explore, connect and stay updated with the Film &amp; Entertainment Industry.
              </p>
              <ul className="card-bullets-list">
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">100% Verified Database</span>
                    <span className="bullet-desc-text">Access a trusted verified database across the worldwide Film and Entertainment Industry</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Explore the Industry</span>
                    <span className="bullet-desc-text">Discover the complete Film and Entertainment ecosystem in one place</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Learn &amp; Grow</span>
                    <span className="bullet-desc-text">Access Educational content, Podcasts &amp; Career Guidance from Industry experts</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Follow Projects</span>
                    <span className="bullet-desc-text">Stay connected with the upcoming films, creators &amp; production houses</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Connect with Professionals</span>
                    <span className="bullet-desc-text">Build meaningful connections with creators and industry experts</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Discover Talent</span>
                    <span className="bullet-desc-text">Explore emerging Artists, Technicians and Creative Professionals from across the industry</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Stay Updated</span>
                    <span className="bullet-desc-text">Receive updates on industry trends, opportunities and announcements</span>
                  </div>
                </li>
                <li>
                  <span className="bullet-icon-check">✓</span>
                  <div className="bullet-details">
                    <span className="bullet-title-text">Join the Community</span>
                    <span className="bullet-desc-text">Become part of World’s Largest Film and Entertainment Ecosystem</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROCESS CARDS (FOR ARTISTS...) */}
      <section className="process-section">
        <div className="section-header-decoration">
          <div className="deco-line" />
          <span className="deco-text">FOR ARTISTS, CREATORS &amp; STORYTELLERS</span>
          <div className="deco-line" />
        </div>

        <div className="process-grid">
          <div className="process-card">
            <div className="icon-gold"><PersonIcon /></div>
            <h3>Create Profile</h3>
            <p>Build your professional profile in minutes.</p>
          </div>
          <div className="process-card">
            <div className="icon-gold"><BriefcaseIcon /></div>
            <h3>Showcase Portfolio</h3>
            <p>Display your work and stand out.</p>
          </div>
          <div className="process-card">
            <div className="icon-gold"><PaperPlaneIcon /></div>
            <h3>Apply Instantly</h3>
            <p>Apply to opportunities with one click.</p>
          </div>
          <div className="process-card">
            <div className="icon-gold"><StarIcon /></div>
            <h3>Get Discovered</h3>
            <p>Get noticed by casting directors &amp; producers.</p>
          </div>
          <div className="process-card">
            <div className="icon-gold"><ShieldIcon /></div>
            <h3>Stay Protected</h3>
            <p>Secure &amp; safe platform for all professionals.</p>
          </div>
        </div>
      </section>

      {/* 5. APP SHOWCASE / MOCKUP SECTION */}
      <section className="showcase-section">
        <div className="showcase-content">
          <h2 className="showcase-title">
            <span className="desktop-nowrap">Designed for Everyone in the</span> <br />
            <span className="desktop-nowrap">Film and Entertainment Industry</span>
          </h2>
          <p className="showcase-subtitle">
            Connect, Collaborate, Learn, Hire and Grow on All in One Platform.
          </p>
          <ul className="showcase-list">
            <li><span className="check-icon">✓</span> One Platform for the Entire Entertainment Industry</li>
            <li><span className="check-icon">✓</span> Verified Industry Connections</li>
            <li><span className="check-icon">✓</span> Opportunities Across Multiple Languages &amp; Regions</li>
            <li><span className="check-icon">✓</span> Networking, Hiring &amp; Career Growth</li>
            <li><span className="check-icon">✓</span> Designed for Beginners and Professionals Alike</li>
            <li><span className="check-icon">✓</span> Accessible Anytime, Anywhere</li>
          </ul>
          <button className="btn-primary-glow" onClick={() => navigate('/login')}>
            Find Talent <span className="arrow">→</span>
          </button>
        </div>
        <div className="showcase-media">
          <img src={appMockupsUrl} alt="App Mockups" className="mockup-image" />
        </div>
      </section>

      {/* 6. WHY CHOOSE CLAP KARTEL */}
      <section className="why-section">
        <div className="section-header-decoration">
          <div className="deco-line" />
          <span className="deco-text">WHY CHOOSE CLAP KARTEL?</span>
          <div className="deco-line" />
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="icon-gold"><ClapboardIcon /></div>
            <h3>All-in-One Platform</h3>
            <p>Everything for the Film Industry in one place.</p>
          </div>
          <div className="why-card">
            <div className="icon-gold"><NetworkIcon /></div>
            <h3>Industry Networking</h3>
            <p>Connect with professionals across the industry.</p>
          </div>
          <div className="why-card">
            <div className="icon-gold"><BriefcaseIcon /></div>
            <h3>100% Verified Career Opportunities</h3>
            <p>Discover Jobs, Auditions and Projects in one place.</p>
          </div>
          <div className="why-card">
            <div className="icon-gold"><ChartIcon /></div>
            <h3>Learn &amp; Grow</h3>
            <p>Upgrade your skills through Courses and Industry guidance.</p>
          </div>
          <div className="why-card">
            <div className="icon-gold"><ShieldIcon /></div>
            <h3>Verified Database</h3>
            <p>Access reliable and authentic industry information.</p>
          </div>
          <div className="why-card">
            <div className="icon-gold"><PersonIcon /></div>
            <h3>Personal Branding &amp; Promotion</h3>
            <p>Showcase your Talent and Increase your visibility.</p>
          </div>
          <div className="why-card">
            <div className="icon-gold"><StarIcon /></div>
            <h3>One-Stop Solution</h3>
            <p>Save time with everything under one platform.</p>
          </div>
          <div className="why-card">
            <div className="icon-gold"><PaperPlaneIcon /></div>
            <h3>Easy to Use Platform</h3>
            <p>User-friendly and simple to navigate.</p>
          </div>
          <div className="why-card">
            <div className="icon-gold"><GroupIcon /></div>
            <h3>Latest Industry Updates</h3>
            <p>Stay updated with industry News and Trends.</p>
          </div>
          <div className="why-card">
            <div className="icon-gold"><NetworkIcon /></div>
            <h3>Endless Possibilities</h3>
            <p>Unlock new Connections and Opportunities.</p>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA BANNER */}
      <section className="bottom-cta-section">
        <div className="cta-banner-wrapper">
          <div className="cta-left">
            <img src={goldenReelUrl} alt="Golden Film Reel" className="reel-image" />
          </div>
          <div className="cta-right">
            <h2>
              Start Your Journey<br />
              <span className="gold-text">With Clap Kartel</span>
            </h2>
            <p>
              Find the right opportunities.<br />
              Build your career. Shine in cinema.
            </p>
          </div>
          <div className="cta-actions">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Join as Talent <span className="arrow">→</span>
            </button>
            <button className="btn-secondary-dark" onClick={() => navigate('/login')}>
              Find Talent <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="home-footer">
        <div className="footer-top">
          <h3>Download Clap Kartel App</h3>
          <div className="app-badges">
            <a href="https://play.google.com/store/apps/details?id=com.clapkartal.clapkartal" target="_blank">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="store-badge" />
            </a>
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="store-badge" />
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <div className="logo-container">
            <img src={footerLogoUrl} alt="CK Logo" className="footer-logo" />
          </div>

          <div className="footer-links-container">
            <div className="footer-links">
              <a href="/terms-conditions" onClick={(e) => { e.preventDefault(); navigate('/terms-conditions'); }}>Terms &amp; Conditions</a>
              <span className="sep">|</span>
              <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); navigate('/privacy-policy'); }}>Privacy Policy</a>
            </div>

            <div className="footer-socials">
              <a href="https://www.instagram.com/clapkartelcinema/" target="_blank" rel="noopener noreferrer" className="icon-link">
                <div className="icon-wrapper instagram">
                  <FaInstagram />
                </div>
              </a>
              <a href="https://www.threads.net/@clapkartelcinema" target="_blank" rel="noopener noreferrer" className="icon-link">
                <div className="icon-wrapper threads">
                  <FaThreads />
                </div>
              </a>
              <a href="https://www.youtube.com/@ClapKartelCinema" target="_blank" rel="noopener noreferrer" className="icon-link">
                <div className="icon-wrapper youtube">
                  <FaYoutube />
                </div>
              </a>
              <a href="https://x.com/ClapKartelCine" target="_blank" rel="noopener noreferrer" className="icon-link">
                <div className="icon-wrapper x-twitter">
                  <FaXTwitter />
                </div>
              </a>
              <a href="https://www.pinterest.com/clapkartelcinema/" target="_blank" rel="noopener noreferrer" className="icon-link">
                <div className="icon-wrapper pinterest">
                  <FaPinterestP />
                </div>
              </a>
            </div>
          </div>

          <div className="footer-copyright">
            © {new Date().getFullYear()} Clap Kartel. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
