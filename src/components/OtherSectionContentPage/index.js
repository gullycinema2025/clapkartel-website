import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.css';

const OtherSectionContentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
    const BANNER_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/banners';

    // Get data from navigation state — supports both old and new navigation format
    const {
        categoryId,
        otherId,
        categoryName,
        subcatId,
        innerdata,
        serviceName,
        catName,
        innerCatName,
        sourcePage
    } = location.state || {};

    // Determine which ID to use for API call — subcatId takes priority
    const contentId = subcatId || otherId || categoryId;

    // Is this coming from InnerDataPage? Use a different API endpoint
    const isInnerData = innerdata === 'true';

    // Build display name for breadcrumb
    const displayName = innerCatName || catName || categoryName || 'Content';

    // State for content items
    const [contentItems, setContentItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFallbackList, setIsFallbackList] = useState(false);

    // Default fallback video when backend has not uploaded videos yet
    const DEFAULT_FALLBACK_VIDEOS = [
        {
            id: 'default-podcast-1',
            title: 'Clap Kartel - Cinema Insights',
            video_url: 'https://www.youtube.com/watch?v=qtUIxjJDZK0'
        }
    ];

    // Video (podcast) state
    const [videos, setVideos] = useState(DEFAULT_FALLBACK_VIDEOS);
    const [selectedVideo, setSelectedVideo] = useState(DEFAULT_FALLBACK_VIDEOS[0]);
    const [videoIndex, setVideoIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);

    // New state for inline playback of a specific clicked media item
    const [inlineVideo, setInlineVideo] = useState(null);

    // Console log selected/clicked item whenever it changes
    useEffect(() => {
        if (inlineVideo) {
            /* console.log('=== [OtherSectionContent] CLICKED ITEM / CURRENT DETAILS DATA ===', inlineVideo); */
        }
    }, [inlineVideo]);

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

    // Helper: content image URL
    const getContentImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
        return `${BASE_URL}/${imagePath}`;
    };

    // Helper: banner image URL
    const getBannerImageUrl = (imageName) => {
        if (!imageName) return '';
        if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
        return `${BANNER_IMAGE_BASE_URL}/${imageName}`;
    };

    // Helper: convert YouTube URL to embed
    const convertToEmbedUrl = (url, muted = true) => {
        if (!url) return '';
        const muteParam = muted ? '1' : '0';
        if (url.includes('youtube.com/embed/')) {
            const base = url.split('?')[0];
            return `${base}?autoplay=1&mute=${muteParam}&controls=1&modestbranding=1&rel=0`;
        }
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&?/\s]+)/);
        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=${muteParam}&controls=1&modestbranding=1&rel=0`;
        }
        return url;
    };

    // Helper: get YouTube thumbnail
    const getYouTubeThumbnail = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&?/\s]+)/);
        if (match && match[1]) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        return null;
    };

    // Helper: is YouTube link?
    const isYouTubeLink = (url) => {
        if (!url) return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    // Helper: to title case
    const toTitleCase = (text) => {
        if (!text) return '';
        return text.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    // Helper: get file type
    const getFileType = (filePath) => {
        if (!filePath) return null;
        const ext = filePath.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
        if (['pdf'].includes(ext)) return 'pdf';
        return 'file';
    };

    // Fetch all data
    useEffect(() => {
        if (!contentId) {
            setLoading(false);
            return;
        }

        const fetchAll = async () => {
            try {
                setLoading(true);
                setError(null);
                setIsFallbackList(false);

                // Fetch content items
                const apiUrl = isInnerData
                    ? `${BASE_URL}/api/innercontent/${contentId}`
                    : `${BASE_URL}/api/content/${contentId}`;

                const response = await fetch(apiUrl, { method: 'GET', headers: getAuthHeaders() });
                if (!response.ok) throw new Error(`Failed to fetch content: ${response.status}`);
                const result = await response.json();

                /* console.log('=== [OtherSectionContent] RAW API RESPONSE ===', result); */

                let items = [];
                if (result?.content && Array.isArray(result.content)) {
                    items = result.content;
                } else if (result?.data && Array.isArray(result.data)) {
                    items = result.data;
                } else if (Array.isArray(result)) {
                    items = result;
                }

                /* console.log('=== [OtherSectionContent] EXTRACTED CONTENT ITEMS ===', items); */

                // Fallback: if empty try get-inner-list
                if (items.length === 0 && !isInnerData) {
                    const fallbackUrl = `${BASE_URL}/api/get-inner-list/${contentId}`;
                    const fallbackResponse = await fetch(fallbackUrl, { method: 'GET', headers: getAuthHeaders() });
                    if (fallbackResponse.ok) {
                        const fallbackResult = await fallbackResponse.json();
                        /* console.log('=== [OtherSectionContent] FALLBACK GET-INNER-LIST RESPONSE ===', fallbackResult); */
                        if (fallbackResult?.data && Array.isArray(fallbackResult.data)) {
                            items = fallbackResult.data.map(item => ({
                                ...item,
                                content_title: item.content_title || item.title_name || ''
                            }));
                        } else if (Array.isArray(fallbackResult)) {
                            items = fallbackResult.map(item => ({
                                ...item,
                                content_title: item.content_title || item.title_name || ''
                            }));
                        }
                        if (items.length > 0) setIsFallbackList(true);
                    }
                }

                setContentItems(items);

                // Fetch videos — subcategory podcast matching backend /api/podcast/subcategory
                try {
                    const effectiveCatId = location.state?.mainCatId || '23';
                    let foundVideos = [];

                    // 1. Try /api/podcast/subcategory?cat_id=${effectiveCatId}&sub_cat_id=${contentId}
                    try {
                        const vRes = await fetch(`${BASE_URL}/api/podcast/subcategory?cat_id=${effectiveCatId}&sub_cat_id=${contentId}`, {
                            method: 'GET', headers: getAuthHeaders()
                        });
                        if (vRes.ok) {
                            const vResult = await vRes.json();
                            const vData = vResult?.data || vResult?.result || [];
                            const valid = Array.isArray(vData) ? vData.filter(v => v && (v.video_url || v.url)) : [];
                            if (valid.length > 0) foundVideos = valid;
                        }
                    } catch (e1) {
                        /* console.warn('[Podcast] error with main cat_id:', e1); */
                    }

                    // 2. Try alternate cat_id
                    if (foundVideos.length === 0) {
                        const altCatId = effectiveCatId === '23' ? '22' : '23';
                        try {
                            const vRes = await fetch(`${BASE_URL}/api/podcast/subcategory?cat_id=${altCatId}&sub_cat_id=${contentId}`, {
                                method: 'GET', headers: getAuthHeaders()
                            });
                            if (vRes.ok) {
                                const vResult = await vRes.json();
                                const vData = vResult?.data || vResult?.result || [];
                                const valid = Array.isArray(vData) ? vData.filter(v => v && (v.video_url || v.url)) : [];
                                if (valid.length > 0) foundVideos = valid;
                            }
                        } catch (e2) {
                            /* console.warn('[Podcast] error with alt cat_id:', e2); */
                        }
                    }

                    // 3. Check /getpodcast filtering by matching sub_cat_id or contentId
                    if (foundVideos.length === 0) {
                        try {
                            const fbRes = await fetch(`${BASE_URL}/getpodcast`, { method: 'GET', headers: getAuthHeaders() });
                            if (fbRes.ok) {
                                const fbResult = await fbRes.json();
                                const allPodcasts = fbResult?.result || fbResult?.data || [];
                                const matched = allPodcasts.filter(v =>
                                    v && (v.video_url || v.url) && (
                                        String(v.sub_cat_id) === String(contentId) ||
                                        (String(v.cat_id) === String(contentId) && v.sub_cat_id === '0') ||
                                        (displayName && v.title && v.title.toLowerCase().includes(displayName.toLowerCase()))
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
                /* console.error('Error:', err); */
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [contentId, navigate]);

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

    // Video nav
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

    // Fallback list item click
    const handleFallbackItemClick = (item) => {
        navigate('/other-section-content', {
            state: {
                subcatId: item.id,
                innerdata: 'true',
                categoryName: item.title_name || item.content_title,
                serviceName,
                innerCatName: item.title_name || item.content_title
            }
        });
    };

    if (loading) {
        return (
            <div className="oscp-page-wrapper">
                <div className="oscp-loading-container">
                    <div className="oscp-loading-spinner"></div>
                    <p>Loading {displayName}...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="oscp-page-wrapper">
                <div className="oscp-loading-container">
                    <p style={{ color: '#e74c3c' }}>Error: {error}</p>
                    <button className="oscp-back-btn" onClick={() => navigate(-1)}>← Go Back</button>
                </div>
            </div>
        );
    }

    // Helper: navigate back to the correct source page
    const handleGoBack = () => {
        if (sourcePage === '/') {
            navigate('/', { state: { activeTab: 'other' } });
        } else {
            navigate(sourcePage || '/other-section');
        }
    };

    if (contentItems.length === 0) {
        return (
            <div className="oscp-page-wrapper">
                {/* Breadcrumb even on empty state */}
                <div className="oscp-breadcrumb-header">
                    <div className="oscp-breadcrumb-content">
                        <span className="oscp-back-arrow" onClick={handleGoBack}>‹</span>
                        <h1 className="oscp-breadcrumb-title">
                            <span className="oscp-breadcrumb-link" onClick={handleGoBack}>Other Sections</span>
                            {serviceName && serviceName.trim() !== '' && (
                                <>
                                    <span className="oscp-breadcrumb-sep">&gt;</span>
                                    <span className="oscp-breadcrumb-link" onClick={handleGoBack}>
                                        {toTitleCase(serviceName)}
                                    </span>
                                </>
                            )}
                            {catName && catName.trim() !== '' && (
                                <>
                                    <span className="oscp-breadcrumb-sep">&gt;</span>
                                    <span className="oscp-breadcrumb-current">{catName.toUpperCase()}</span>
                                </>
                            )}
                        </h1>
                    </div>
                </div>
                <div className="oscp-loading-container" style={{ flexDirection: 'column', gap: '16px', paddingTop: '60px' }}>
                    <div style={{ fontSize: '48px' }}>📋</div>
                    <p style={{ color: '#333', fontWeight: '600', fontSize: '16px', margin: 0 }}>
                        {displayName || catName || 'This section'} — Coming Soon
                    </p>
                    <p style={{ color: '#888', fontSize: '14px', margin: 0, maxWidth: '280px', textAlign: 'center', lineHeight: 1.5 }}>
                        Content for this category is being prepared. Please check back later.
                    </p>
                    <button className="oscp-back-btn" onClick={handleGoBack}>← Go Back</button>
                </div>
            </div>
        );
    }

    // Detail View (matches mobile OtherSectionDetail)
    if (inlineVideo) {
        const titleText = inlineVideo.content_title || inlineVideo.title_name || inlineVideo.title || 'Details';
        const descriptionText = inlineVideo.content_text || inlineVideo.content_description || inlineVideo.description || inlineVideo.about || inlineVideo.details || inlineVideo.content_desc || inlineVideo.content || inlineVideo.desc || '';
        const linkUrl = inlineVideo.link_url || '';
        const hasYoutube = isYouTubeLink(linkUrl) || isYouTubeLink(inlineVideo.video_url);
        const youtubeUrl = isYouTubeLink(linkUrl) ? linkUrl : inlineVideo.video_url;
        const image = inlineVideo.content_image || inlineVideo.image || '';
        const hasImage = Boolean(image);
        const attachment = inlineVideo.content_attached_file || '';
        const attachmentTwo = inlineVideo.content_attached_file_two || '';

        return (
            <div className="oscp-page-wrapper" style={{ background: '#f2f2f2', minHeight: '100vh', padding: 0 }}>
                {/* Header for Detail View */}
                <div style={{ width: '100%', borderBottom: '1px solid #d1d5db', padding: '15px 24px', display: 'flex', alignItems: 'center', gap: '14px', background: '#f2f2f2', boxSizing: 'border-box' }}>
                    <span
                        style={{ fontSize: '30px', cursor: 'pointer', fontWeight: 'bold', lineHeight: 1, userSelect: 'none', color: '#000' }}
                        onClick={() => setInlineVideo(null)}
                    >
                        ‹
                    </span>
                    <h2 style={{ fontSize: '19px', margin: 0, fontWeight: '700', color: '#000', fontFamily: 'SF Pro Display, Sen, sans-serif' }}>
                        Details
                    </h2>
                </div>

                {/* Detail Content Card */}
                <div style={{ width: '100%', maxWidth: '780px', margin: '30px auto', padding: '0 20px', boxSizing: 'border-box' }}>
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 18px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '18px' }}>

                        {/* Top Media Section */}
                        {hasYoutube ? (
                            <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                <iframe
                                    src={convertToEmbedUrl(youtubeUrl, false)}
                                    title={titleText}
                                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : hasImage ? (
                            <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#f0f0f0', maxHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img
                                    src={getContentImageUrl(image)}
                                    alt={titleText}
                                    style={{ width: '100%', height: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        ) : attachment ? (
                            <a
                                href={getContentImageUrl(attachment)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    height: '120px',
                                    width: '100%',
                                    borderRadius: '16px',
                                    backgroundColor: '#eff6ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    textDecoration: 'none',
                                    color: '#2563eb',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    border: '1px solid #bfdbfe',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <span style={{ fontSize: '32px' }}>📄</span>
                                <span>Open Document</span>
                            </a>
                        ) : null}

                        {/* Title */}
                        {titleText && (
                            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: '4px 0 0 0', fontFamily: 'SF Pro Display, Sen, Inter, sans-serif' }}>
                                {titleText}
                            </h1>
                        )}

                        {/* Description / Content Text */}
                        {descriptionText && (
                            <div
                                style={{
                                    fontSize: '15px',
                                    color: '#374151',
                                    lineHeight: '1.7',
                                    fontFamily: 'Sen, Inter, sans-serif',
                                    wordBreak: 'break-word'
                                }}
                                dangerouslySetInnerHTML={{ __html: descriptionText }}
                            />
                        )}

                        {/* External Link (if present and not already the top YouTube player, or accompanying image) */}
                        {linkUrl && (!hasYoutube || hasImage) && (
                            <div style={{ paddingTop: '4px' }}>
                                <a
                                    href={linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: '#2563eb',
                                        textDecoration: 'underline',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        fontFamily: 'Sen, sans-serif'
                                    }}
                                >
                                    <span>🔗</span>
                                    <span>Open Link</span>
                                </a>
                            </div>
                        )}

                        {/* Attached Files / Documents */}
                        {attachment && (hasYoutube || hasImage) && (
                            <div style={{ paddingTop: '6px' }}>
                                <a
                                    href={getContentImageUrl(attachment)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        backgroundColor: '#eff6ff',
                                        color: '#1d4ed8',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        border: '1px solid #bfdbfe'
                                    }}
                                >
                                    <span>📎</span>
                                    <span>Open Document</span>
                                </a>
                            </div>
                        )}

                        {attachmentTwo && (
                            <div>
                                <a
                                    href={getContentImageUrl(attachmentTwo)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '10px 18px',
                                        borderRadius: '10px',
                                        backgroundColor: '#fff7ed',
                                        color: '#c2410c',
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        border: '1px solid #fed7aa'
                                    }}
                                >
                                    <span>📄</span>
                                    <span>Attachment 2 ({getFileType(attachmentTwo) === 'pdf' ? 'PDF' : 'File'})</span>
                                </a>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        );
    }

    // Active Podcast Video for Left Column (guaranteed fallback)
    const activePodcastVideo = (selectedVideo && (selectedVideo.video_url || selectedVideo.url || selectedVideo.link_url))
        ? selectedVideo
        : (videos && videos.length > 0 && (videos[0].video_url || videos[0].url || videos[0].link_url))
            ? videos[0]
            : DEFAULT_FALLBACK_VIDEOS[0];

    const activePodcastVideoUrl = activePodcastVideo?.video_url || activePodcastVideo?.url || activePodcastVideo?.link_url || DEFAULT_FALLBACK_VIDEOS[0].video_url;

    return (
        <div className="oscp-page-wrapper">
            {/* ===== BREADCRUMB ===== */}
            <div className="oscp-breadcrumb-header">
                <div className="oscp-breadcrumb-content">
                    <span className="oscp-back-arrow" onClick={() => navigate(-1)}>‹</span>
                    <h1 className="oscp-breadcrumb-title">
                        <span className="oscp-breadcrumb-link" onClick={() => {
                            if (sourcePage === '/') {
                                navigate('/', { state: { activeTab: 'other' } });
                            } else {
                                navigate(sourcePage || '/other-section');
                            }
                        }}>Other Sections</span>
                        {serviceName && serviceName.trim() !== '' && (
                            <>
                                <span className="oscp-breadcrumb-sep">&gt;</span>
                                <span className="oscp-breadcrumb-link" onClick={() => navigate(isInnerData ? -2 : -1)}>
                                    {toTitleCase(serviceName)}
                                </span>
                            </>
                        )}
                        {catName && catName.trim() !== '' && (
                            <>
                                <span className="oscp-breadcrumb-sep">&gt;</span>
                                <span className="oscp-breadcrumb-link" onClick={() => navigate(-1)}>
                                    {catName.toUpperCase()}
                                </span>
                            </>
                        )}
                        {displayName && displayName !== catName && displayName.trim() !== '' && (
                            <>
                                <span className="oscp-breadcrumb-sep">&gt;</span>
                                <span className="oscp-breadcrumb-current">{displayName.toUpperCase()}</span>
                            </>
                        )}
                    </h1>
                </div>
            </div>

            {/* ===== TWO-COLUMN LAYOUT ===== */}
            <div className="oscp-two-column-layout">

                {/* LEFT COLUMN — Video + Banners */}
                <div className="oscp-left-column">
                    {/* Video Player */}
                    <div className="oscp-video-container">
                        <iframe
                            key={`${activePodcastVideo?.id || 'podcast'}-${isMuted}`}
                            src={convertToEmbedUrl(activePodcastVideoUrl, isMuted)}
                            title={activePodcastVideo?.title || 'Video Player'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="oscp-video-iframe"
                        />
                        {videos.length > 1 && (
                            <>
                                <button className="oscp-video-nav oscp-video-nav-left" onClick={handlePrevVideo}>‹</button>
                                <button className="oscp-video-nav oscp-video-nav-right" onClick={handleNextVideo}>›</button>
                            </>
                        )}
                    </div>

                    {/* Banner Strip */}
                    {bannerData.length > 0 && (
                        <div className="oscp-banner-strip" ref={bannerStripRef}>
                            {bannerData.map((banner, index) => {
                                const imgSrc = getBannerImageUrl(banner?.banner_img || banner?.image || banner?.banner_image || banner?.url);
                                return (
                                    <div key={`banner-${index}`} className="oscp-banner-card">
                                        <img
                                            src={imgSrc}
                                            alt={banner?.title || `Banner ${index + 1}`}
                                            className="oscp-banner-img"
                                            onError={(e) => { e.target.style.opacity = '0.3'; }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN — Content Cards */}
                <div className="oscp-right-column">
                    <div className="oscp-content-card-container">
                        {isFallbackList ? (
                            /* Fallback: show as clickable list */
                            <div className="oscp-fallback-list">
                                {contentItems.map((item, index) => (
                                    <div
                                        key={item.id || index}
                                        className="oscp-fallback-item"
                                        onClick={() => handleFallbackItemClick(item)}
                                    >
                                        <span className="oscp-fallback-name">
                                            {toTitleCase(item.title_name || item.content_title)}
                                        </span>
                                        <span className="oscp-fallback-arrow">&gt;</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Normal: show media cards */
                            <div className="oscp-media-grid">
                                {contentItems.map((item, index) => {
                                    const hasYouTube = isYouTubeLink(item.link_url);
                                    const ytThumb = hasYouTube ? getYouTubeThumbnail(item.link_url) : null;
                                    const contentImg = getContentImageUrl(item.content_image);

                                    return (
                                        <div
                                            key={item.id || index}
                                            className="oscp-media-card"
                                            onClick={() => {
                                                setInlineVideo(item);
                                            }}
                                        >
                                            {/* Thumbnail */}
                                            {(ytThumb || contentImg) ? (
                                                <div className="oscp-media-thumb">
                                                    <img
                                                        src={ytThumb || contentImg}
                                                        alt={item.content_title}
                                                        className="oscp-media-thumb-img"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                    {hasYouTube && (
                                                        <div className="oscp-play-overlay">
                                                            <div className="oscp-play-icon">▶</div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null}

                                            {/* Text info */}
                                            <div className="oscp-media-info">
                                                <p className="oscp-media-title">{item.content_title}</p>
                                                {item.content_attached_file && (
                                                    <a
                                                        href={getContentImageUrl(item.content_attached_file)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="oscp-file-link"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        📎 View File
                                                    </a>
                                                )}
                                                {item.content_attached_file_two && (
                                                    <a
                                                        href={getContentImageUrl(item.content_attached_file_two)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="oscp-file-link"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        📄 Download {getFileType(item.content_attached_file_two) === 'pdf' ? 'PDF' : 'File'}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtherSectionContentPage;
