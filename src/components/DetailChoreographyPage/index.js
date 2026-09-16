import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import './index.css';
import youtubeIcon from '../../assets/youtube.svg';
import facebookIcon from '../../assets/facebook.svg';
import instagramIcon from '../../assets/instagram.svg';
import shareIcon from '../../assets/share.svg';
import detailMainImage from '../../assets/detailMainImage.png';
import detailVideoImage1 from '../../assets/detailVideoImage1.png';
import detailVideoImage2 from '../../assets/detailVideoImage2.png';

const DetailChoreographyPage = () => {
  const [openQuestion, setOpenQuestion] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  const questions = [
    {
      id: 0,
      question: 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit',
      answer: 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    {
      id: 1,
      question: 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit',
      answer: 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    {
      id: 2,
      question: 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit',
      answer: 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    {
      id: 3,
      question: 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit',
      answer: 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }
  ];

  const videos = [
    detailVideoImage1,
    detailVideoImage2,
    detailVideoImage2,
  ];

  const toggleQuestion = (id) => {
    setOpenQuestion(openQuestion === id ? null : id);
  };

  // Custom SVG Icons
  const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M14.4223 11.445L12.5173 11.2275C12.2933 11.2012 12.0662 11.226 11.8532 11.3C11.6402 11.3741 11.4467 11.4954 11.2873 11.655L9.90729 13.035C7.77833 11.952 6.04783 10.2215 4.96479 8.0925L6.35229 6.705C6.67479 6.3825 6.83229 5.9325 6.77979 5.475L6.56229 3.585C6.51992 3.21907 6.34439 2.88152 6.06913 2.6367C5.79388 2.39187 5.43816 2.2569 5.06979 2.2575H3.77229C2.92479 2.2575 2.21979 2.9625 2.27229 3.81C2.66979 10.215 7.79229 15.33 14.1898 15.7275C15.0373 15.78 15.7423 15.075 15.7423 14.2275V12.93C15.7498 12.1725 15.1798 11.535 14.4223 11.445Z" fill="#B6810D"/>
    </svg>
  );

  const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M1.42408 4.86873C1.46884 4.31429 1.72071 3.79703 2.12957 3.41987C2.53842 3.04271 3.07429 2.83331 3.63053 2.83334H13.3701C13.9313 2.83331 14.4716 3.04646 14.8816 3.42966C15.2916 3.81285 15.5408 4.33749 15.5787 4.89742L8.50103 8.62396L1.42408 4.86873ZM1.41699 5.86748V11.9531C1.41699 12.5402 1.6502 13.1032 2.06532 13.5183C2.48044 13.9335 3.04347 14.1667 3.63053 14.1667H13.3701C13.9572 14.1667 14.5202 13.9335 14.9353 13.5183C15.3504 13.1032 15.5837 12.5402 15.5837 11.9531V5.89546L8.70645 9.51646C8.64265 9.55003 8.57162 9.56752 8.49953 9.56739C8.42744 9.56727 8.35647 9.54954 8.29278 9.51575L1.41699 5.86748Z" fill="#B6810D"/>
    </svg>
  );

  const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1C6.54184 1.00172 5.14389 1.58174 4.11282 2.61281C3.08174 3.64389 2.50172 5.04184 2.5 6.5C2.49866 7.69155 2.88786 8.8507 3.608 9.8C3.608 9.8 3.758 9.9975 3.7825 10.026L8 15L12.2195 10.0235C12.2415 9.997 12.392 9.8 12.392 9.8L12.3925 9.7985C13.1122 8.84954 13.5012 7.69098 13.5 6.5C13.4983 5.04184 12.9183 3.64389 11.8872 2.61281C10.8561 1.58174 9.45817 1.00172 8 1ZM8 8.5C7.60444 8.5 7.21776 8.3827 6.88886 8.16294C6.55996 7.94318 6.30362 7.63082 6.15224 7.26537C6.00087 6.89991 5.96126 6.49778 6.03843 6.10982C6.1156 5.72186 6.30608 5.36549 6.58579 5.08579C6.86549 4.80608 7.22186 4.6156 7.60982 4.53843C7.99778 4.46126 8.39992 4.50087 8.76537 4.65224C9.13082 4.80362 9.44318 5.05996 9.66294 5.38886C9.88271 5.71776 10 6.10444 10 6.5C9.99934 7.03023 9.78842 7.53855 9.41349 7.91348C9.03856 8.28841 8.53023 8.49934 8 8.5Z" fill="#B6810D"/>
    </svg>
  );

  const UpArrow = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="11" viewBox="0 0 18 11" fill="none">
      <path d="M2 8.94556L8.94556 2L15.8911 8.94556" stroke="#0F0F0F" strokeWidth="3.61791" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const DownArrow = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="11" viewBox="0 0 19 11" fill="none">
      <path d="M16.3633 2.2522L9.41772 9.19775L2.47216 2.2522" stroke="#0F0F0F" strokeWidth="3.61791" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="profile-detail-page">
      <div className="profile-container">
        {/* Left Side - Image */}
        <div className="profile-left">
          <div className="profile-main-image">
            <img 
              src={detailMainImage}
              alt="ABC Choreo" 
            />
          </div>
        </div>

        {/* Right Side - Details */}
        <div className="profile-right">
          {/* Header */}
          <div className="profile-header">
            <div className="profile-header-left">
              <h1 className="profile-name">ABC Choreo</h1>
              <p className="profile-budget">Budget : ₹50,000</p>
            </div>
            <button 
              className={`like-button ${isLiked ? 'liked' : ''}`}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart size={24} fill={isLiked ? '#BF8906' : 'none'} stroke={isLiked ? '#BF8906' : '#000'} />
            </button>
          </div>

          {/* Contact Info */}
          <div className="profile-contact">
            <div className="contact-item">
              <PhoneIcon />
              <span>DH</span>
            </div>
            <div className="contact-item">
              <EmailIcon />
              <span>abcchoreo@gmail.com</span>
            </div>
            <div className="contact-item">
              <LocationIcon />
              <span>Hyderabad</span>
            </div>
          </div>

          {/* Videos Section */}
          <div className="profile-videos">
            <h2 className="section-title">Videos</h2>
            <div className="videos-grid">
              {videos.map((video, index) => (
                <div key={index} className="video-thumbnail">
                  <img src={video} alt={`Video ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div className="profile-about">
            <h2 className="section-title">About</h2>
            <p className="about-text">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the... 
              <span className="read-more">more</span>
            </p>
          </div>

          {/* Social Links */}
          <div className="profile-social">
            <a href="#youtube" className="social-link">
              <img src={youtubeIcon} alt="YouTube" />
            </a>
            <a href="#facebook" className="social-link">
              <img src={facebookIcon} alt="Facebook" />
            </a>
            <a href="#instagram" className="social-link">
              <img src={instagramIcon} alt="Instagram" />
            </a>
            <a href="#share" className="social-link">
              <img src={shareIcon} alt="Share" />
            </a>
          </div>

          {/* Questions and Answer */}
          <div className="profile-qa">
            <h2 className="section-title">Questions and Answer</h2>
            <div className="qa-list">
              {questions.map((item) => (
                <div key={item.id} className="qa-item">
                  <div 
                    className="qa-question"
                    onClick={() => toggleQuestion(item.id)}
                  >
                    <span>{item.question}</span>
                    {openQuestion === item.id ? <UpArrow /> : <DownArrow />}
                  </div>
                  {openQuestion === item.id && (
                    <div className="qa-answer">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="profile-footer">
            <label className="not-answerable">
              <input type="checkbox" />
              <span>We are not answerable to</span>
            </label>
            <button className="contact-button">Contact</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailChoreographyPage;