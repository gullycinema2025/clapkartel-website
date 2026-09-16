import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './index.css';

const InnerDataPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
    const BANNER_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/banners';

    // Get data from navigation state
    const { innerId, catName, serviceName, sourcePage } = location.state || {};

    // State management
    const [innerItems, setInnerItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Default fallback video when backend has not uploaded videos yet
    const DEFAULT_FALLBACK_VIDEOS = [
        {
            id: 'default-podcast-1',
            title: 'Clap Kartel - Cinema Insights',
            video_url: 'https://www.youtube.com/watch?v=qtUIxjJDZK0'
        }
    ];

    // Video state
    const [videos, setVideos] = useState(DEFAULT_FALLBACK_VIDEOS);
    const [selectedVideo, setSelectedVideo] = useState(DEFAULT_FALLBACK_VIDEOS[0]);
    const [videoIndex, setVideoIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);

    // Banner state
    const [bannerData, setBannerData] = useState([]);
    const bannerStripRef = useRef(null);

    // Helper function to get authorization headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Helper to get banner image URL
    const getBannerImageUrl = (imageName) => {
        if (!imageName) return '';
        if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
        return `${BANNER_IMAGE_BASE_URL}/${imageName}`;
    };

    // Helper to convert YouTube URL to embed URL
    const convertToEmbedUrl = (url, muted = true) => {
        if (!url) return '';
        const muteParam = muted ? '1' : '0';
        if (url.includes('youtube.com/embed/')) {
            const base = url.split('?')[0];
            return `${base}?autoplay=1&mute=${muteParam}&controls=1&modestbranding=1&rel=0`;
        }
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&?/\s]+)/);
        if (videoIdMatch && videoIdMatch[1]) {
            return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&mute=${muteParam}&controls=1&modestbranding=1&rel=0`;
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

    // Fetch inner data + videos + banners on mount
    useEffect(() => {
        if (!innerId) {
            navigate('/other-section');
            return;
        }

        const fetchAll = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch inner list items
                const innerResponse = await fetch(`${BASE_URL}/api/get-inner-list/${innerId}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });
                if (innerResponse.ok) {
                    const innerResult = await innerResponse.json();
                    let foundItems = [];
                    if (innerResult?.data && Array.isArray(innerResult.data)) {
                        foundItems = innerResult.data;
                    } else if (Array.isArray(innerResult)) {
                        foundItems = innerResult;
                    }
                    setInnerItems(foundItems);
                }

                // Fetch videos — subcategory podcast matching backend /api/podcast/subcategory
                try {
                    let foundVideos = [];

                    // 1. Try /api/podcast/subcategory?cat_id=22&sub_cat_id=${innerId}
                    try {
                        const vRes = await fetch(`${BASE_URL}/api/podcast/subcategory?cat_id=22&sub_cat_id=${innerId}`, {
                            method: 'GET', headers: getAuthHeaders()
                        });
                        if (vRes.ok) {
                            const vResult = await vRes.json();
                            const vData = vResult?.data || vResult?.result || [];
                            const valid = Array.isArray(vData) ? vData.filter(v => v && (v.video_url || v.url)) : [];
                            if (valid.length > 0) foundVideos = valid;
                        }
                    } catch (e1) {
                        /* console.warn('[Podcast] error with cat_id 22:', e1); */
                    }

                    // 2. Try cat_id 23
                    if (foundVideos.length === 0) {
                        try {
                            const vRes = await fetch(`${BASE_URL}/api/podcast/subcategory?cat_id=23&sub_cat_id=${innerId}`, {
                                method: 'GET', headers: getAuthHeaders()
                            });
                            if (vRes.ok) {
                                const vResult = await vRes.json();
                                const vData = vResult?.data || vResult?.result || [];
                                const valid = Array.isArray(vData) ? vData.filter(v => v && (v.video_url || v.url)) : [];
                                if (valid.length > 0) foundVideos = valid;
                            }
                        } catch (e2) {
                            /* console.warn('[Podcast] error with cat_id 23:', e2); */
                        }
                    }

                    // 3. Check /getpodcast filtering by matching sub_cat_id or innerId
                    if (foundVideos.length === 0) {
                        try {
                            const fbRes = await fetch(`${BASE_URL}/getpodcast`, { method: 'GET', headers: getAuthHeaders() });
                            if (fbRes.ok) {
                                const fbResult = await fbRes.json();
                                const allPodcasts = fbResult?.result || fbResult?.data || [];
                                const matched = allPodcasts.filter(v =>
                                    v && (v.video_url || v.url) && (
                                        String(v.sub_cat_id) === String(innerId) ||
                                        (String(v.cat_id) === String(innerId) && v.sub_cat_id === '0') ||
                                        (catName && v.title && v.title.toLowerCase().includes(catName.toLowerCase()))
                                    )
                                );
                                if (matched.length > 0) {
                                    foundVideos = matched;
                                } else {
                                    const allValid = allPodcasts.filter(v => v && (v.video_url || v.url));
                                    if (allValid.length > 0) foundVideos = allValid;
                                }
                            }
                        } catch (e3) {
                            /* console.warn('[Podcast] error with /getpodcast:', e3); */
                        }
                    }

                    if (foundVideos.length > 0) {
                        setVideos(foundVideos);
                        setSelectedVideo(foundVideos[0]);
                    } else {
                        setVideos(DEFAULT_FALLBACK_VIDEOS);
                        setSelectedVideo(DEFAULT_FALLBACK_VIDEOS[0]);
                    }
                } catch (ve) {
                    /* console.warn('[Podcast] non-fatal:', ve.message); */
                    setVideos(DEFAULT_FALLBACK_VIDEOS);
                    setSelectedVideo(DEFAULT_FALLBACK_VIDEOS[0]);
                }

                // Fetch banners (Category menu_id=2)
                const bannerResponse = await fetch(`${BASE_URL}/dash/getbanners/2`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });
                if (bannerResponse.ok) {
                    const bannerResult = await bannerResponse.json();
                    if (bannerResult?.banners && Array.isArray(bannerResult.banners)) {
                        setBannerData(bannerResult.banners.filter(b => b.status === '1' || b.status === 1));
                    } else if (Array.isArray(bannerResult)) {
                        setBannerData(bannerResult);
                    }
                }

            } catch (err) {
                /* console.error('Error fetching inner data:', err); */
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [innerId, navigate]);

    // Banner auto-scroll
    useEffect(() => {
        if (bannerData.length === 0) return;
        const interval = setInterval(() => {
            if (bannerStripRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = bannerStripRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    bannerStripRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    bannerStripRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                }
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [bannerData]);

    // Handle video navigation
    const handlePrevVideo = () => {
        if (videos.length === 0) return;
        const newIndex = videoIndex > 0 ? videoIndex - 1 : videos.length - 1;
        setVideoIndex(newIndex);
        setSelectedVideo(videos[newIndex]);
    };

    const handleNextVideo = () => {
        if (videos.length === 0) return;
        const newIndex = videoIndex < videos.length - 1 ? videoIndex + 1 : 0;
        setVideoIndex(newIndex);
        setSelectedVideo(videos[newIndex]);
    };

    // Handle inner item click → go to content page
    const handleItemClick = (item) => {
        navigate('/other-section-content', {
            state: {
                subcatId: item.id,
                innerdata: 'true',
                categoryName: item.title_name,
                serviceName: serviceName || '',
                catName: catName || '',
                innerCatName: item.title_name,
                sourcePage: sourcePage
            }
        });
    };

    if (loading) {
        return (
            <div className="idp-page-wrapper">
                <div className="idp-loading-container">
                    <div className="idp-loading-spinner"></div>
                    <p>Loading {catName}...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="idp-page-wrapper">
                <div className="idp-loading-container">
                    <p style={{ color: '#e74c3c' }}>Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="idp-page-wrapper">
            {/* ===== BREADCRUMB NAVIGATION ===== */}
            <div className="idp-breadcrumb-header">
                <div className="idp-breadcrumb-content">
                    <span className="idp-back-arrow" onClick={() => navigate(-1)}>‹</span>
                    <h1 className="idp-breadcrumb-title">
                        <span className="idp-breadcrumb-link" onClick={() => {
                            if (sourcePage === '/') {
                                navigate('/', { state: { activeTab: 'other' } });
                            } else {
                                navigate(sourcePage || '/other-section');
                            }
                        }}>
                            Other Sections
                        </span>
                        {serviceName && serviceName.trim() !== '' && (
                            <>
                                <span className="idp-breadcrumb-sep">&gt;</span>
                                <span className="idp-breadcrumb-link" onClick={() => navigate(-1)}>
                                    {toTitleCase(serviceName)}
                                </span>
                            </>
                        )}
                        {catName && catName.trim() !== '' && (
                            <>
                                <span className="idp-breadcrumb-sep">&gt;</span>
                                <span className="idp-breadcrumb-current">{toTitleCase(catName)}</span>
                            </>
                        )}
                    </h1>
                </div>
            </div>

            {/* ===== TWO-COLUMN LAYOUT ===== */}
            <div className="idp-two-column-layout">

                {/* LEFT COLUMN — Video + Banners */}
                <div className="idp-left-column">
                    {/* Video Player */}
                    <div className="idp-video-container">
                        {selectedVideo && (selectedVideo.video_url || selectedVideo.url) ? (
                            <iframe
                                key={`${selectedVideo.id || 'vid'}-${isMuted}`}
                                src={convertToEmbedUrl(selectedVideo.video_url || selectedVideo.url, isMuted)}
                                title={selectedVideo.title || "Clap Kartel Video"}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="idp-video-iframe"
                            />
                        ) : (
                            <iframe
                                key={`default-fallback-${isMuted}`}
                                src={convertToEmbedUrl(DEFAULT_FALLBACK_VIDEOS[0].video_url, isMuted)}
                                title={DEFAULT_FALLBACK_VIDEOS[0].title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="idp-video-iframe"
                            />
                        )}
                        {videos.length > 1 && (
                            <>
                                <button className="idp-video-nav idp-video-nav-left" onClick={handlePrevVideo}>‹</button>
                                <button className="idp-video-nav idp-video-nav-right" onClick={handleNextVideo}>›</button>
                            </>
                        )}
                    </div>

                    {/* Banner Strip */}
                    {bannerData.length > 0 && (
                        <div className="idp-banner-strip" ref={bannerStripRef}>
                            {bannerData.map((banner, index) => {
                                const imgSrc = getBannerImageUrl(banner?.banner_img || banner?.image || banner?.banner_image || banner?.url);
                                return (
                                    <div key={`banner-${index}`} className="idp-banner-card">
                                        <img
                                            src={imgSrc}
                                            alt={banner?.title || `Banner ${index + 1}`}
                                            className="idp-banner-img"
                                            onError={(e) => { e.target.style.opacity = '0.3'; }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN — Inner Item Cards */}
                <div className="idp-right-column">
                    <div className="idp-categories-card">
                        {innerItems.length > 0 ? (
                            <div className="idp-category-grid">
                                {innerItems.map((item, index) => {
                                    const itemName = (item.title_name || item.content_title || item.name || '').trim();
                                    const displayItemName = itemName ? itemName.toUpperCase() : 'CATEGORY';

                                    return (
                                        <motion.div
                                            key={item.id || index}
                                            className="idp-category-item"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <span className="idp-category-name">
                                                {displayItemName}
                                            </span>
                                            <span className="idp-category-arrow">&gt;</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="idp-no-items">
                                <p>No categories found for {catName}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InnerDataPage;
