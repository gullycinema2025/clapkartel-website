import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, getDocs, writeBatch, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getCurrentUserId } from '../../utils/auth';
import { showToast } from '../../utils/toast';
import { Bell, CheckCheck, User, MessageSquare } from 'lucide-react';
import './index.css';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    // 1. Fetch current User ID
    useEffect(() => {
        const id = getCurrentUserId() || localStorage.getItem('userid');
        if (!id) {
            navigate('/login');
            return;
        }
        setCurrentUserId(id);
    }, [navigate]);

    // 2. Realtime listener to Firestore user_notifications (Matching Flutter Mobile App)
    useEffect(() => {
        if (!currentUserId) return;

        const notifRef = collection(db, 'notifications', currentUserId, 'user_notifications');
        const q = query(notifRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUserId]);

    // Mark all as read (matching Flutter NotificationService.markAllAsRead)
    const markAllAsRead = async () => {
        if (!currentUserId) return;
        try {
            const notifRef = collection(db, 'notifications', currentUserId, 'user_notifications');
            const unreadQuery = query(notifRef, where('isRead', '==', false));
            const snapshot = await getDocs(unreadQuery);

            if (!snapshot.empty) {
                const batch = writeBatch(db);
                snapshot.docs.forEach((docSnap) => {
                    batch.update(docSnap.ref, { isRead: true });
                });
                await batch.commit();
                showToast("All notifications marked as read", "success");
            } else {
                showToast("All notifications are already read", "info");
            }
        } catch (error) {
            console.error("Error marking notifications as read:", error);
            showToast("Failed to mark notifications as read", "error");
        }
    };

    // Mark single notification as read
    const markAsRead = async (notificationId) => {
        if (!currentUserId) return;
        try {
            const docRef = doc(db, 'notifications', currentUserId, 'user_notifications', notificationId);
            await updateDoc(docRef, { isRead: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    // Handle clicking a notification item (matching Flutter ProffProfileDetailsPage navigation)
    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        if (notification.type === 'chat' || notification.type === 'message') {
            navigate('/messages', {
                state: {
                    peerId: notification.senderId,
                    peerName: notification.title,
                    peerImage: notification.senderImage,
                    subCatId: notification.subcatId || ''
                }
            });
        } else if (notification.senderId) {
            navigate('/user-profile', {
                state: {
                    sub_cat_id: notification.subcatId || '',
                    user_id: notification.senderId
                }
            });
        }
    };

    // Parse timestamp (Firestore Timestamp, seconds object, or Date string)
    const parseTimestamp = (timestamp) => {
        if (!timestamp) return null;
        if (typeof timestamp.toDate === 'function') {
            return timestamp.toDate();
        }
        if (timestamp.seconds) {
            return new Date(timestamp.seconds * 1000);
        }
        const parsed = new Date(timestamp);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    // Format relative time (e.g., "5m ago", "2h ago", "1d ago")
    const formatTimeAgo = (timestamp) => {
        const date = parseTimestamp(timestamp);
        if (!date) return '';
        
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    // Format full date time for details
    const formatDateTime = (timestamp) => {
        const date = parseTimestamp(timestamp);
        if (!date) return '';
        
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getSenderImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `https://www.whysocial.in/clap-kartel/public/${imagePath}`;
    };

    const hasUnread = notifications.some(n => !n.isRead);

    return (
        <div className="ck-notifications-page">
            <div className="ck-notifications-card-wrapper">
                
                {/* Header matching Flutter app */}
                <div className="ck-notifications-header">
                    <div className="ck-notifications-title-row">
                        <div className="ck-notifications-icon-badge">
                            <Bell size={20} className="ck-bell-icon" />
                        </div>
                        <div>
                            <h1 className="ck-notifications-title">Notifications</h1>
                            <p className="ck-notifications-subtitle">
                                Stay updated with messages, casting calls, and connection alerts.
                            </p>
                        </div>
                    </div>

                    {notifications.length > 0 && hasUnread && (
                        <button className="ck-mark-all-read-btn" onClick={markAllAsRead}>
                            <CheckCheck size={16} />
                            <span>Mark all as Read</span>
                        </button>
                    )}
                </div>

                {/* Body Content */}
                <div className="ck-notifications-list-container">
                    {loading ? (
                        <div className="ck-notifications-loading">
                            <div className="ck-notif-spinner" />
                            <p>Loading your notifications…</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="ck-notifications-empty">
                            <div className="ck-empty-icon-circle">
                                <Bell size={36} color="#BF8906" />
                            </div>
                            <h3>No notifications yet</h3>
                            <p>When you receive messages, invitations, or activity alerts, they will appear here.</p>
                        </div>
                    ) : (
                        <div className="ck-notifications-list">
                            {notifications.map((notification) => {
                                const senderImg = getSenderImageUrl(notification.senderImage);
                                const isUnread = !notification.isRead;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`ck-notification-card ${isUnread ? 'unread' : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        {/* Unread indicator */}
                                        <div className={`ck-notif-dot ${isUnread ? 'active' : ''}`} />

                                        {/* Avatar / Sender Image */}
                                        <div className="ck-notif-avatar-box">
                                            {senderImg ? (
                                                <img
                                                    src={senderImg}
                                                    alt={notification.title || 'Sender'}
                                                    className="ck-notif-avatar-img"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="ck-notif-avatar-fallback"
                                                style={{ display: senderImg ? 'none' : 'flex' }}
                                            >
                                                {notification.type === 'chat' ? (
                                                    <MessageSquare size={20} color="#BF8906" />
                                                ) : (
                                                    <User size={20} color="#BF8906" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="ck-notif-content-box">
                                            <div className="ck-notif-top-row">
                                                <h4 className="ck-notif-sender-title">
                                                    {notification.title || 'Notification'}
                                                </h4>
                                                <span className="ck-notif-time-badge">
                                                    {formatTimeAgo(notification.timestamp)}
                                                </span>
                                            </div>

                                            {notification.message && (
                                                <p className="ck-notif-message-text">
                                                    {notification.message}
                                                </p>
                                            )}

                                            <div className="ck-notif-bottom-row">
                                                <span className="ck-notif-exact-time">
                                                    {formatDateTime(notification.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default NotificationsPage;