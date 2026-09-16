import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatSubcategoryName, getSubcategoryLineCount, compareSubcategories } from '../../utils/textUtils';
import './index.css';

const CraftDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
    const CRAFT_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/cat-list';
    const BANNER_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/banners';

    // Get section data from navigation state
    const { categoryId, categoryName, categoryImage, sourcePage } = location.state || {};
    const isCastAndCrew = categoryId?.toString() === '13';

    // State management
    const [subcategories, setSubcategories] = useState([]);
    const [catImage, setCatImage] = useState(categoryImage || '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Helper: craft image URL
    const getCraftImageUrl = (imageName) => {
        if (!imageName) return null;
        if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
        return `${CRAFT_IMAGE_BASE_URL}/${imageName}`;
    };

    // Helper: banner image URL
    const getBannerImageUrl = (imageName) => {
        if (!imageName) return '';
        if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
        return `${BANNER_IMAGE_BASE_URL}/${imageName}`;
    };

    // Helper: YouTube embed URL
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

    // Fetch all data
    useEffect(() => {
        if (!categoryId || !categoryName) {
            navigate('/');
            return;
        }

        const fetchAll = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch subcategories
                // Mobile app: no ?only_display param for 24 crafts; only add ?only_display=rentals for category 22
                const rentalParam = String(categoryId) === '22' ? '?only_display=rentals' : '';
                const subcatResponse = await fetch(`${BASE_URL}/api/allSubCategoryList/${categoryId}${rentalParam}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });
                if (subcatResponse.ok) {
                    const subcatResult = await subcatResponse.json();
                    if (subcatResult?.categoryImage) {
                        setCatImage(subcatResult.categoryImage);
                    }
                    if (subcatResult?.subcategorylist && Array.isArray(subcatResult.subcategorylist)) {
                        setSubcategories(subcatResult.subcategorylist);
                    } else if (subcatResult?.data && Array.isArray(subcatResult.data)) {
                        setSubcategories(subcatResult.data);
                    } else if (Array.isArray(subcatResult)) {
                        setSubcategories(subcatResult);
                    }
                }

                // Fetch videos — category-specific: GET /api/podcast/category?id={catId}
                // Response: { status, count, data: [{ video_url, title, ... }] }
                try {
                    const videoResponse = await fetch(`${BASE_URL}/api/podcast/category?id=${categoryId}`, {
                        method: 'GET',
                        headers: getAuthHeaders()
                    });
                    if (videoResponse.ok) {
                        const videoResult = await videoResponse.json();
                        // API returns { data: [...] } key
                        const videoData = videoResult?.data || videoResult?.result || [];
                        if (Array.isArray(videoData) && videoData.length > 0) {
                            setVideos(videoData);
                            setSelectedVideo(videoData[0]);
                        } else {
                            // Fallback to /getpodcast (generic, same as mobile VideoSection)
                            const fb = await fetch(`${BASE_URL}/getpodcast`, { method: 'GET', headers: getAuthHeaders() });
                            if (fb.ok) {
                                const fbr = await fb.json();
                                const fbd = fbr?.result || fbr?.data || [];
                                if (Array.isArray(fbd) && fbd.length > 0) { setVideos(fbd); setSelectedVideo(fbd[0]); }
                            }
                        }
                    } else {
                        // API failed — fallback to /getpodcast
                        const fb = await fetch(`${BASE_URL}/getpodcast`, { method: 'GET', headers: getAuthHeaders() });
                        if (fb.ok) {
                            const fbr = await fb.json();
                            const fbd = fbr?.result || fbr?.data || [];
                            if (Array.isArray(fbd) && fbd.length > 0) { setVideos(fbd); setSelectedVideo(fbd[0]); }
                        }
                    }
                } catch (videoErr) {
                    /* console.warn('[Podcast] non-fatal:', videoErr.message); */
                }

                // Fetch banners
                const bannerResponse = await fetch(`${BASE_URL}/dash/getbanners/1`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });
                if (bannerResponse.ok) {
                    const bannerResult = await bannerResponse.json();
                    if (bannerResult?.banners && Array.isArray(bannerResult.banners)) {
                        setBannerData(bannerResult.banners);
                    } else if (Array.isArray(bannerResult)) {
                        setBannerData(bannerResult);
                    }
                }
            } catch (err) {
                /* console.error('Error fetching data:', err); */
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [categoryId, categoryName, navigate]);

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
        if (!videos.length) return;
        const idx = videoIndex > 0 ? videoIndex - 1 : videos.length - 1;
        setVideoIndex(idx);
        setSelectedVideo(videos[idx]);
    };

    const handleNextVideo = () => {
        if (!videos.length) return;
        const idx = videoIndex < videos.length - 1 ? videoIndex + 1 : 0;
        setVideoIndex(idx);
        setSelectedVideo(videos[idx]);
    };

    // Handle subcategory click
    const handleSubcategoryClick = (subcategory) => {
        navigate('/subcategory-users', {
            state: {
                subCategoryId: subcategory.id,
                subCategoryName: subcategory.sub_cat_name,
                categoryId: categoryId,       // pass catId so SubCategoryUsersPage can fetch subcategory podcast
                categoryName: categoryName,
                sourcePage: sourcePage
            }
        });
    };

    if (loading) {
        return (
            <div className="cdp-page-wrapper">
                <div className="cdp-loading-container">
                    <div className="cdp-loading-spinner"></div>
                    <p>Loading {categoryName}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cdp-page-wrapper">
            {/* ===== BREADCRUMB NAVIGATION ===== */}
            <div className="cdp-breadcrumb-header">
                <div className="cdp-breadcrumb-content">
                    <span className="cdp-back-arrow" onClick={() => navigate(-1)}>‹</span>
                    <h1 className="cdp-breadcrumb-title">
                        <span className="cdp-breadcrumb-link" onClick={() => {
                            if (sourcePage === '/') {
                                navigate('/', { state: { activeTab: '24crafts' } });
                            } else {
                                navigate(sourcePage || '/craft');
                            }
                        }}>24 Crafts</span>
                        <span className="cdp-breadcrumb-sep">&gt;</span>
                        <span className="cdp-breadcrumb-current">{toTitleCase(categoryName)}</span>
                    </h1>
                </div>
            </div>

            {/* ===== TWO-COLUMN LAYOUT ===== */}
            <div className="cdp-two-column-layout">

                {/* LEFT COLUMN — Video + Banners */}
                <div className="cdp-left-column">
                    <div className="cdp-video-container">
                        {selectedVideo ? (
                            <iframe
                                key={`${selectedVideo.id}-${isMuted}`}
                                src={convertToEmbedUrl(selectedVideo.video_url, isMuted)}
                                title={selectedVideo.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="cdp-video-iframe"
                            />
                        ) : (
                            <div className="cdp-video-placeholder">
                                <span>No Video Available</span>
                            </div>
                        )}
                        {videos.length > 1 && (
                            <>
                                <button className="cdp-video-nav cdp-video-nav-left" onClick={handlePrevVideo}>‹</button>
                                <button className="cdp-video-nav cdp-video-nav-right" onClick={handleNextVideo}>›</button>
                            </>
                        )}
                    </div>

                    {bannerData.length > 0 && (
                        <div className="cdp-banner-strip" ref={bannerStripRef}>
                            {bannerData.map((banner, index) => {
                                const imgSrc = getBannerImageUrl(banner?.banner_img || banner?.image || banner?.banner_image || banner?.url);
                                return (
                                    <div key={`banner-${index}`} className="cdp-banner-card">
                                        <img
                                            src={imgSrc}
                                            alt={banner?.title || `Banner ${index + 1}`}
                                            className="cdp-banner-img"
                                            onError={(e) => { e.target.style.opacity = '0.3'; }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN — Subcategory Cards with Images */}
                <div className="cdp-right-column">
                    <div className="cdp-subcategories-card">
                        {subcategories.length > 0 ? (
                            <div className="cdp-subcategories-grid">
                                {[...subcategories]
                                    .sort((a, b) => compareSubcategories(a, b, 'sub_cat_name'))
                                    .map((subcategory, index) => (
                                        <motion.div
                                            key={subcategory.id || index}
                                            className="cdp-subcategory-item"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            whileHover={{ scale: 1.03 }}
                                            onClick={() => handleSubcategoryClick(subcategory)}
                                        >
                                            <div className="cdp-subcategory-icon-wrap">
                                                <img
                                                    src={isCastAndCrew ? (getCraftImageUrl(catImage) || 'https://placehold.co/60x60?text=Cast+%26+Crew') : (getCraftImageUrl(subcategory.sub_picture) || getCraftImageUrl(catImage) || 'https://placehold.co/60x60?text=Icon')}
                                                    alt={subcategory.sub_cat_name}
                                                    className="cdp-subcategory-icon"
                                                    onError={(e) => {
                                                        if (catImage && e.target.src !== getCraftImageUrl(catImage)) {
                                                            e.target.src = getCraftImageUrl(catImage);
                                                        } else {
                                                            e.target.src = 'https://placehold.co/60x60?text=Icon';
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <p className="cdp-subcategory-name">{formatSubcategoryName(subcategory.sub_cat_name)}</p>
                                        </motion.div>
                                    ))}
                            </div>
                        ) : (
                            <div className="cdp-no-subcategories">
                                <p>No subcategories available for {categoryName}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CraftDetailPage;
