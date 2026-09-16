import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.css';

const SubCategoryUsersPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
    const BANNER_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/banners';

    // Get sub-category data from navigation state
    const { subCategoryId, subCategoryName, categoryId, categoryName, sourcePage } = location.state || {};

    // State for API data
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [subcategoryInfo, setSubcategoryInfo] = useState({ name: subCategoryName || '', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    // Video state
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoIndex, setVideoIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);

    // Banner state
    const [bannerData, setBannerData] = useState([]);
    const bannerStripRef = useRef(null);

    // Helper: auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Helper: user profile image
    const getUserProfileImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
        return `${BASE_URL}/${imagePath}`;
    };

    // Helper: banner image
    const getBannerImageUrl = (imageName) => {
        if (!imageName) return '';
        if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
        return `${BANNER_IMAGE_BASE_URL}/${imageName}`;
    };

    // Helper: YouTube embed
    const convertToEmbedUrl = (url, muted = true) => {
        if (!url) return '';
        if (url.includes('youtube.com/embed/')) return url;
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=${muted ? '1' : '0'}&controls=1&modestbranding=1&rel=0`;
        }
        return url;
    };

    // Helper: title case
    const toTitleCase = (text) => {
        if (!text) return '';
        return text.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const handleUserClick = (user) => {
        navigate('/user-profile', {
            state: { sub_cat_id: subCategoryId, user_id: user.userId }
        });
    };

    // Fetch countries
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoadingCountries(true);
                const response = await fetch(`${BASE_URL}/api/locations`, { method: 'GET', headers: getAuthHeaders() });
                if (!response.ok) throw new Error();
                const result = await response.json();
                const data = result?.data && Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
                setCountries(data);
            } catch (err) {
                /* console.error('Error fetching countries:', err); */
            } finally {
                setLoadingCountries(false);
            }
        };
        fetchCountries();
    }, []);

    // Fetch states when country changes
    useEffect(() => {
        if (!selectedCountry) { setStates([]); setSelectedState(''); setCities([]); setSelectedCity(''); return; }
        const fetchStates = async () => {
            try {
                setLoadingStates(true); setStates([]);
                const response = await fetch(`${BASE_URL}/api/locations?country_id=${selectedCountry}`, { method: 'GET', headers: getAuthHeaders() });
                if (!response.ok) throw new Error();
                const result = await response.json();
                const data = result?.data && Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
                setStates(data);
            } catch (err) { /* console.error('Error fetching states:', err); */ setStates([]); }
            finally { setLoadingStates(false); }
        };
        fetchStates();
    }, [selectedCountry]);

    // Fetch cities when state changes
    useEffect(() => {
        if (!selectedState) { setCities([]); setSelectedCity(''); return; }
        const fetchCities = async () => {
            try {
                setLoadingCities(true); setCities([]);
                const response = await fetch(`${BASE_URL}/api/locations?state_id=${selectedState}`, { method: 'GET', headers: getAuthHeaders() });
                if (!response.ok) throw new Error();
                const result = await response.json();
                const data = result?.data && Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
                setCities(data);
            } catch (err) { /* console.error('Error fetching cities:', err); */ setCities([]); }
            finally { setLoadingCities(false); }
        };
        fetchCities();
    }, [selectedState]);

    // Fetch users
    useEffect(() => {
        if (!subCategoryId) { navigate('/craft'); return; }
        const fetchAll = async () => {
            try {
                setLoading(true); setError(null);
                let apiUrl = `${BASE_URL}/api/getUserListBasedOnSubCat/${subCategoryId}`;
                if (selectedCountry) {
                    apiUrl += `/${selectedCountry}`;
                    if (selectedState) {
                        apiUrl += `/${selectedState}`;
                        if (selectedCity) {
                            apiUrl += `/${selectedCity}`;
                        }
                    }
                }
                const response = await fetch(apiUrl, { method: 'GET', headers: getAuthHeaders() });
                if (!response.ok) throw new Error(`Failed: ${response.status}`);
                const result = await response.json();
                const userList = result?.userList && Array.isArray(result.userList) ? result.userList : [];
                setUsers(userList);
                setFilteredUsers(userList);
                if (result?.subcategoryName) setSubcategoryInfo({ name: result.subcategoryName, description: result.subcategoryDes || '' });

                // Fetch videos — subcategory-specific: GET /api/podcast/subcategory?cat_id={catId}&sub_cat_id={subCatId}
                try {
                    const podcastUrl = categoryId
                        ? `${BASE_URL}/api/podcast/subcategory?cat_id=${categoryId}&sub_cat_id=${subCategoryId}`
                        : `${BASE_URL}/api/podcast/subcategory?sub_cat_id=${subCategoryId}`;
                    const videoResponse = await fetch(podcastUrl, { method: 'GET', headers: getAuthHeaders() });
                    if (videoResponse.ok) {
                        const videoResult = await videoResponse.json();
                        const videoData = videoResult?.data || videoResult?.result || [];
                        if (Array.isArray(videoData) && videoData.length > 0) {
                            setVideos(videoData);
                            setSelectedVideo(videoData[0]);
                        } else {
                            // Fallback to /getpodcast (generic)
                            const fb = await fetch(`${BASE_URL}/getpodcast`, { method: 'GET', headers: getAuthHeaders() });
                            if (fb.ok) { const fbr = await fb.json(); const fbd = fbr?.result || fbr?.data || []; if (fbd.length > 0) { setVideos(fbd); setSelectedVideo(fbd[0]); } }
                        }
                    } else {
                        const fb = await fetch(`${BASE_URL}/getpodcast`, { method: 'GET', headers: getAuthHeaders() });
                        if (fb.ok) { const fbr = await fb.json(); const fbd = fbr?.result || fbr?.data || []; if (fbd.length > 0) { setVideos(fbd); setSelectedVideo(fbd[0]); } }
                    }
                } catch (videoErr) {
                    /* console.warn('[Podcast] non-fatal:', videoErr.message); */
                }

                // Fetch banners
                const bannerResponse = await fetch(`${BASE_URL}/dash/getbanners/1`, { method: 'GET', headers: getAuthHeaders() });
                if (bannerResponse.ok) {
                    const bannerResult = await bannerResponse.json();
                    setBannerData(bannerResult?.banners && Array.isArray(bannerResult.banners) ? bannerResult.banners : Array.isArray(bannerResult) ? bannerResult : []);
                }
            } catch (err) { /* console.error('Error:', err); */ setError(err.message); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [subCategoryId, selectedCountry, selectedState, selectedCity, navigate]);

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

    const handleCountryChange = (e) => {
        const countryId = e.target.value;
        setSelectedCountry(countryId);
        setSelectedState('');
        setSelectedCity('');
        setStates([]);
        setCities([]);
    };

    const handleStateChange = (e) => {
        const stateId = e.target.value;
        setSelectedState(stateId);
        setSelectedCity('');
        setCities([]);
    };

    const handleCityChange = (e) => {
        const cityId = e.target.value;
        setSelectedCity(cityId);
    };

    const handleClearFilters = () => {
        setSelectedCountry('');
        setSelectedState('');
        setSelectedCity('');
        setStates([]);
        setCities([]);
    };

    if (loading) {
        return (
            <div className="scu-page-wrapper">
                <div className="scu-loading-container">
                    <div className="scu-loading-spinner"></div>
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

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
                        <span className="scu-breadcrumb-link" onClick={() => {
                            if (categoryName === 'Rentals') {
                                if (sourcePage === '/') {
                                    navigate('/', { state: { scrollToRentals: true } });
                                } else {
                                    navigate(sourcePage || '/other-section');
                                }
                            } else {
                                if (sourcePage === '/') {
                                    navigate('/', { state: { activeTab: '24crafts' } });
                                } else {
                                    navigate(sourcePage || '/craft');
                                }
                            }
                        }}>
                            {categoryName === 'Rentals' ? 'Other Sections' : '24 Crafts'}
                        </span>
                        {categoryName && (
                            <>
                                <span className="scu-breadcrumb-sep">&gt;</span>
                                <span className="scu-breadcrumb-link" onClick={() => {
                                    if (categoryName === 'Rentals') {
                                        navigate('/', { state: { scrollToRentals: true } });
                                    } else {
                                        navigate(-1);
                                    }
                                }}>
                                    {toTitleCase(categoryName)}
                                </span>
                            </>
                        )}
                        <span className="scu-breadcrumb-sep">&gt;</span>
                        <span className="scu-breadcrumb-current">{toTitleCase(subcategoryInfo.name || subCategoryName)}</span>
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

                {/* RIGHT COLUMN — Filters + User Cards */}
                <div className="scu-right-column">
                    <div className="scu-content-card">

                        {/* Filters Bar */}
                        <div className="scu-filters-bar">
                            {/* Country */}
                            <div className="scu-filter-group">
                                <select
                                    className="scu-filter-select"
                                    value={selectedCountry}
                                    onChange={handleCountryChange}
                                    disabled={loadingCountries}
                                >
                                    <option value="">{loadingCountries ? 'Loading...' : 'Country'}</option>
                                    {countries.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* State */}
                            <div className="scu-filter-group">
                                <select
                                    className="scu-filter-select"
                                    value={selectedState}
                                    onChange={handleStateChange}
                                    disabled={!selectedCountry || loadingStates}
                                >
                                    <option value="">{!selectedCountry ? 'Select Country' : loadingStates ? 'Loading...' : 'State'}</option>
                                    {states.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* City */}
                            <div className="scu-filter-group">
                                <select
                                    className="scu-filter-select"
                                    value={selectedCity}
                                    onChange={handleCityChange}
                                    disabled={!selectedState || loadingCities}
                                >
                                    <option value="">{!selectedState ? 'Select State' : loadingCities ? 'Loading...' : 'City'}</option>
                                    {cities.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Button */}
                            {(selectedCountry || selectedState || selectedCity) && (
                                <button onClick={handleClearFilters} className="scu-clear-filters-btn">
                                    Clear Filters
                                </button>
                            )}
                        </div>

                        {/* Users Grid */}
                        {filteredUsers.length === 0 ? (
                            <div className="scu-empty">
                                <p>{selectedCountry || selectedState || selectedCity ? 'No users matching filters' : 'No users found in this category'}</p>
                            </div>
                        ) : (
                            <div className="scu-users-grid">
                                {filteredUsers.filter(user => user.userId && user.userName && user.userName.trim() !== '').map((user) => (
                                    <div
                                        key={user.userId}
                                        className="scu-user-card"
                                        onClick={() => handleUserClick(user)}
                                    >
                                        <div className="scu-user-avatar-wrap">
                                            {user.userProfileImage ? (
                                                <img
                                                    src={getUserProfileImageUrl(user.userProfileImage)}
                                                    alt={user.userName}
                                                    className="scu-user-avatar"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                />
                                            ) : null}
                                            <div
                                                className="scu-user-avatar scu-user-avatar-fallback"
                                                style={{ display: user.userProfileImage ? 'none' : 'flex' }}
                                            >
                                                {user.userName?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        </div>
                                        <p className="scu-user-name">{toTitleCase(user.userName)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubCategoryUsersPage;