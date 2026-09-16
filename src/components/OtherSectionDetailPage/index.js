import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { compareSubcategories } from '../../utils/textUtils';
import './index.css';

const OtherSectionDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
    const CRAFT_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/cat-list';
    const BANNER_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/banners';

    // Get section data from navigation state
    const { sectionId, sectionName, sectionImage, sourcePage, mainCatId } = location.state || {};

    // State management
    const [categories, setCategories] = useState([]);
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

    // Helper function to get image URL
    const getImageUrl = (imageName) => {
        if (!imageName) return null;
        if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
            return imageName;
        }
        return `${CRAFT_IMAGE_BASE_URL}/${imageName}`;
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

    // Helper to get YouTube thumbnail
    const getYouTubeThumbnail = (url) => {
        if (!url) return null;
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&?/\s]+)/);
        if (videoIdMatch && videoIdMatch[1]) {
            return `https://img.youtube.com/vi/${videoIdMatch[1]}/hqdefault.jpg`;
        }
        return null;
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

    // Fetch categories + videos + banners on mount
    useEffect(() => {
        if (!sectionId || !sectionName) {
            navigate('/other-section');
            return;
        }

        const fetchAll = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch categories
                const catResponse = await fetch(`${BASE_URL}/api/get-other-categories/${sectionId}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });
                if (catResponse.ok) {
                    const catResult = await catResponse.json();
                    let foundCategories = [];
                    if (catResult?.crafts241 && Array.isArray(catResult.crafts241)) {
                        foundCategories = catResult.crafts241;
                    } else if (catResult?.data && Array.isArray(catResult.data)) {
                        foundCategories = catResult.data;
                    } else if (catResult?.categories && Array.isArray(catResult.categories)) {
                        foundCategories = catResult.categories;
                    } else if (Array.isArray(catResult)) {
                        foundCategories = catResult;
                    }
                    setCategories(foundCategories);
                }

                // Fetch videos — subcategory podcast matching backend /api/podcast/subcategory
                try {
                    const effectiveCatId = mainCatId || '23';
                    let foundVideos = [];

                    // 1. Try /api/podcast/subcategory?cat_id=${effectiveCatId}&sub_cat_id=${sectionId}
                    try {
                        const vRes = await fetch(`${BASE_URL}/api/podcast/subcategory?cat_id=${effectiveCatId}&sub_cat_id=${sectionId}`, {
                            method: 'GET',
                            headers: getAuthHeaders()
                        });
                        if (vRes.ok) {
                            const vResult = await vRes.json();
                            const vData = vResult?.data || vResult?.result || [];
                            const valid = Array.isArray(vData) ? vData.filter(v => v && (v.video_url || v.url)) : [];
                            if (valid.length > 0) foundVideos = valid;
                        }
                    } catch (e1) {
                        console.warn('[Podcast] error with main cat_id:', e1);
                    }

                    // 2. If not found, try alternative cat_id (22 vs 23)
                    if (foundVideos.length === 0) {
                        const altCatId = effectiveCatId === '23' ? '22' : '23';
                        try {
                            const vRes = await fetch(`${BASE_URL}/api/podcast/subcategory?cat_id=${altCatId}&sub_cat_id=${sectionId}`, {
                                method: 'GET',
                                headers: getAuthHeaders()
                            });
                            if (vRes.ok) {
                                const vResult = await vRes.json();
                                const vData = vResult?.data || vResult?.result || [];
                                const valid = Array.isArray(vData) ? vData.filter(v => v && (v.video_url || v.url)) : [];
                                if (valid.length > 0) foundVideos = valid;
                            }
                        } catch (e2) {
                            console.warn('[Podcast] error with alt cat_id:', e2);
                        }
                    }

                    // 3. If still not found, check /getpodcast filtering by matching sub_cat_id or cat_id or section name
                    if (foundVideos.length === 0) {
                        try {
                            const fbRes = await fetch(`${BASE_URL}/getpodcast`, { method: 'GET', headers: getAuthHeaders() });
                            if (fbRes.ok) {
                                const fbResult = await fbRes.json();
                                const allPodcasts = fbResult?.result || fbResult?.data || [];
                                const matched = allPodcasts.filter(v =>
                                    v && (v.video_url || v.url) && (
                                        String(v.sub_cat_id) === String(sectionId) ||
                                        (String(v.cat_id) === String(sectionId) && v.sub_cat_id === '0') ||
                                        (sectionName && v.title && v.title.toLowerCase().includes(sectionName.toLowerCase()))
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
                            console.warn('[Podcast] error with /getpodcast:', e3);
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
                    console.warn('[Podcast] non-fatal:', ve.message);
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
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [sectionId, sectionName, navigate]);

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

    // Handle category row click
    const handleCategoryClick = (category) => {
        const innerDataValue = parseInt(category.innerData, 10);

        if (innerDataValue === 0) {
            navigate('/other-section-content', {
                state: {
                    subcatId: category.otherid,
                    innerdata: 'false',
                    categoryName: category.cat_name,
                    serviceName: sectionName,
                    catName: category.cat_name,
                    innerCatName: '',
                    sourcePage: sourcePage
                }
            });
        } else {
            navigate('/inner-data', {
                state: {
                    innerId: category.otherid,
                    catName: category.cat_name,
                    serviceName: sectionName,
                    sourcePage: sourcePage
                }
            });
        }
    };

    if (loading) {
        return (
            <div className="osd-page-wrapper">
                <div className="osd-loading-container">
                    <div className="osd-loading-spinner"></div>
                    <p>Loading {sectionName}...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="osd-page-wrapper">
                <div className="osd-loading-container">
                    <p style={{ color: '#e74c3c' }}>Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="osd-page-wrapper">
            {/* ===== BREADCRUMB NAVIGATION ===== */}
            <div className="osd-breadcrumb-header">
                <div className="osd-breadcrumb-content">
                    <span className="osd-back-arrow" onClick={() => navigate(-1)}>‹</span>
                    <h1 className="osd-breadcrumb-title">
                        <span className="osd-breadcrumb-link" onClick={() => {
                            if (sourcePage === '/') {
                                navigate('/', { state: { activeTab: 'other' } });
                            } else {
                                navigate(sourcePage || '/other-section');
                            }
                        }}>Other Sections</span>
                        <span className="osd-breadcrumb-sep">&gt;</span>
                        <span className="osd-breadcrumb-current">{toTitleCase(sectionName)}</span>
                    </h1>
                </div>
            </div>

            {/* ===== TWO-COLUMN LAYOUT ===== */}
            <div className="osd-two-column-layout">

                {/* LEFT COLUMN — Video + Banners */}
                <div className="osd-left-column">
                    {/* Video Carousel */}
                    <div className="osd-video-container">
                        {selectedVideo && (selectedVideo.video_url || selectedVideo.url) ? (
                            <iframe
                                key={`${selectedVideo.id || 'vid'}-${isMuted}`}
                                src={convertToEmbedUrl(selectedVideo.video_url || selectedVideo.url, isMuted)}
                                title={selectedVideo.title || "Clap Kartel Video"}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="osd-video-iframe"
                            />
                        ) : (
                            <iframe
                                key={`default-fallback-${isMuted}`}
                                src={convertToEmbedUrl(DEFAULT_FALLBACK_VIDEOS[0].video_url, isMuted)}
                                title={DEFAULT_FALLBACK_VIDEOS[0].title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="osd-video-iframe"
                            />
                        )}
                        {videos.length > 1 && (
                            <>
                                <button className="osd-video-nav osd-video-nav-left" onClick={handlePrevVideo}>‹</button>
                                <button className="osd-video-nav osd-video-nav-right" onClick={handleNextVideo}>›</button>
                            </>
                        )}
                    </div>

                    {/* Banner Strip */}
                    {bannerData.length > 0 && (
                        <div className="osd-banner-strip" ref={bannerStripRef}>
                            {bannerData.map((banner, index) => {
                                const imgSrc = getBannerImageUrl(banner?.banner_img || banner?.image || banner?.banner_image || banner?.url);
                                return (
                                    <div key={`banner-${index}`} className="osd-banner-card">
                                        <img
                                            src={imgSrc}
                                            alt={banner?.title || `Banner ${index + 1}`}
                                            className="osd-banner-img"
                                            onError={(e) => { e.target.style.opacity = '0.3'; }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN — Category Cards */}
                <div className="osd-right-column">
                    <div className="osd-categories-card">
                        {categories.length > 0 ? (
                            <div className="osd-category-grid">
                                {[...categories]
                                    .sort((a, b) => compareSubcategories(a, b, 'cat_name'))
                                    .map((category, index) => {
                                        const catTitle = (category.cat_name || category.title_name || category.name || category.category_name || category.title || '').trim();
                                        const displayCatName = catTitle ? catTitle.toUpperCase() : 'CATEGORY';

                                        return (
                                            <motion.div
                                                key={`${index}_${category.id || index}`}
                                                className="osd-category-item"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => handleCategoryClick(category)}
                                            >
                                                <span className="osd-category-name">
                                                    {displayCatName}
                                                </span>
                                                <span className="osd-category-arrow">&gt;</span>
                                            </motion.div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <div className="osd-no-categories">
                                <p>No categories available for {sectionName}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtherSectionDetailPage;
