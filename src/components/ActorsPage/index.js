import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthHeaders } from "../../utils/auth";
import './index.css';

const ActorsPage = () => {
    const navigate = useNavigate();

    const handleUserClick = (user) => {
        navigate('/user-profile', {
            state: {
                sub_cat_id: ACTOR_SUBCATEGORY_ID,
                user_id: user.userId
            }
        });
    };

    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
    const BANNER_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/banners';
    const ACTOR_SUBCATEGORY_ID = '86'; // Subcategory ID for Actors

    // State for API data
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [pageInfo, setPageInfo] = useState({
        name: 'Cast & Crew',
        description: 'Male lead / Supporting Performers'
    });
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

    // Search input states
    const [countrySearch, setCountrySearch] = useState('');
    const [stateSearch, setStateSearch] = useState('');
    const [citySearch, setCitySearch] = useState('');

    // Dropdown visibility states
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // Filtered lists
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [filteredStates, setFilteredStates] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);

    // Applied filter states (used for API calls)
    const [appliedCountry, setAppliedCountry] = useState('');
    const [appliedState, setAppliedState] = useState('');
    const [appliedCity, setAppliedCity] = useState('');

    // Video state
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoIndex, setVideoIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);

    // Banner state
    const [bannerData, setBannerData] = useState([]);
    const bannerStripRef = useRef(null);

    // Helper function to construct user profile image URL
    const getUserProfileImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `${BASE_URL}/${imagePath}`;
    };

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

    // Fetch countries
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoadingCountries(true);
                const response = await fetch(`${BASE_URL}/api/locations`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch countries: ${response.status}`);
                }

                const result = await response.json();

                // Handle the response structure: { type: "countries", data: [...] }
                if (result?.type === 'countries' && result?.data && Array.isArray(result.data)) {
                    setCountries(result.data);
                } else if (result?.data && Array.isArray(result.data)) {
                    setCountries(result.data);
                } else if (Array.isArray(result)) {
                    setCountries(result);
                } else {
                    /* console.error('Unexpected countries response format:', result); */
                    setCountries([]);
                }
            } catch (err) {
                /* console.error('Error fetching countries:', err); */
            } finally {
                setLoadingCountries(false);
            }
        };

        fetchCountries();
    }, []);

    // Fetch states when country is selected
    useEffect(() => {
        if (!selectedCountry) {
            setStates([]);
            setSelectedState('');
            setCities([]);
            setSelectedCity('');
            return;
        }

        const fetchStates = async () => {
            try {
                setLoadingStates(true);
                setStates([]);

                const response = await fetch(`${BASE_URL}/api/locations?country_id=${selectedCountry}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch states: ${response.status}`);
                }

                const result = await response.json();

                // Handle the response structure: { type: "states", data: [...] }
                if (result?.type === 'states' && result?.data && Array.isArray(result.data)) {
                    setStates(result.data);
                } else if (result?.data && Array.isArray(result.data)) {
                    setStates(result.data);
                } else if (Array.isArray(result)) {
                    setStates(result);
                } else {
                    /* console.error('Unexpected states response format:', result); */
                    setStates([]);
                }
            } catch (err) {
                /* console.error('Error fetching states:', err); */
                setStates([]);
            } finally {
                setLoadingStates(false);
            }
        };

        fetchStates();
    }, [selectedCountry]);

    // Fetch cities when state is selected
    useEffect(() => {
        if (!selectedState) {
            setCities([]);
            setSelectedCity('');
            return;
        }

        const fetchCities = async () => {
            try {
                setLoadingCities(true);
                setCities([]);

                const response = await fetch(`${BASE_URL}/api/locations?state_id=${selectedState}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch cities: ${response.status}`);
                }

                const result = await response.json();

                // Handle the response structure: { type: "cities", data: [...] }
                if (result?.type === 'cities' && result?.data && Array.isArray(result.data)) {
                    setCities(result.data);
                } else if (result?.data && Array.isArray(result.data)) {
                    setCities(result.data);
                } else if (Array.isArray(result)) {
                    setCities(result);
                } else {
                    /* console.error('Unexpected cities response format:', result); */
                    setCities([]);
                }
            } catch (err) {
                /* console.error('Error fetching cities:', err); */
                setCities([]);
            } finally {
                setLoadingCities(false);
            }
        };

        fetchCities();
    }, [selectedState]);

    // Filter countries based on search input
    useEffect(() => {
        if (countrySearch.trim() === '') {
            setFilteredCountries(countries);
        } else {
            const filtered = countries.filter(country =>
                country.name.toLowerCase().includes(countrySearch.toLowerCase())
            );
            setFilteredCountries(filtered);
        }
    }, [countrySearch, countries]);

    // Filter states based on search input
    useEffect(() => {
        if (stateSearch.trim() === '') {
            setFilteredStates(states);
        } else {
            const filtered = states.filter(state =>
                state.name.toLowerCase().includes(stateSearch.toLowerCase())
            );
            setFilteredStates(filtered);
        }
    }, [stateSearch, states]);

    // Filter cities based on search input
    useEffect(() => {
        if (citySearch.trim() === '') {
            setFilteredCities(cities);
        } else {
            const filtered = cities.filter(city =>
                city.name.toLowerCase().includes(citySearch.toLowerCase())
            );
            setFilteredCities(filtered);
        }
    }, [citySearch, cities]);


    // Fetch actors, videos, banners based on applied filters
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Fetch Actors
                let apiUrl = `${BASE_URL}/api/getUserListBasedOnSubCat/${ACTOR_SUBCATEGORY_ID}`;
                if (appliedCountry) {
                    apiUrl += `/${appliedCountry}`;
                    if (appliedState) {
                        apiUrl += `/${appliedState}`;
                        if (appliedCity) { apiUrl += `/${appliedCity}`; }
                    }
                }

                const response = await fetch(apiUrl, { method: 'GET', headers: getAuthHeaders() });
                if (!response.ok) throw new Error(`Failed to fetch actors: ${response.status}`);
                const result = await response.json();

                if (result?.userList && Array.isArray(result.userList)) {
                    setUsers(result.userList);
                    setFilteredUsers(result.userList);
                } else {
                    setUsers([]);
                    setFilteredUsers([]);
                }

                if (result?.subcategoryName) {
                    const displayName = result.subcategoryName === 'Actors' ? 'Cast & Crew' : result.subcategoryName;
                    setPageInfo({ name: displayName, description: result.subcategoryDes || '' });
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

        fetchAll();
    }, [appliedCountry, appliedState, appliedCity]);

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

    // Handle country search input change
    const handleCountrySearchChange = (e) => {
        const value = e.target.value;
        setCountrySearch(value);
        setShowCountryDropdown(true);
    };

    // Handle country selection from dropdown
    const handleCountrySelect = (country) => {
        setSelectedCountry(country.id);
        setCountrySearch(country.name);
        setShowCountryDropdown(false);

        // Reset state and city
        setSelectedState('');
        setSelectedCity('');
        setStateSearch('');
        setCitySearch('');
        setStates([]);
        setCities([]);
    };

    // Handle state search input change
    const handleStateSearchChange = (e) => {
        const value = e.target.value;
        setStateSearch(value);
        setShowStateDropdown(true);
    };

    // Handle state selection from dropdown
    const handleStateSelect = (state) => {
        setSelectedState(state.id);
        setStateSearch(state.name);
        setShowStateDropdown(false);

        // Reset city
        setSelectedCity('');
        setCitySearch('');
        setCities([]);
    };

    // Handle city search input change
    const handleCitySearchChange = (e) => {
        const value = e.target.value;
        setCitySearch(value);
        setShowCityDropdown(true);
    };

    // Handle city selection from dropdown
    const handleCitySelect = (city) => {
        setSelectedCity(city.id);
        setCitySearch(city.name);
        setShowCityDropdown(false);
    };

    // Apply selected filters
    const handleApplyFilters = () => {
        setAppliedCountry(selectedCountry);
        setAppliedState(selectedState);
        setAppliedCity(selectedCity);
    };

    // Clear all filters
    const handleClearFilters = () => {
        // Clear selected filters
        setSelectedCountry('');
        setSelectedState('');
        setSelectedCity('');
        setCountrySearch('');
        setStateSearch('');
        setCitySearch('');
        setStates([]);
        setCities([]);
        setShowCountryDropdown(false);
        setShowStateDropdown(false);
        setShowCityDropdown(false);

        // Clear applied filters (this will trigger API to fetch all actors)
        setAppliedCountry('');
        setAppliedState('');
        setAppliedCity('');
    };

    // Loading state
    if (loading) {
        return (
            <div className="scu-page-wrapper">
                <div className="scu-loading-container">
                    <div className="scu-loading-spinner"></div>
                    <p>Loading expected users...</p>
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
                        <span className="scu-breadcrumb-current">{toTitleCase(pageInfo.name)}</span>
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

                        {/* Filter Row */}
                        <div className="scu-filter-row">
                            {/* Country */}
                            <div className="scu-filter-field">
                                <input
                                    type="text"
                                    className="scu-filter-input"
                                    placeholder={loadingCountries ? 'Loading...' : 'Country'}
                                    value={countrySearch}
                                    onChange={(e) => { setCountrySearch(e.target.value); setShowCountryDropdown(true); }}
                                    onFocus={() => setShowCountryDropdown(true)}
                                    disabled={loadingCountries}
                                />
                                {showCountryDropdown && filteredCountries.length > 0 && (
                                    <div className="scu-dropdown">
                                        {filteredCountries.map(c => (
                                            <div key={c.id} className="scu-dropdown-item" onClick={() => handleCountrySelect(c)}>{c.name}</div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* State */}
                            <div className="scu-filter-field">
                                <input
                                    type="text"
                                    className="scu-filter-input"
                                    placeholder={!selectedCountry ? 'Select Country First' : loadingStates ? 'Loading...' : 'State'}
                                    value={stateSearch}
                                    onChange={(e) => { setStateSearch(e.target.value); setShowStateDropdown(true); }}
                                    onFocus={() => setShowStateDropdown(true)}
                                    disabled={!selectedCountry || loadingStates}
                                />
                                {showStateDropdown && filteredStates.length > 0 && (
                                    <div className="scu-dropdown">
                                        {filteredStates.map(s => (
                                            <div key={s.id} className="scu-dropdown-item" onClick={() => handleStateSelect(s)}>{s.name}</div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* City */}
                            <div className="scu-filter-field">
                                <input
                                    type="text"
                                    className="scu-filter-input"
                                    placeholder={!selectedState ? 'Select State First' : loadingCities ? 'Loading...' : 'City'}
                                    value={citySearch}
                                    onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                                    onFocus={() => setShowCityDropdown(true)}
                                    disabled={!selectedState || loadingCities}
                                />
                                {showCityDropdown && filteredCities.length > 0 && (
                                    <div className="scu-dropdown">
                                        {filteredCities.map(c => (
                                            <div key={c.id} className="scu-dropdown-item" onClick={() => handleCitySelect(c)}>{c.name}</div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {(selectedCountry || selectedState || selectedCity) && (
                                <>
                                    <button className="scu-apply-btn" onClick={handleApplyFilters}>Apply</button>
                                    <button className="scu-clear-btn" onClick={handleClearFilters}>Clear</button>
                                </>
                            )}
                        </div>

                        {/* Users Grid */}
                        {filteredUsers.length === 0 ? (
                            <div className="scu-empty">
                                <p>{appliedCountry || appliedState || appliedCity ? 'No cast & crew matching filters' : 'No cast & crew found'}</p>
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


export default ActorsPage;
