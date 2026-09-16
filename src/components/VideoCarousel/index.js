import { useState, useEffect, useRef } from "react";
import "./index.css";

const VideoCarousel = () => {
    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';

    // State management
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isMuted, setIsMuted] = useState(true); // Start muted

    // Carousel settings
    const videosToShow = 3;
    const videoCardWidth = 400; // Width of each video card
    const containerRef = useRef(null);

    // Helper function to get authorization headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Helper to extract YouTube video ID
    const getYouTubeId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2] && match[2].length === 11) {
            return match[2];
        }
        const altMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
        if (altMatch && altMatch[1]) {
            return altMatch[1];
        }
        return '';
    };

    // Helper function to convert YouTube URL to embed URL
    const convertToEmbedUrl = (url, muted = true) => {
        if (!url) return '';
        if (url.includes('youtube.com/embed/')) return url;
        const videoId = getYouTubeId(url);
        if (videoId) {
            const muteParam = muted ? '1' : '0';
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muteParam}&controls=1&modestbranding=1&rel=0`;
        }
        return url;
    };

    // Helper function to get video thumbnail from YouTube
    const getYouTubeThumbnail = (url) => {
        if (!url) return null;
        const videoId = getYouTubeId(url);
        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
        return null;
    };

    // Fetch videos from API
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);

                let fetchedVideos = [];
                // Try /api/podcast/home first (matching mobile and backend)
                const response = await fetch(`${BASE_URL}/api/podcast/home`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
                        fetchedVideos = result.data;
                    } else if (result?.result && Array.isArray(result.result) && result.result.length > 0) {
                        fetchedVideos = result.result;
                    }
                }

                // Fallback if needed
                if (fetchedVideos.length === 0) {
                    const fbResponse = await fetch(`${BASE_URL}/getPodCastAll`, {
                        method: 'GET',
                        headers: getAuthHeaders()
                    });
                    if (fbResponse.ok) {
                        const fbResult = await fbResponse.json();
                        if (fbResult?.data && Array.isArray(fbResult.data)) {
                            fetchedVideos = fbResult.data;
                        } else if (fbResult?.result && Array.isArray(fbResult.result)) {
                            fetchedVideos = fbResult.result;
                        }
                    }
                }

                if (fetchedVideos.length > 0) {
                    setVideos(fetchedVideos);
                    setSelectedVideo(fetchedVideos[0]);
                }
            } catch (err) {
                console.error('Error fetching videos:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    // Auto-scroll effect
    useEffect(() => {
        if (videos.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => {
                const next = prev + 1;
                return next >= videos.length ? 0 : next;
            });
        }, 3000); // Auto-scroll every 3 seconds

        return () => clearInterval(timer);
    }, [videos.length]);

    // Handle smooth scroll animation
    useEffect(() => {
        if (containerRef.current && videos.length > 0) {
            containerRef.current.style.transition = "transform 0.5s ease-in-out";
            containerRef.current.style.transform = `translateX(-${currentIndex * videoCardWidth}px)`;
        }
    }, [currentIndex]);

    // Handle video card click
    const handleVideoClick = (video, index) => {
        setSelectedVideo(video);
        setCurrentIndex(index);
        setIsMuted(false); // Unmute when user clicks a video
    };

    // Create extended array for infinite loop effect
    const extendedVideos = videos.length > 0
        ? [...videos, ...videos.slice(0, videosToShow)]
        : [];

    if (loading) {
        return (
            <div className="video-carousel-loading">
                <div className="loading-spinner"></div>
                <p>Loading videos...</p>
            </div>
        );
    }

    if (videos.length === 0) {
        return null; // Don't show if no videos
    }

    return (
        <div className="video-carousel-wrapper">
            {/* Main Video Player */}
            <div className="video-player-main">
                {selectedVideo && (
                    <iframe
                        key={`${selectedVideo.id}-${isMuted}`}
                        src={convertToEmbedUrl(selectedVideo.video_url, isMuted)}
                        title={selectedVideo.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="main-video-iframe"
                    />
                )}
            </div>

            {/* Video Carousel */}
            <div className="video-carousel-container">
                {/* Previous Button */}
                <button
                    className="video-nav-btn prev-video-btn"
                    onClick={() => {
                        setCurrentIndex((prev) => {
                            return prev > 0 ? prev - 1 : videos.length - 1;
                        });
                    }}
                    aria-label="Previous video"
                >
                    ‹
                </button>

                <div
                    ref={containerRef}
                    className="video-carousel-track"
                >
                    {extendedVideos.map((video, index) => (
                        <div
                            key={`${video.id}-${index}`}
                            className={`video-card ${selectedVideo?.id === video.id ? 'active' : ''}`}
                            onClick={() => handleVideoClick(video, index % videos.length)}
                        >
                            <div className="video-thumbnail">
                                <img
                                    src={getYouTubeThumbnail(video.video_url)}
                                    alt={video.title}
                                    className="thumbnail-image"
                                />
                                <div className="play-overlay">
                                    <div className="play-icon">▶</div>
                                </div>
                            </div>
                            <div className="video-info">
                                <h3 className="video-title">{video.title}</h3>
                                <p className="video-description">
                                    {video.description?.substring(0, 100)}...
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    className="video-nav-btn next-video-btn"
                    onClick={() => {
                        setCurrentIndex((prev) => {
                            return prev < videos.length - 1 ? prev + 1 : 0;
                        });
                    }}
                    aria-label="Next video"
                >
                    ›
                </button>
            </div>
        </div>
    );
};

export default VideoCarousel;
