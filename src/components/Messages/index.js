import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, setDoc, addDoc, increment, getDocs, writeBatch, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { getCurrentUserId } from '../../utils/auth';
import { showToast } from '../../utils/toast';
import './index.css';

// Replicate Dart's String.hashCode to ensure we generate the exact same chatRoomId as the mobile app
const dartHashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash + str.charCodeAt(i)) & 0x1FFFFFFF;
        hash = (hash + ((hash & 0x0007FFFF) << 10)) & 0x1FFFFFFF;
        hash ^= hash >>> 6;
    }
    hash = (hash + ((hash & 0x03FFFFFF) << 3)) & 0x1FFFFFFF;
    hash ^= hash >>> 11;
    hash = (hash + ((hash & 0x00003FFF) << 15)) & 0x1FFFFFFF;
    return hash;
};

const getChatRoomId = (currentUserId, peerId) => {
    if (dartHashCode(currentUserId) <= dartHashCode(peerId)) {
        return `${currentUserId}_${peerId}`;
    } else {
        return `${peerId}_${currentUserId}`;
    }
};

const MessagesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserName, setCurrentUserName] = useState('');
    const [currentUserImage, setCurrentUserImage] = useState('');
    
    const [recentChats, setRecentChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null); // The peer we are talking to
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    const messagesEndRef = useRef(null);

    const [showDropdown, setShowDropdown] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('spam');
    const [reportDesc, setReportDesc] = useState('Sending spam messages');
    const [autoBlock, setAutoBlock] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quickRepliesExpanded, setQuickRepliesExpanded] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [showUnblockModal, setShowUnblockModal] = useState(false);
    const [blockedRecentChats, setBlockedRecentChats] = useState({});

    // If navigated from Users page with a pre-selected user
    useEffect(() => {
        if (location.state && location.state.peerId) {
            setActiveChat({
                userId: location.state.peerId,
                userName: location.state.peerName,
                userProfileImage: location.state.peerImage,
                subCatId: location.state.subCatId || ''
            });
            window.history.replaceState({}, document.title)
        }
    }, [location.state]);

    // Lock body scroll to make it feel like WhatsApp/Instagram web
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {
        const id = getCurrentUserId();
        if (!id) {
            navigate('/login');
            return;
        }
        setCurrentUserId(id);
        let storedName = localStorage.getItem('name_key');
        if (!storedName) {
            try {
                const userDataStr = localStorage.getItem('userData');
                if (userDataStr) {
                    const userData = JSON.parse(userDataStr);
                    storedName = userData.userName || userData.fullName;
                }
            } catch(e) {}
        }
        setCurrentUserName(storedName || 'Unknown User');
        const profile = localStorage.getItem('userProfileImage');
        setCurrentUserImage(profile ? `https://www.whysocial.in/clap-kartel/public/${profile}` : '');
    }, [navigate]);

    // Load Recent Chats
    useEffect(() => {
        if (!currentUserId) return;

        const recentChatsRef = collection(db, 'recent_chats', currentUserId, 'users');
        const q = query(recentChatsRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecentChats(chats);
        });

        return () => unsubscribe();
    }, [currentUserId]);

    // Check block status for all recent chats
    useEffect(() => {
        if (recentChats.length === 0) return;

        const checkRecentBlocks = async () => {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token2') || '';
            const blockStatus = { ...blockedRecentChats };
            let hasChanges = false;

            const promises = recentChats.map(async (chat) => {
                if (blockStatus[chat.userId] !== undefined) return;
                try {
                    const formData = new FormData();
                    formData.append('blocked_user_id', chat.userId);

                    const response = await fetch('https://www.whysocial.in/clap-kartel/public/api/user/check-block', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });

                    if (response.ok) {
                        const data = await response.json();
                        blockStatus[chat.userId] = (data.status === true && data.is_blocked === 1);
                        hasChanges = true;
                    }
                } catch (e) {}
            });

            await Promise.all(promises);
            if (hasChanges) {
                setBlockedRecentChats(blockStatus);
            }
        };

        checkRecentBlocks();
    }, [recentChats]);

    // Load Messages for Active Chat
    useEffect(() => {
        if (!currentUserId || !activeChat) return;

        const chatRoomId = getChatRoomId(currentUserId, activeChat.userId);
        
        const messagesRef = collection(db, 'messages', chatRoomId, 'chats');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            
            // Mark seen
            markMessagesSeen(chatRoomId);
        });

        return () => unsubscribe();
    }, [currentUserId, activeChat]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Check block status and reset dropdown when activeChat changes
    useEffect(() => {
        setIsBlocked(false); // Reset immediately on chat switch
        setShowDropdown(false); // Close options dropdown on chat switch
        if (!currentUserId || !activeChat) return;

        const checkIfBlocked = async () => {
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('access_token2') || '';
                const formData = new FormData();
                formData.append('blocked_user_id', activeChat.userId);

                const response = await fetch('https://www.whysocial.in/clap-kartel/public/api/user/check-block', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    const blocked = data.status === true && data.is_blocked === 1;
                    setIsBlocked(blocked);
                    setBlockedRecentChats(prev => ({ ...prev, [activeChat.userId]: blocked }));
                } else {
                    setIsBlocked(false);
                }
            } catch (error) {
                /* console.error("Error checking block status:", error); */
                setIsBlocked(false);
            }
        };

        checkIfBlocked();
    }, [currentUserId, activeChat]);

    const markMessagesSeen = async (chatRoomId) => {
        if (!activeChat || !currentUserId) return;
        try {
            const messagesRef = collection(db, 'messages', chatRoomId, 'chats');
            const unreadQuery = query(messagesRef, where('receiverId', '==', currentUserId), where('seen', '==', false));
            const snapshot = await getDocs(unreadQuery);

            if (!snapshot.empty) {
                const batch = writeBatch(db);
                snapshot.docs.forEach((docSnap) => {
                    batch.update(docSnap.ref, { seen: true });
                });
                await batch.commit();
            }

            // Reset recent chats unread count
            const recentRef = doc(db, 'recent_chats', currentUserId, 'users', activeChat.userId);
            await setDoc(recentRef, { unreadCount: 0 }, { merge: true });
        } catch (error) {
            /* console.error("Error marking seen:", error); */
        }
    };

    const quickOptions = [
        "Connect",
        "Collaborate",
        "Meet",
        "Work",
        "Availability",
        "Portfolio",
        "Profile",
        "Review",
        "Services",
        "Notify"
    ];

    const getQuickOptionText = (option) => {
        switch (option) {
            case "Connect":
                return "Can we connect?";
            case "Collaborate":
                return "Can we collaborate on a project?";
            case "Meet":
                return "Can we schedule a Meeting?";
            case "Work":
                return "Can we work together?";
            case "Availability":
                return "Are you currently available?";
            case "Portfolio":
                return "Can you share your portfolio?";
            case "Profile":
                return "Can I know more about your profile?";
            case "Review":
                return "Could you please review my profile?";
            case "Services":
                return "Can you share your services and details?";
            case "Notify":
                return "Kindly notify me about future opportunities.";
            default:
                return option;
        }
    };

    const handleQuickOptionClick = (option) => {
        const text = getQuickOptionText(option);
        handleSendMessage(null, text);
        setQuickRepliesExpanded(false);
    };

    const handleSendMessage = async (e, directText = null) => {
        if (e) e.preventDefault();
        const text = directText !== null ? directText.trim() : newMessage.trim();
        if (!text || !activeChat) return;

        if (isBlocked) {
            showToast("You have blocked this user. Unblock to send messages.", "error");
            return;
        }

        if (directText === null) {
            setNewMessage('');
        }
        const chatRoomId = getChatRoomId(currentUserId, activeChat.userId);
        const timestamp = Date.now();

        try {
            // Add message
            const messagesRef = collection(db, 'messages', chatRoomId, 'chats');
            await addDoc(messagesRef, {
                senderId: currentUserId,
                receiverId: activeChat.userId,
                message: text,
                timestamp: timestamp,
                seen: false,
                type: 'text',
                subCatId: activeChat.subCatId || ''
            });

            // Update Recent Chats (Sender)
            const senderRef = doc(db, 'recent_chats', currentUserId, 'users', activeChat.userId);
            await setDoc(senderRef, {
                userId: activeChat.userId,
                userName: activeChat.userName,
                userProfileImage: activeChat.userProfileImage,
                lastMessage: text,
                timestamp: timestamp,
                unreadCount: 0,
                subCatId: activeChat.subCatId || ''
            }, { merge: true });

            // Update Recent Chats (Receiver)
            const receiverRef = doc(db, 'recent_chats', activeChat.userId, 'users', currentUserId);
            await setDoc(receiverRef, {
                userId: currentUserId,
                userName: currentUserName,
                userProfileImage: currentUserImage,
                lastMessage: text,
                timestamp: timestamp,
                unreadCount: increment(1),
                subCatId: activeChat.subCatId || '' // using peer's subCatId as fallback
            }, { merge: true });

            // Save notification in user_notifications
            const notifRef = collection(db, 'notifications', activeChat.userId, 'user_notifications');
            await addDoc(notifRef, {
                title: currentUserName,
                message: `sent you a message: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
                timestamp: serverTimestamp(),
                senderId: currentUserId,
                senderImage: currentUserImage,
                receiverId: activeChat.userId,
                type: 'chat',
                subcatId: activeChat.subCatId || '',
                isRead: false
            });

        } catch (error) {
            /* console.error("Error sending message:", error); */
        }
    };

    const handleBlockUser = async () => {
        if (!currentUserId || !activeChat) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token2') || '';
            const formData = new FormData();
            formData.append('blocker_user_id', currentUserId);
            formData.append('blocked_user_id', activeChat.userId);

            const response = await fetch('https://www.whysocial.in/clap-kartel/public/api/user/block', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.status === 200 || response.status === 201) {
                showToast(`${activeChat.userName} blocked successfully`, 'success');
                setIsBlocked(true);
                setBlockedRecentChats(prev => ({ ...prev, [activeChat.userId]: true }));
                setShowBlockModal(false);
                setShowDropdown(false);
            } else {
                showToast('Failed to block user', 'error');
            }
        } catch (error) {
            /* console.error("Error blocking user:", error); */
            showToast('An error occurred. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnblockUser = async () => {
        if (!currentUserId || !activeChat) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token2') || '';
            const formData = new FormData();
            formData.append('blocker_user_id', currentUserId);
            formData.append('blocked_user_id', activeChat.userId);

            const response = await fetch('https://www.whysocial.in/clap-kartel/public/api/user/unblock', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.status === 200 || response.status === 201) {
                showToast(`${activeChat.userName} unblocked successfully`, 'success');
                setIsBlocked(false);
                setBlockedRecentChats(prev => ({ ...prev, [activeChat.userId]: false }));
                setShowUnblockModal(false);
                setShowDropdown(false);
            } else {
                showToast('Failed to unblock user', 'error');
            }
        } catch (error) {
            /* console.error("Error unblocking user:", error); */
            showToast('An error occurred. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReportUser = async () => {
        if (!currentUserId || !activeChat) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('access_token2') || '';
            const formData = new FormData();
            formData.append('reported_user_id', activeChat.userId);
            formData.append('reason', reportReason);
            formData.append('description', reportDesc);
            formData.append('block_user', autoBlock.toString());

            const response = await fetch('https://www.whysocial.in/clap-kartel/public/api/user/report', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.status === 200 || response.status === 201) {
                showToast('User reported successfully', 'success');
                
                if (autoBlock) {
                    const blockFormData = new FormData();
                    blockFormData.append('blocker_user_id', currentUserId);
                    blockFormData.append('blocked_user_id', activeChat.userId);
                    await fetch('https://www.whysocial.in/clap-kartel/public/api/user/block', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: blockFormData
                    });
                    setIsBlocked(true);
                }
                
                setShowReportModal(false);
                setShowDropdown(false);
            } else {
                showToast('Failed to report user', 'error');
            }
        } catch (error) {
            /* console.error("Error reporting user:", error); */
            showToast('An error occurred. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReasonChange = (reason) => {
        setReportReason(reason);
        const descriptions = {
            spam: 'Sending spam messages',
            fake_profile: 'Using fake photos',
            harassment: 'Harassing behavior',
            other: 'Other issue'
        };
        setReportDesc(descriptions[reason] || 'Other issue');
    };

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

    const formatTime = (ts) => {
        const date = parseTimestamp(ts);
        if (!date) return '';

        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isToday) {
            return timeStr;
        }
        if (isYesterday) {
            return 'Yesterday';
        }

        const sameYear = now.getFullYear() === date.getFullYear();
        return date.toLocaleDateString([], {
            day: 'numeric',
            month: 'short',
            ...(sameYear ? {} : { year: 'numeric' })
        });
    };

    const formatDateHeader = (ts) => {
        const date = parseTimestamp(ts);
        if (!date) return '';

        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        if (isToday) return 'Today';
        if (isYesterday) return 'Yesterday';

        const sameYear = now.getFullYear() === date.getFullYear();
        return date.toLocaleDateString([], {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            ...(sameYear ? {} : { year: 'numeric' })
        });
    };

    const getFullDateTime = (ts) => {
        const date = parseTimestamp(ts);
        if (!date) return '';
        return date.toLocaleString([], {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!currentUserId) return null;

    return (
        <div className="messages-layout">
            <div className={`messages-sidebar ${activeChat ? 'hide-on-mobile' : ''}`}>
                <div className="sidebar-header">
                    <h2>Messages</h2>
                </div>
                <div className="recent-chats-list">
                    {recentChats.length === 0 ? (
                        <p className="no-chats-message">No recent chats</p>
                    ) : (
                        recentChats.map((chat) => (
                            <div 
                                key={chat.userId} 
                                className={`chat-list-item ${activeChat?.userId === chat.userId ? 'active' : ''}`}
                                onClick={() => setActiveChat(chat)}
                            >
                                <img 
                                    src={chat.userProfileImage || 'https://placehold.co/120?text=No+Image'} 
                                    alt={String(chat.userId) === String(currentUserId) ? 'You' : chat.userName} 
                                    className="chat-avatar"
                                    onError={(e) => { e.target.src = 'https://placehold.co/120?text=No+Image'; }}
                                />
                                <div className="chat-list-info">
                                    <div className="chat-list-header">
                                        <h4>{String(chat.userId) === String(currentUserId) ? 'You' : chat.userName}</h4>
                                        <span className="chat-time" title={getFullDateTime(chat.timestamp)}>{formatTime(chat.timestamp)}</span>
                                    </div>
                                    <div className="chat-list-preview">
                                        {blockedRecentChats[chat.userId] ? (
                                            <p style={{ color: '#c0392b', fontStyle: 'italic', fontWeight: '500' }}>Blocked</p>
                                        ) : (
                                            <p>{chat.lastMessage}</p>
                                        )}
                                        {chat.unreadCount > 0 && !blockedRecentChats[chat.userId] && (
                                            <span className="unread-badge">{chat.unreadCount}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className={`messages-main ${!activeChat ? 'hide-on-mobile' : ''}`}>
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            <button className="back-btn mobile-only" onClick={() => setActiveChat(null)} title="Back">
                                ←
                            </button>
                            <img 
                                src={activeChat.userProfileImage || 'https://placehold.co/120?text=No+Image'} 
                                alt={String(activeChat.userId) === String(currentUserId) ? 'You' : activeChat.userName} 
                                className="chat-header-avatar"
                                onError={(e) => { e.target.src = 'https://placehold.co/120?text=No+Image'; }}
                            />
                            <h3>{String(activeChat.userId) === String(currentUserId) ? 'You' : activeChat.userName}</h3>
                            
                            <div className="chat-options-container">
                                <button className="chat-options-btn" onClick={() => setShowDropdown(!showDropdown)} title="More Options">
                                    <svg className="options-icon" viewBox="0 0 24 24" width="24" height="24">
                                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#555"/>
                                    </svg>
                                </button>
                                {showDropdown && (
                                    <div className="chat-options-dropdown">
                                        <button className="dropdown-item" onClick={() => {
                                            navigate('/user-profile', {
                                                state: { sub_cat_id: activeChat.subCatId, user_id: activeChat.userId }
                                            });
                                            setShowDropdown(false);
                                        }}>
                                            View Full Profile
                                        </button>
                                        {String(activeChat.userId) !== String(currentUserId) && (
                                            <>
                                                {isBlocked ? (
                                                    <button className="dropdown-item text-success" onClick={() => { setShowUnblockModal(true); setShowDropdown(false); }}>
                                                        Unblock User
                                                    </button>
                                                ) : (
                                                    <button className="dropdown-item" onClick={() => { setShowBlockModal(true); setShowDropdown(false); }}>
                                                        Block User
                                                    </button>
                                                )}
                                                <button className="dropdown-item text-danger" onClick={() => { setShowReportModal(true); setShowDropdown(false); }}>
                                                    Report User
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="chat-messages">
                            {(() => {
                                const filteredMessages = messages.filter((msg) => !(isBlocked && msg.senderId === activeChat.userId));
                                let lastDateHeader = null;

                                return filteredMessages.map((msg) => {
                                    const isMe = msg.senderId === currentUserId;
                                    const dateHeader = formatDateHeader(msg.timestamp);
                                    let showDateHeader = false;

                                    if (dateHeader && dateHeader !== lastDateHeader) {
                                        showDateHeader = true;
                                        lastDateHeader = dateHeader;
                                    }

                                    const msgDate = parseTimestamp(msg.timestamp);
                                    const bubbleTimeStr = msgDate ? msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                                    return (
                                        <React.Fragment key={msg.id}>
                                            {showDateHeader && (
                                                <div className="chat-date-divider-wrapper">
                                                    <span className="chat-date-divider-pill">{dateHeader}</span>
                                                </div>
                                            )}
                                            <div className={`message-bubble-wrapper ${isMe ? 'mine' : 'theirs'}`}>
                                                <div className="message-bubble">
                                                    <p>{msg.message}</p>
                                                    <span className="message-time" title={getFullDateTime(msg.timestamp)}>
                                                        {bubbleTimeStr}
                                                    </span>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                });
                            })()}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className={`quick-replies-wrapper ${quickRepliesExpanded ? 'expanded' : 'collapsed'}`}>
                            <button 
                                type="button" 
                                className="quick-replies-toggle-btn" 
                                onClick={() => setQuickRepliesExpanded(!quickRepliesExpanded)}
                            >
                                Quick Replies {quickRepliesExpanded ? '▼' : '▲'}
                            </button>
                            <div className="quick-replies-container">
                                {quickOptions.map((option) => (
                                    <button 
                                        key={option} 
                                        type="button"
                                        className="quick-reply-chip"
                                        title={getQuickOptionText(option)}
                                        onClick={() => handleQuickOptionClick(option)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                placeholder={isBlocked ? "You have blocked this user. Unblock to send messages." : "Type a message..."} 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={isBlocked}
                            />
                            <button type="submit" disabled={isBlocked || !newMessage.trim()} title="Send Message">
                                <svg className="send-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-active-chat">
                        <div className="no-chat-icon">💬</div>
                        <h3>Select a chat to start messaging</h3>
                    </div>
                )}
            </div>

            {/* Block User Modal */}
            {showBlockModal && (
                <div className="chat-modal-overlay" onClick={() => setShowBlockModal(false)}>
                    <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Block User</h3>
                        <p>Are you sure you want to block {activeChat?.userName}?</p>
                        <div className="chat-modal-actions">
                            <button 
                                className="modal-btn btn-cancel" 
                                onClick={() => setShowBlockModal(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                className="modal-btn btn-danger" 
                                onClick={handleBlockUser}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Blocking...' : 'Block'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unblock User Modal */}
            {showUnblockModal && (
                <div className="chat-modal-overlay" onClick={() => setShowUnblockModal(false)}>
                    <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Unblock User</h3>
                        <p>Are you sure you want to unblock {activeChat?.userName}?</p>
                        <div className="chat-modal-actions">
                            <button 
                                className="modal-btn btn-cancel" 
                                onClick={() => setShowUnblockModal(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                className="modal-btn btn-danger" 
                                onClick={handleUnblockUser}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Unblocking...' : 'Unblock'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report User Modal */}
            {showReportModal && (
                <div className="chat-modal-overlay" onClick={() => setShowReportModal(false)}>
                    <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Report User</h3>
                        <div className="chat-form-group">
                            <label>Reason for reporting</label>
                            <select 
                                value={reportReason} 
                                onChange={(e) => handleReasonChange(e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option value="spam">Spam</option>
                                <option value="fake_profile">Fake Profile</option>
                                <option value="harassment">Harassment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="chat-form-group">
                            <label>Description</label>
                            <textarea 
                                value={reportDesc} 
                                onChange={(e) => setReportDesc(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Please provide more details..."
                            />
                        </div>
                        <div className="chat-form-group checkbox-group">
                            <label>
                                <input 
                                    type="checkbox" 
                                    checked={autoBlock} 
                                    onChange={(e) => setAutoBlock(e.target.checked)}
                                    disabled={isSubmitting}
                                />
                                Block this user as well
                            </label>
                        </div>
                        <div className="chat-modal-actions">
                            <button 
                                className="modal-btn btn-cancel" 
                                onClick={() => setShowReportModal(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                className="modal-btn btn-danger" 
                                onClick={handleReportUser}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Report User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesPage;
