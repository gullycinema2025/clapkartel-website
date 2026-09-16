import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders } from "../../utils/auth";
import { ChevronRight, MapPin, User, Package, Layout, Phone, Mail, Globe, Home, Hash, Link, MessageSquare } from 'lucide-react';
import './index.css';

const ActressPage = () => {
    const navigate = useNavigate();

    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
    const BANNER_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/banners';
    const RENTALS_CATEGORY_ID = '22';

    // State for API data
    const [subcategories, setSubcategories] = useState([]);
    const [directoryList, setDirectoryList] = useState([]);
    const [selectedSubCatId, setSelectedSubCatId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDirectory, setLoadingDirectory] = useState(false);
    const [error, setError] = useState(null);

    // Filters state
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountryId, setSelectedCountryId] = useState('');
    const [selectedStateId, setSelectedStateId] = useState('');
    const [selectedCityId, setSelectedCityId] = useState('');

    // Directory Details state
    const [selectedDirectoryId, setSelectedDirectoryId] = useState(null);
    const [directoryItemDetails, setDirectoryItemDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);


    // Video state
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoIndex, setVideoIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);

    // Banner state
    const [bannerData, setBannerData] = useState([]);
    const bannerStripRef = useRef(null);

    // Helper function to build banner image URL
    const getBannerImageUrl = (imageName) => {
        if (!imageName) return '';
        if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
        return `${BANNER_IMAGE_BASE_URL}/${imageName}`;
    };

    // Helper to convert YouTube URL to embed URL
    const convertToEmbedUrl = (url, muted = true) => {
        if (!url) return '';
        if (url.includes('youtube.com/embed/')) return url;
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=${muted ? '1' : '0'}&controls=1&modestbranding=1&rel=0`;
        }
        return url;
    };

    // Helper function to convert text to title case
    const toTitleCase = (text) => {
        if (!text) return '';
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Fetch initial data: Subcategories, Videos, Banners
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Fetch Rentals Subcategories
                const subCatResponse = await fetch(`${BASE_URL}/api/allSubCategoryList/${RENTALS_CATEGORY_ID}?only_display=rentals`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });
                if (!subCatResponse.ok) throw new Error(`Failed to fetch subcategories: ${subCatResponse.status}`);
                const subCatResult = await subCatResponse.json();

                if (subCatResult?.subcategorylist && Array.isArray(subCatResult.subcategorylist)) {
                    setSubcategories(subCatResult.subcategorylist);
                    // Don't auto-select initially
                }

                // 2. Fetch Videos
                const videoResponse = await fetch(`${BASE_URL}/getPodCastAll`, { method: 'GET', headers: getAuthHeaders() });
                if (videoResponse.ok) {
                    const videoResult = await videoResponse.json();
                    if (videoResult?.result && Array.isArray(videoResult.result) && videoResult.result.length > 0) {
                        setVideos(videoResult.result);
                        setSelectedVideo(videoResult.result[0]);
                    }
                }

                // 3. Fetch Banners
                const bannerResponse = await fetch(`${BASE_URL}/dash/getbanners/1`, { method: 'GET', headers: getAuthHeaders() });
                if (bannerResponse.ok) {
                    const bannerResult = await bannerResponse.json();
                    setBannerData(bannerResult?.banners && Array.isArray(bannerResult.banners) ? bannerResult.banners : Array.isArray(bannerResult) ? bannerResult : []);
                }

            } catch (err) {
                /* console.error('Error fetching data:', err); */
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Fetch countries for selected subcategory
    const fetchCountries = async (subCatId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/directory-countries/${subCatId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const result = await response.json();
                setCountries(result.data || []);
            }
        } catch (e) {
            /* console.error('Error fetching countries:', e); */
        }
    };

    // Fetch states for selected subcategory
    const fetchStates = async (subCatId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/directory-states/${subCatId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const result = await response.json();
                setStates(result.data || []);
            }
        } catch (e) {
            /* console.error('Error fetching states:', e); */
        }
    };

    // Fetch cities for selected subcategory and state
    const fetchCities = async (subCatId, stateId) => {
        try {
            const response = await fetch(`${BASE_URL}/api/directory-cities/${subCatId}/${stateId}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const result = await response.json();
                setCities(result.data || []);
            }
        } catch (e) {
            /* console.error('Error fetching cities:', e); */
        }
    };

    // Fetch directory list for selected subcategory with filters
    const fetchFilteredDirectory = async (subCatId, country, state, city) => {
        setLoadingDirectory(true);
        try {
            let url = `${BASE_URL}/api/directory-list/${subCatId}`;
            if (country) {
                url += `/${country}`;
            }
            if (state) {
                url += `/${state}`;
            }
            if (city) {
                url += `/${city}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error(`Failed to fetch directory: ${response.status}`);
            const result = await response.json();
            if (result?.data && Array.isArray(result.data)) {
                setDirectoryList(result.data);
            } else {
                setDirectoryList([]);
            }
        } catch (err) {
            /* console.error('Error fetching directory:', err); */
            setDirectoryList([]);
        } finally {
            setLoadingDirectory(false);
        }
    };

    // Fetch directory list for selected subcategory
    const handleSubCatClick = async (subCatId) => {
        setSelectedSubCatId(subCatId);
        setDirectoryItemDetails(null); // Reset details
        setSelectedDirectoryId(null);

        // Reset filters
        setSelectedCountryId('');
        setSelectedStateId('');
        setSelectedCityId('');
        setCountries([]);
        setStates([]);
        setCities([]);

        fetchCountries(subCatId);
        fetchStates(subCatId);

        fetchFilteredDirectory(subCatId, '', '', '');
    };

    // Filter Change Handlers
    const handleCountryChange = (countryId) => {
        setSelectedCountryId(countryId);
        setSelectedStateId('');
        setSelectedCityId('');
        setCities([]);
        fetchFilteredDirectory(selectedSubCatId, countryId, '', '');
    };

    const handleStateChange = (stateId) => {
        setSelectedStateId(stateId);
        setSelectedCityId('');
        if (stateId) {
            fetchCities(selectedSubCatId, stateId);
        } else {
            setCities([]);
        }
        fetchFilteredDirectory(selectedSubCatId, selectedCountryId, stateId, '');
    };

    const handleCityChange = (cityId) => {
        setSelectedCityId(cityId);
        fetchFilteredDirectory(selectedSubCatId, selectedCountryId, selectedStateId, cityId);
    };

    const handleClearFilters = () => {
        setSelectedCountryId('');
        setSelectedStateId('');
        setSelectedCityId('');
        setCities([]);
        fetchFilteredDirectory(selectedSubCatId, '', '', '');
    };

    // Fetch Details for Specific Directory Item
    const handleDirectoryItemClick = async (id) => {
        setSelectedDirectoryId(id);
        setLoadingDetails(true);
        try {
            const response = await fetch(`${BASE_URL}/api/directory-view/${id}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error(`Failed to fetch details: ${response.status}`);
            const result = await response.json();

            // Handle multiple response structures: result.directoryview or result.data
            const details = result.directoryview || result.data || result;
            setDirectoryItemDetails(details);
        } catch (err) {
            /* console.error('Error fetching directory details:', err); */
        } finally {
            setLoadingDetails(false);
        }
    };

    // Banner auto-scroll
    useEffect(() => {
        if (bannerData.length === 0) return;
        const interval = setInterval(() => {
            if (bannerStripRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = bannerStripRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) bannerStripRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                else bannerStripRef.current.scrollBy({ left: 200, behavior: 'smooth' });
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [bannerData]);

    const handlePrevVideo = () => { if (!videos.length) return; const idx = videoIndex > 0 ? videoIndex - 1 : videos.length - 1; setVideoIndex(idx); setSelectedVideo(videos[idx]); };
    const handleNextVideo = () => { if (!videos.length) return; const idx = videoIndex < videos.length - 1 ? videoIndex + 1 : 0; setVideoIndex(idx); setSelectedVideo(videos[idx]); };

    // Loading state
    if (loading) {
        return (
            <div className="scu-page-wrapper">
                <div className="scu-loading-container">
                    <div className="scu-loading-spinner"></div>
                    <p>Loading Directory...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="scu-page-wrapper">
                <div className="scu-loading-container">
                    <p style={{ color: '#e74c3c' }}>Error: {error}</p>
                    <button onClick={() => window.location.reload()} className="scu-retry-btn">Retry</button>
                </div>
            </div>
        );
    }

    return (
        <div className="scu-page-wrapper">
            {/* ===== BREADCRUMB ===== */}
            <div className="scu-breadcrumb-header">
                <div className="scu-breadcrumb-content">
                    <span className="scu-back-arrow" onClick={() => navigate(-1)}>‹</span>
                    <h1 className="scu-breadcrumb-title">
                        <span className="scu-breadcrumb-link" onClick={() => navigate('/')}>
                            Home
                        </span>
                        <span className="scu-breadcrumb-sep">&gt;</span>
                        <span className="scu-breadcrumb-current">Directory</span>
                    </h1>
                </div>
            </div>

            {/* ===== TWO-COLUMN LAYOUT ===== */}
            <div className="scu-two-column-layout">

                {/* LEFT COLUMN — Video + Banners */}
                <div className="scu-left-column">
                    <div className="scu-video-container">
                        {selectedVideo ? (
                            <iframe
                                key={`${selectedVideo.id}-${isMuted}`}
                                src={convertToEmbedUrl(selectedVideo.video_url, isMuted)}
                                title={selectedVideo.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="scu-video-iframe"
                            />
                        ) : (
                            <div className="scu-video-placeholder"><span>No Video Available</span></div>
                        )}
                        {videos.length > 1 && (
                            <>
                                <button className="scu-video-nav scu-video-nav-left" onClick={handlePrevVideo}>‹</button>
                                <button className="scu-video-nav scu-video-nav-right" onClick={handleNextVideo}>›</button>
                            </>
                        )}
                    </div>

                    {bannerData.length > 0 && (
                        <div className="scu-banner-strip" ref={bannerStripRef}>
                            {bannerData.map((banner, index) => {
                                const imgSrc = getBannerImageUrl(banner?.banner_img || banner?.image || banner?.banner_image || banner?.url);
                                return (
                                    <div key={`banner-${index}`} className="scu-banner-card">
                                        <img src={imgSrc} alt={banner?.title || `Banner ${index + 1}`} className="scu-banner-img" onError={(e) => { e.target.style.opacity = '0.3'; }} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN — Subcategories + Directory List */}
                <div className="scu-right-column">
                    <div className="scu-directory-card">

                        {!selectedSubCatId ? (
                            <div className="scu-subcat-vertical-container">
                                <h2 className="scu-subcat-section-title">Select a Category</h2>
                                <div className="scu-subcat-grid">
                                    {subcategories.map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="scu-subcat-grid-item"
                                            onClick={() => handleSubCatClick(sub.id)}
                                        >
                                            <span className="scu-subcat-name">{sub.sub_cat_name.toUpperCase()}</span>
                                            <span className="scu-subcat-arrow">&gt;</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : directoryItemDetails ? (
                            <div className="scu-details-view">
                                {/* Details Header: Directory > Subcat > details */}
                                <div className="scu-dir-header">
                                    <h2 className="scu-dir-title">
                                        <span className="scu-dir-breadcrumb-link" onClick={() => {
                                            setSelectedSubCatId(null);
                                            setDirectoryItemDetails(null);
                                        }}>Directory</span>
                                        <span className="scu-dir-breadcrumb-sep">&gt;</span>
                                        <span className="scu-dir-breadcrumb-link" onClick={() => setDirectoryItemDetails(null)}>
                                            {subcategories.find(s => s.id === selectedSubCatId)?.sub_cat_name}
                                        </span>
                                        <span className="scu-dir-breadcrumb-sep">&gt;</span>
                                        <span className="scu-dir-breadcrumb-current">Details</span>
                                    </h2>
                                </div>

                                <div className="scu-details-content">
                                    {/* Primary Card: Business Name */}
                                    <div className="scu-details-primary-card">
                                        <div className="scu-details-icon-box">
                                            <Layout size={28} strokeWidth={1.5} color="#666" />
                                        </div>
                                        <h3 className="scu-details-biz-name">
                                            {toTitleCase(directoryItemDetails.business_name)}
                                        </h3>
                                    </div>

                                    {/* Detailed Info Card */}
                                    <div className="scu-details-info-card">
                                        <div className="scu-details-grid">
                                            <div className="scu-details-item">
                                                <User size={18} className="scu-details-item-icon" />
                                                <div className="scu-details-item-text">
                                                    <label>Contact Person</label>
                                                    <span>{directoryItemDetails.contact_person}</span>
                                                </div>
                                            </div>

                                            <div className="scu-details-item">
                                                <Phone size={18} className="scu-details-item-icon" />
                                                <div className="scu-details-item-text">
                                                    <label>Phone - 1</label>
                                                    <span>{directoryItemDetails.phone_one}</span>
                                                </div>
                                            </div>

                                            <div className="scu-details-item">
                                                <Phone size={18} className="scu-details-item-icon" />
                                                <div className="scu-details-item-text">
                                                    <label>Phone - 2</label>
                                                    <span>{directoryItemDetails.phone_two || 'N/A'}</span>
                                                </div>
                                            </div>

                                            <div className="scu-details-item">
                                                <Mail size={18} className="scu-details-item-icon" />
                                                <div className="scu-details-item-text">
                                                    <label>Email</label>
                                                    <span>{directoryItemDetails.email_id}</span>
                                                </div>
                                            </div>

                                            <div className="scu-details-item">
                                                <Home size={18} className="scu-details-item-icon" />
                                                <div className="scu-details-item-text">
                                                    <label>Address - 1</label>
                                                    <span>{directoryItemDetails.address_one}</span>
                                                </div>
                                            </div>

                                            <div className="scu-details-item">
                                                <Home size={18} className="scu-details-item-icon" />
                                                <div className="scu-details-item-text">
                                                    <label>Address - 2</label>
                                                    <span>{directoryItemDetails.address_two || 'N/A'}</span>
                                                </div>
                                            </div>

                                            <div className="scu-details-item">
                                                <MapPin size={18} className="scu-details-item-icon" />
                                                <div className="scu-details-item-text">
                                                    <label>City</label>
                                                    <span>{directoryItemDetails.city_name || directoryItemDetails.city}</span>
                                                </div>
                                            </div>

                                            <div className="scu-details-item">
                                                <MapPin size={18} className="scu-details-item-icon" />
                                                <div className="scu-details-item-text">
                                                    <label>State</label>
                                                    <span>{directoryItemDetails.state_name || directoryItemDetails.state}</span>
                                                </div>
                                            </div>

                                            <div className="scu-details-item">
                                                <Globe size={18} className="scu-details-item-icon" />
                                                <div className="scu-details-item-text">
                                                    <label>Country</label>
                                                    <span>{directoryItemDetails.country_name || directoryItemDetails.country}</span>
                                                </div>
                                            </div>

                                            <div className="scu-details-item">
                                                <Hash size={18} className="scu-details-item-icon" />
                                                <div className="scu-details-item-text">
                                                    <label>Pincode</label>
                                                    <span>{directoryItemDetails.pincode || 'N/A'}</span>
                                                </div>
                                            </div>

                                            <div className="scu-details-item">
                                                <Link size={18} className="scu-details-item-icon" />
                                                <div className="scu-details-item-text">
                                                    <label>Website Link</label>
                                                    <span>
                                                        {directoryItemDetails.web_link ? (
                                                            <a
                                                                href={directoryItemDetails.web_link.startsWith('http') ? directoryItemDetails.web_link : `https://${directoryItemDetails.web_link}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ color: '#0066cc', textDecoration: 'underline' }}
                                                            >
                                                                {directoryItemDetails.web_link}
                                                            </a>
                                                        ) : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="scu-details-item">
                                                <MessageSquare size={18} className="scu-details-item-icon" />
                                                <div className="scu-details-item-text">
                                                    <label>Comments</label>
                                                    <span>{directoryItemDetails.comments || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Directory Header: Directory > Subcategory Name */}
                                <div className="scu-dir-header">
                                    <h2 className="scu-dir-title">
                                        <span className="scu-dir-breadcrumb-link" onClick={() => setSelectedSubCatId(null)}>Directory</span>
                                        <span className="scu-dir-breadcrumb-sep">&gt;</span>
                                        <span className="scu-dir-breadcrumb-current">
                                            {subcategories.find(s => s.id === selectedSubCatId)?.sub_cat_name}
                                        </span>
                                    </h2>
                                </div>

                                {/* Filters Bar */}
                                <div className="scu-filters-bar">
                                    <div className="scu-filter-group">
                                        <select
                                            value={selectedCountryId}
                                            onChange={(e) => handleCountryChange(e.target.value)}
                                            className="scu-filter-select"
                                        >
                                            <option value="">Country</option>
                                            {countries.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="scu-filter-group">
                                        <select
                                            value={selectedStateId}
                                            onChange={(e) => handleStateChange(e.target.value)}
                                            className="scu-filter-select"
                                        >
                                            <option value="">State</option>
                                            {states.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="scu-filter-group">
                                        <select
                                            value={selectedCityId}
                                            onChange={(e) => handleCityChange(e.target.value)}
                                            className="scu-filter-select"
                                            disabled={!selectedStateId}
                                        >
                                            <option value="">City</option>
                                            {cities.map(ci => (
                                                <option key={ci.id} value={ci.id}>{ci.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {(selectedCountryId || selectedStateId || selectedCityId) && (
                                        <button onClick={handleClearFilters} className="scu-clear-filters-btn">
                                            Clear Filters
                                        </button>
                                    )}
                                </div>

                                {/* Directory Listing */}
                                <div className="scu-directory-list-container">
                                    {loadingDirectory || loadingDetails ? (
                                        <div className="scu-directory-loading">
                                            <div className="scu-mini-spinner"></div>
                                            <p>{loadingDetails ? 'Loading details...' : 'Loading directory...'}</p>
                                        </div>
                                    ) : directoryList.length === 0 ? (
                                        <div className="scu-empty-directory">
                                            <p>No listings found in this category.</p>
                                        </div>
                                    ) : (
                                        <div className="scu-directory-list">
                                            {directoryList.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="scu-directory-item"
                                                    onClick={() => handleDirectoryItemClick(item.id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {/* Column 1: Icon */}
                                                    <div className="scu-dir-col-icon">
                                                        <div className="scu-dir-icon-wrap">
                                                            <Layout size={24} strokeWidth={1.5} color="#666" />
                                                        </div>
                                                    </div>

                                                    {/* Column 2: Info */}
                                                    <div className="scu-dir-col-info">
                                                        <h3 className="scu-dir-business-name">{toTitleCase(item.business_name)}</h3>
                                                        <p className="scu-dir-contact-person">{item.contact_person?.toLowerCase()}</p>
                                                        <div className="scu-dir-location">
                                                            <MapPin size={12} className="scu-location-icon" />
                                                            <span>{item.city_name}</span>
                                                        </div>
                                                    </div>

                                                    {/* Column 3: Arrow */}
                                                    <div className="scu-dir-col-arrow">
                                                        <ChevronRight size={20} color="#999" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActressPage;
