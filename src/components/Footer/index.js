import React, { useEffect, useState } from "react";
import footerLogo from "../../assets/New/footer-new-logo.svg";
import { Link } from "react-router-dom";
import { FaInstagram, FaYoutube, FaPinterestP } from "react-icons/fa";
import { FaThreads, FaXTwitter } from "react-icons/fa6";
import "./index.css";

const Footer = () => {
  const [addonsData, setAddonsData] = useState(null);

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const response = await fetch('https://www.whysocial.in/clap-kartel/public/api/addons', {
          method: 'GET',
          headers
        });

        const data = await response.json();
        /* console.log('=== [Footer API] ADDONS DATA ===', data); */
        setAddonsData(data);
      } catch (error) {
        /* console.error('=== [Footer API] Error fetching addons ===', error); */
      }
    };

    fetchAddons();
  }, []);
  // Extract addon object whether it comes as object, array, or wrapped in data/result
  const addon = Array.isArray(addonsData)
    ? addonsData[0]
    : addonsData?.data
      ? (Array.isArray(addonsData.data) ? addonsData.data[0] : addonsData.data)
      : addonsData?.result
        ? (Array.isArray(addonsData.result) ? addonsData.result[0] : addonsData.result)
        : addonsData;

  const instagramLink = addon?.instagram_link || "https://www.instagram.com/clapkartelcinema/";
  // facebook_link in API represents Threads
  const threadsLink = addon?.facebook_link || addon?.threads_link || "https://www.threads.net/@clapkartelcinema";
  const youtubeLink = addon?.youtube_link || "https://www.youtube.com/@ClapKartelCinema";
  const twitterLink = addon?.twitter_link || "https://x.com/ClapKartelCine";
  // map_textarea in API represents Pinterest link
  const pinterestLink = addon?.map_textarea || addon?.pinterest_link || "https://www.pinterest.com/clapkartelcinema/";
  const footerText = addon?.footer_text || "Copy Right © Clap Kartel. All Rights Reserved | Concept & Designed by eParivartan";

  return (
    <div className="footer-container">
      <div className="footer-logo-section">
        <div className="footer-divider-line"></div>
        <img src={footerLogo} alt="Icon" className="footer-logo" />
        <div className="footer-divider-line"></div>
      </div>
      <div className="footer-app-badges-section">
        <h3 className="footer-app-title">Download Clap Kartel App</h3>
        <div className="footer-app-badges">
          <a href="https://play.google.com/store/apps/details?id=com.clapkartal.clapkartal" target="_blank" rel="noopener noreferrer">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="footer-store-badge" />
          </a>
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="footer-store-badge" />
        </div>
      </div>
      <div className="footer-social-wrapper">
        <div className="footer-social-icons">
          {instagramLink && (
            <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="icon-link" aria-label="Visit Clap Kartel on Instagram">
              <div className="icon-wrapper instagram">
                <FaInstagram />
              </div>
            </a>
          )}
          {threadsLink && (
            <a href={threadsLink} target="_blank" rel="noopener noreferrer" className="icon-link" aria-label="Visit Clap Kartel on Threads">
              <div className="icon-wrapper threads">
                <FaThreads />
              </div>
            </a>
          )}
          {youtubeLink && (
            <a href={youtubeLink} target="_blank" rel="noopener noreferrer" className="icon-link" aria-label="Subscribe to Clap Kartel on YouTube">
              <div className="icon-wrapper youtube">
                <FaYoutube />
              </div>
            </a>
          )}
          {twitterLink && (
            <a href={twitterLink} target="_blank" rel="noopener noreferrer" className="icon-link" aria-label="Follow Clap Kartel on X (Twitter)">
              <div className="icon-wrapper x-twitter">
                <FaXTwitter />
              </div>
            </a>
          )}
          {pinterestLink && (
            <a href={pinterestLink} target="_blank" rel="noopener noreferrer" className="icon-link" aria-label="Follow Clap Kartel on Pinterest">
              <div className="icon-wrapper pinterest">
                <FaPinterestP />
              </div>
            </a>
          )}
        </div>
      </div>
      <div className="footer-text-section">
        <p className="footer-terms-text">
          <Link to="/terms-conditions" className="footer-link" style={{ marginRight: "10px" }}>Terms & Conditions</Link> 
          <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
        </p>
        <p className="footer-copyright-text">
          {footerText}
        </p>
      </div>
    </div>
  );
};

export default Footer;