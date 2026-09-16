import React, { useState, useEffect } from 'react';
import './index.css';

const DailyNewsPage = () => {
    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
    const DAILY_NEWS_ID = '7'; // Content ID for Daily News

    // State for API data
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to get authorization headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Get YouTube video ID from URL (supports regular videos, shorts, and youtu.be links)
    const getYouTubeVideoId = (url) => {
        if (!url) return null;
        // Support regular videos, shorts, and youtu.be links
        const regex = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    // Fetch daily news content
    useEffect(() => {
        const fetchDailyNews = async () => {
            try {
                setLoading(true);
                setError(null);

                const apiUrl = `${BASE_URL}/api/content/${DAILY_NEWS_ID}`;
                console.log('Fetching daily news from:', apiUrl);

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch daily news: ${response.status}`);
                }

                const result = await response.json();
                console.log('Daily News API Response:', result);

                if (result?.content && Array.isArray(result.content)) {
                    setNewsItems(result.content);
                } else {
                    setNewsItems([]);
                }

            } catch (err) {
                console.error('Error fetching daily news:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDailyNews();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="daily-news-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading daily news...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="daily-news-page">
                <h1 className="news-title">Daily News</h1>
                <div className="error-container">
                    <p className="error-message">Error: {error}</p>
                    <button
                        className="retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="daily-news-page">
            {/* Title */}
            <h1 className="news-title">Daily News</h1>
            <p className="news-description">Stay updated with the latest news and videos from the entertainment industry</p>

            {/* News Grid */}
            {newsItems.length === 0 ? (
                <div className="empty-container">
                    <p className="empty-message">No news items available at the moment</p>
                </div>
            ) : (
                <div className="news-grid">
                    {newsItems.map((item) => {
                        const videoId = getYouTubeVideoId(item.link_url);

                        return (
                            <div key={item.id} className="news-item">
                                <div className="news-content">
                                    {/* News Title */}
                                    {item.content_title && (
                                        <h3 className="news-item-title">{item.content_title}</h3>
                                    )}

                                    {/* Video Embed */}
                                    {videoId ? (
                                        <div className="video-wrapper">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                title={item.content_title || `News ${item.id}`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    ) : (
                                        item.link_url && (
                                            <div className="video-placeholder">
                                                <p>Video link: <a href={item.link_url} target="_blank" rel="noopener noreferrer">{item.link_url}</a></p>
                                            </div>
                                        )
                                    )}

                                    {/* Content Text (if available) */}
                                    {item.content_text && item.content_text.trim() !== '' && item.content_text !== '<p>#</p>\r\n' && (
                                        <div
                                            className="news-text"
                                            dangerouslySetInnerHTML={{ __html: item.content_text }}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DailyNewsPage;
