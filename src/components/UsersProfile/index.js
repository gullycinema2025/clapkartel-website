import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaCity, FaMailBulk, FaInstagram, FaFacebook, FaYoutube, FaLinkedin } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import "./index.css";
import usersprofilebanner from "../../assets/usersprofilebanner.png";
import shareprofileicons from "../../assets/shareprofileicons.svg";
import dropdownprofileicon from "../../assets/dropdownprofileicon.svg";
import clapkartProfileIcon from "../../assets/clapkart-profile-icon.svg";
import { getCurrentUserId } from "../../utils/auth";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const UsersProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('about');

    const [expandedSubCategories, setExpandedSubCategories] = useState({});
    const [subCategoryDetails, setSubCategoryDetails] = useState({});
    const [subCatLoading, setSubCatLoading] = useState({});
    const [galleryImages, setGalleryImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [galleryLoading, setGalleryLoading] = useState(false);
    const [videosLoading, setVideosLoading] = useState(false);
    const [cityName, setCityName] = useState('');
    const [selectedImage, setSelectedImage] = useState(null); // Lightbox state

    // Message popup state
    const [showMessage, setShowMessage] = useState(false);
    const [messageContent, setMessageContent] = useState({ type: '', text: '' });

    // Helper function to display message popup
    const displayMessage = (type, text) => {
        setMessageContent({ type, text });
        setShowMessage(true);
        setTimeout(() => {
            setShowMessage(false);
        }, 3000);
    };


    // Handle Follow/Unfollow toggle
    const handleFollowToggle = async () => {
        const currentUserId = getCurrentUserId();

        if (!currentUserId) {
            displayMessage('error', 'Please login to follow users');
            return;
        }

        // Optimistically toggle UI state
        // If "True", we are unfollowing (action is to remove)
        // If "False", we are following (action is to add)
        // API handles both with addtowishlist logic, but we need to confirm if 'addtowishlist' toggles or just adds
        // Based on WishlistPage, it uses /wish/addtowishlist for UNFOLLOW as well.
        // Assuming the API handles toggle or we treat it as such.
        // Wait, UsersPage checks is_wishlist === "1" and if so says "Already following". Refused to toggle.
        // But WishlistPage uses SAME endpoint /wish/addtowishlist to UNFOLLOW (remove).
        // Let's implement the API call.

        const isFollowing = userData.wish_active === "True";

        // If already following, and we click "Unfollow", we should probably call the same API if it supports toggle,
        // OR a different one if it exists. USER said: "how i follow and unfollow done with api now want same apis here"
        // In WishlistPage (Followers), unFollowing is done via /wish/addtowishlist too!

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/wish/addtowishlist`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: currentUserId,
                    pro_reg_id: user_id // The profile user ID
                }),
            });

            const result = await response.json();

            if (result.status === 'success' || response.ok) {
                // Toggle success
                const newStatus = isFollowing ? "False" : "True";
                setUserData({
                    ...userData,
                    wish_active: newStatus
                });
                displayMessage('success', isFollowing ? `You unfollowed ${userDetails.userName}` : `You are now following ${userDetails.userName}`);

                // Real-time Follow Notification write to Firestore
                if (!isFollowing) {
                    try {
                        const senderName = localStorage.getItem('name_key') || 'A User';
                        const senderImage = localStorage.getItem('userProfileImage') || '';
                        let subcatId = '';
                        const userDataStr = localStorage.getItem('userData');
                        if (userDataStr) {
                            const parsed = JSON.parse(userDataStr);
                            subcatId = parsed.sub_cat_id || parsed.initial_sub_cat_id || parsed.initial_subcat_id || '';
                        }

                        const notifRef = collection(db, 'notifications', user_id, 'user_notifications');
                        await addDoc(notifRef, {
                            title: senderName,
                            message: `${senderName} added you to their wishlist!`,
                            timestamp: serverTimestamp(),
                            senderId: currentUserId,
                            senderImage: senderImage,
                            receiverId: user_id,
                            type: 'wishlist',
                            subcatId: subcatId,
                            isRead: false
                        });
                        /* console.log("📌 Profile follow notification sent in real-time to receiver!"); */
                    } catch (notifErr) {
                        /* console.error("Failed to write profile follow notification to Firestore:", notifErr); */
                    }
                }
            } else {
                displayMessage('error', isFollowing ? 'Failed to unfollow' : 'Failed to follow');
            }
        } catch (err) {
            /* console.error('Error toggling follow:', err); */
            displayMessage('error', 'Action failed. Please try again.');
        }
    };

    // Handle SubCategory Expansion and Data Fetching
    const handleSubCategoryExpand = async (eProId) => {
        // Accordion behavior: Close all others, toggle current
        const isCurrentlyExpanded = expandedSubCategories[eProId];
        setExpandedSubCategories(isCurrentlyExpanded ? {} : { [eProId]: true });

        // If expanding and data not present, fetch it
        if (!expandedSubCategories[eProId] && !subCategoryDetails[eProId]) {
            try {
                setSubCatLoading(prev => ({ ...prev, [eProId]: true }));
                const token = localStorage.getItem('token');
                const response = await fetch(`${BASE_URL}/api/viewUserSkills/${eProId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (result.status === 200 && result.data) {
                    setSubCategoryDetails(prev => ({
                        ...prev,
                        [eProId]: result.data
                    }));
                }
            } catch (err) {
                /* console.error(`Error fetching details for ${eProId}:`, err); */
            } finally {
                setSubCatLoading(prev => ({ ...prev, [eProId]: false }));
            }
        }
    };

    // Get user_id and sub_cat_id from navigation state
    const { sub_cat_id, user_id } = location.state || {};

    useEffect(() => {
        // Redirect if no user_id or sub_cat_id provided
        if (!user_id || !sub_cat_id) {
            navigate('/users');
            return;
        }

        // Fetch user details
        const fetchUserDetails = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `${BASE_URL}/api/getUserDetails/${sub_cat_id}/${user_id}`,
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                const result = await response.json();
                /* console.log('User Details:', result); */

                if (result.userDetailsExtraSubcategory && result.userDetailsExtraSubcategory.length > 0) {
                    setUserData(result);

                    // Fetch City Name if city ID and state ID are present
                    const details = result.userDetailsExtraSubcategory[0];
                    if (details.userCity && details.userStateList) {
                        fetchCityName(details.userStateList, details.userCity);
                    }
                } else {
                    setError('User details not found');
                }
            } catch (err) {
                /* console.error('Error fetching user details:', err); */
                setError('Failed to load user details');
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [user_id, sub_cat_id, navigate]);

    // Helper to fetch city name
    const fetchCityName = async (stateId, cityId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/api/locations?state_id=${stateId}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            const result = await response.json();

            let citiesData = [];
            if (result?.type === 'cities' && result?.data) {
                citiesData = result.data;
            } else if (Array.isArray(result?.data)) {
                citiesData = result.data;
            } else if (Array.isArray(result)) {
                citiesData = result;
            }

            const foundCity = citiesData.find(city => String(city.id) === String(cityId));
            if (foundCity) {
                setCityName(foundCity.name);
            }
        } catch (err) {
            /* console.error('Error fetching city name:', err); */
        }
    };

    // Fetch gallery images
    useEffect(() => {
        if (!user_id) return;

        const fetchGalleryImages = async () => {
            try {
                setGalleryLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `${BASE_URL}/api/getUserImages/${user_id}`,
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                const result = await response.json();
                /* console.log('Gallery Images:', result); */

                if (result.status && result.data) {
                    setGalleryImages(result.data);
                }
            } catch (err) {
                /* console.error('Error fetching gallery images:', err); */
            } finally {
                setGalleryLoading(false);
            }
        };

        fetchGalleryImages();
    }, [user_id]);

    // Fetch videos
    useEffect(() => {
        if (!user_id) return;

        const fetchVideos = async () => {
            try {
                setVideosLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(
                    `${BASE_URL}/api/getUserVideos/${user_id}`,
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                const result = await response.json();
                /* console.log('Videos:', result); */

                if (result.status && result.data) {
                    setVideos(result.data);
                }
            } catch (err) {
                /* console.error('Error fetching videos:', err); */
            } finally {
                setVideosLoading(false);
            }
        };

        fetchVideos();
    }, [user_id]);

    // Get image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://placehold.co/150?text=No+Image';
        return `${BASE_URL}/${imagePath}`;
    };

    // Get YouTube video ID from URL
    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        // Support regular videos, shorts, and youtu.be links
        const regex = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    if (loading) {
        return (
            <div className="users-profile">
                <div className="loading-container">
                    <p>Loading user profile...</p>
                </div>
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="users-profile">
                <div className="error-container">
                    <p>{error || 'Failed to load user profile'}</p>
                    <button onClick={() => navigate('/users')}>Back to Users</button>
                </div>
            </div>
        );
    }

    const userDetails = userData.userDetailsExtraSubcategory[0];
    const isFollowing = userData.wish_active === "True";

    return (
        <div className="users-profile">
            <div className="profile-banner">
                <img
                    src={usersprofilebanner}
                    alt="Profile Banner"
                />
            </div>

            <div className="profile-header">
                <div className="profile-image">
                    <img
                        src={getImageUrl(userDetails.userProfileImage)}
                        alt={userDetails.userName}
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/150?text=No+Image';
                        }}
                    />
                </div>

                <div className="profile-info">
                    <h2>{userDetails.userName || 'N/A'}</h2>
                    <p className="role">{userData.getSubCategory || 'N/A'}</p>
                    <p className="meta">
                        {userDetails.userHeight ? `Height: ${userDetails.userHeight}` : ''}
                        {userDetails.userHeight && userDetails.userAge ? ' | ' : ''}
                        {userDetails.userAge ? `Age Group: ${userDetails.userAge}` : ''}
                        {(userDetails.userHeight || userDetails.userAge) && userDetails.gender ? ' | ' : ''}
                        {userDetails.gender ? (String(userDetails.gender) === '1' ? 'Male' : String(userDetails.gender) === '2' ? 'Female' : userDetails.gender) : ''}
                    </p>

                    <div className="profile-actions">
                        <button
                            className={`btn ${isFollowing ? 'following' : 'primary'}`}
                            onClick={handleFollowToggle}
                        >
                            {isFollowing ? 'UnFollow' : 'Follow'}
                        </button>
                        <button className="btn outline" onClick={() => {
                            navigate('/messages', {
                                state: {
                                    peerId: user_id,
                                    peerName: userDetails.userName,
                                    peerImage: getImageUrl(userDetails.userProfileImage),
                                    subCatId: sub_cat_id || ''
                                }
                            });
                        }}>Chat</button>
                    </div>
                </div>

                <div className="profile-share">
                    {/* <button className="share-btn">
                        <img
                            src={shareprofileicons}
                            alt="Share Profile"
                        />
                    </button> */}
                </div>
            </div>

            <div className="profile-tabs">
                <span
                    className={activeTab === 'about' ? 'active' : ''}
                    onClick={() => setActiveTab('about')}
                >
                    About
                </span>
                <span
                    className={activeTab === 'gallery' ? 'active' : ''}
                    onClick={() => setActiveTab('gallery')}
                >
                    Gallery
                </span>
                <span
                    className={activeTab === 'videos' ? 'active' : ''}
                    onClick={() => setActiveTab('videos')}
                >
                    Videos
                </span>
                <span
                    className={activeTab === 'contact' ? 'active' : ''}
                    onClick={() => setActiveTab('contact')}
                >
                    Contact
                </span>
                <span
                    className={activeTab === 'social' ? 'active' : ''}
                    onClick={() => setActiveTab('social')}
                >
                    Social Media
                </span>
            </div>

            <div className="profile-content">
                {activeTab === 'about' && (
                    <>
                        <h3>About</h3>
                        <p>{userDetails.userAbout || 'No information available'}</p>

                        <h3>Bio</h3>
                        <p>{userDetails.user_bio || 'No bio available'}</p>

                        {userDetails.userSpecialSkills && (
                            <>
                                <h3>Special Skills</h3>
                                <p>{userDetails.userSpecialSkills}</p>
                            </>
                        )}

                        {/* Subcategories List - Only in About Tab */}
                        {userData.resultTabList && userData.resultTabList.length > 0 && (
                            <div className="subcategories-wrapper">
                                <h3>Other Categories</h3>
                                <div className="subcategories-container">
                                    {userData.resultTabList.map((subCat) => (
                                        <div key={subCat.e_pro_id} className="subcategory-item">
                                            <div className="subcategory-header">
                                                <div className="subcategory-left">
                                                    <img
                                                        src={clapkartProfileIcon}
                                                        alt="Profile Icon"
                                                    />
                                                    <span className="subcategory-text">{subCat.sub_cat_name}</span>
                                                </div>

                                                <div
                                                    className="subcategory-right"
                                                    onClick={() => handleSubCategoryExpand(subCat.e_pro_id)}
                                                    style={{ cursor: 'pointer', padding: '10px' }}
                                                >
                                                    <img
                                                        src={dropdownprofileicon}
                                                        alt="Dropdown Icon"
                                                        style={{
                                                            transform: expandedSubCategories[subCat.e_pro_id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            transition: 'transform 0.3s ease',
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {expandedSubCategories[subCat.e_pro_id] && (
                                                <div className="subcategory-content">
                                                    {subCatLoading[subCat.e_pro_id] ? (
                                                        <p>Loading details...</p>
                                                    ) : subCategoryDetails[subCat.e_pro_id] ? (
                                                        <>
                                                            {subCategoryDetails[subCat.e_pro_id].profession_info?.user_about && (
                                                                <div className="subcat-about">
                                                                    <h4>About</h4>
                                                                    <p>{subCategoryDetails[subCat.e_pro_id].profession_info.user_about}</p>
                                                                </div>
                                                            )}

                                                            {subCategoryDetails[subCat.e_pro_id].video_links && subCategoryDetails[subCat.e_pro_id].video_links.length > 0 && (
                                                                <div className="subcat-videos">
                                                                    <h4>Videos</h4>
                                                                    <div className="subcat-videos-list">
                                                                        {subCategoryDetails[subCat.e_pro_id].video_links.map((link, index) => {
                                                                            const videoId = getYouTubeVideoId(link);
                                                                            return videoId ? (
                                                                                <div key={index} className="subcat-video-item">
                                                                                    <iframe
                                                                                        width="100%"
                                                                                        height="200"
                                                                                        src={`https://www.youtube.com/embed/${videoId}`}
                                                                                        title={`Video ${index + 1}`}
                                                                                        frameBorder="0"
                                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                        allowFullScreen
                                                                                    ></iframe>
                                                                                </div>
                                                                            ) : null;
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {!subCategoryDetails[subCat.e_pro_id].profession_info?.user_about &&
                                                                (!subCategoryDetails[subCat.e_pro_id].video_links || subCategoryDetails[subCat.e_pro_id].video_links.length === 0) && (
                                                                    <p>No additional details available.</p>
                                                                )}
                                                        </>
                                                    ) : (
                                                        <p>No details found.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'gallery' && (
                    <div className="gallery-section">
                        <h3>Gallery</h3>
                        {galleryLoading ? (
                            <p>Loading gallery...</p>
                        ) : galleryImages.length > 0 ? (
                            <div className="gallery-grid">
                                {galleryImages.map((image) => (
                                    <div
                                        key={image.p_id}
                                        className="gallery-item"
                                        onClick={() => setSelectedImage(`${BASE_URL}/uploads/user_photos/${image.p_name}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <img
                                            src={`${BASE_URL}/uploads/user_photos/${image.p_name}`}
                                            alt={`Gallery ${image.p_id}`}
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/300?text=Image+Not+Found';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No images available</p>
                        )}
                    </div>
                )}

                {activeTab === 'videos' && (
                    <div className="videos-section">
                        <h3>Videos</h3>
                        {videosLoading ? (
                            <p>Loading videos...</p>
                        ) : videos.length > 0 ? (
                            <div className="videos-grid">
                                {videos.map((video) => {
                                    const videoId = getYouTubeVideoId(video.doc_name);
                                    return videoId ? (
                                        <div key={video.id} className="video-item">
                                            <iframe
                                                width="100%"
                                                height="200"
                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                title={video.video_title || `Video ${video.id}`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        ) : (
                            <p>No videos available</p>
                        )}
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div className="contact-section">
                        <h3>Contact Information</h3>
                        <div className="contact-items">
                            {userDetails.userContact && (
                                <div className="contact-item">
                                    <FaPhone className="contact-icon" />
                                    <div className="contact-details">
                                        <strong>Phone:</strong>
                                        <span>{userDetails.userContact}</span>
                                    </div>
                                </div>
                            )}
                            {userDetails.userEmailid && (
                                <div className="contact-item">
                                    <FaEnvelope className="contact-icon" />
                                    <div className="contact-details">
                                        <strong>Email:</strong>
                                        <span>{userDetails.userEmailid}</span>
                                    </div>
                                </div>
                            )}
                            {userDetails.userAddress && (
                                <div className="contact-item">
                                    <FaMapMarkerAlt className="contact-icon" />
                                    <div className="contact-details">
                                        <strong>Address:</strong>
                                        <span>{userDetails.userAddress}</span>
                                    </div>
                                </div>
                            )}
                            {userDetails.userCity && (
                                <div className="contact-item">
                                    <FaCity className="contact-icon" />
                                    <div className="contact-details">
                                        <strong>City:</strong>
                                        <span>{cityName || userDetails.userCity}</span>
                                    </div>
                                </div>
                            )}
                            {userDetails.userZipcode && (
                                <div className="contact-item">
                                    <FaMailBulk className="contact-icon" />
                                    <div className="contact-details">
                                        <strong>Zipcode:</strong>
                                        <span>{userDetails.userZipcode}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'social' && (
                    <div className="social-section">
                        <h3>Social Media</h3>
                        <div className="social-media-row">
                            {userDetails.userSocialLinkInsta && (
                                <a
                                    href={userDetails.userSocialLinkInsta}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-icon-wrapper instagram"
                                >
                                    <FaInstagram />
                                </a>
                            )}
                            {userDetails.userSocialLinkFace && (
                                <a
                                    href={userDetails.userSocialLinkFace}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-icon-wrapper facebook"
                                >
                                    <FaFacebook />
                                </a>
                            )}
                            {userDetails.userSocialLinkYoutube && (
                                <a
                                    href={userDetails.userSocialLinkYoutube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-icon-wrapper youtube"
                                >
                                    <FaYoutube />
                                </a>
                            )}
                            {userDetails.userSocialLinkedIn && (
                                <a
                                    href={userDetails.userSocialLinkedIn}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-icon-wrapper linkedin"
                                >
                                    <FaLinkedin />
                                </a>
                            )}
                            {!userDetails.userSocialLinkInsta &&
                                !userDetails.userSocialLinkFace &&
                                !userDetails.userSocialLinkYoutube &&
                                !userDetails.userSocialLinkedIn && (
                                    <p>No social media links available</p>
                                )}
                        </div>
                    </div>
                )}
            </div>

            {/* Message Popup */}
            <AnimatePresence>
                {showMessage && (
                    <motion.div
                        className={`message-popup ${messageContent.type === 'success' ? 'message-success' : messageContent.type === 'error' ? 'message-error' : 'message-info'}`}
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            zIndex: 1000,
                            borderLeft: `5px solid ${messageContent.type === 'success' ? '#4caf50' : messageContent.type === 'error' ? '#f44336' : '#2196f3'}`
                        }}
                    >
                        <span style={{ fontSize: '18px', color: messageContent.type === 'success' ? '#4caf50' : messageContent.type === 'error' ? '#f44336' : '#2196f3' }}>
                            {messageContent.type === 'success' ? '✓' : messageContent.type === 'error' ? '✕' : 'ℹ'}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{messageContent.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="lightbox-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            className="lightbox-content"
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>&times;</button>
                            <img src={selectedImage} alt="Full size" className="lightbox-image" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UsersProfile;
