import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUserId, getAuthHeaders } from '../../utils/auth';
import './index.css';

const WishlistPage = () => {
  const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState({});

  // Message popup state
  const [showMessage, setShowMessage] = useState(false);
  const [messageContent, setMessageContent] = useState({ type: '', text: '' });

  // Unfollow confirmation modal state
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);
  const [userToUnfollow, setUserToUnfollow] = useState(null);

  // Helper function to display message popup
  const displayMessage = (type, text) => {
    setMessageContent({ type, text });
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  // Fetch current user ID from localStorage
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      setCurrentUserId(userId);
    }
  }, []);

  // Check block status for all followers
  useEffect(() => {
    if (wishlistItems.length === 0) return;
    const checkAllBlocks = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token2') || '';
      const blockStatus = {};
      const validFollowers = wishlistItems.filter(item => item.pro_reg_id && item.userName && item.userName.trim() !== '');

      const promises = validFollowers.map(async (item) => {
        try {
          const formData = new FormData();
          formData.append('blocked_user_id', item.pro_reg_id);

          const response = await fetch('https://www.whysocial.in/clap-kartel/public/api/user/check-block', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (response.ok) {
            const data = await response.json();
            blockStatus[item.pro_reg_id] = (data.status === true && data.is_blocked === 1);
          } else {
            blockStatus[item.pro_reg_id] = false;
          }
        } catch (e) {
          blockStatus[item.pro_reg_id] = false;
        }
      });

      await Promise.all(promises);
      setBlockedUsers(blockStatus);
    };

    checkAllBlocks();
  }, [wishlistItems]);

  // Handle unblock action
  const handleUnblockUser = async (item) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token2') || '';
      const formData = new FormData();
      formData.append('blocker_user_id', currentUserId);
      formData.append('blocked_user_id', item.pro_reg_id);

      const response = await fetch('https://www.whysocial.in/clap-kartel/public/api/user/unblock', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        displayMessage('success', `${item.userName} unblocked successfully`);
        setBlockedUsers(prev => ({
          ...prev,
          [item.pro_reg_id]: false
        }));
      } else {
        displayMessage('error', 'Failed to unblock user');
      }
    } catch (error) {
      /* console.error("Error unblocking user:", error); */
      displayMessage('error', 'An error occurred. Please try again.');
    }
  };

  // Fetch followers data
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BASE_URL}/wish/getprofessionaforwishlist`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        // 404 or 400 means no followers exist (empty state) on this backend
        if (response.status === 404 || response.status === 400) {
          setWishlistItems([]);
          return;
        }

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const text = await response.text();
        if (!text.trim()) {
          setWishlistItems([]);
          return;
        }

        const result = JSON.parse(text);
        if (result.status === 'success' && result.data) {
          setWishlistItems(result.data);
          /* console.log(result.data); */
        } else {
          setWishlistItems([]);
        }
      } catch (err) {
        /* console.error('Error fetching followers:', err); */
        setError('Failed to load followers');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, []);

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placehold.co/120x120?text=No+Image';
    return `${BASE_URL}/${imagePath}`;
  };

  // Open unfollow confirmation modal
  const handleUnfollowClick = (item) => {
    setUserToUnfollow(item);
    setIsUnfollowModalOpen(true);
  };

  // Close unfollow confirmation modal
  const handleCloseUnfollowModal = () => {
    setIsUnfollowModalOpen(false);
    setTimeout(() => {
      setUserToUnfollow(null);
    }, 300);
  };

  // Confirm and execute unfollow
  const confirmUnfollow = async () => {
    if (!userToUnfollow) return;

    const { pro_reg_id, userName } = userToUnfollow;

    if (!currentUserId) {
      displayMessage('error', 'Please login to unfollow');
      handleCloseUnfollowModal();
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/wish/addtowishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: currentUserId,
          pro_reg_id: pro_reg_id
        }),
      });

      const result = await response.json();

      if (result.status === 'success' || response.ok) {
        // Remove user from local state
        setWishlistItems(wishlistItems.filter(item => item.pro_reg_id !== pro_reg_id));
        displayMessage('success', `You unfollowed ${userName}`);
        handleCloseUnfollowModal();
      } else {
        displayMessage('error', 'Failed to unfollow');
      }
    } catch (err) {
      /* console.error('Error unfollowing user:', err); */
      displayMessage('error', 'Failed to unfollow. Please try again.');
    }
  };

  const navigate = useNavigate();

  // Handle user card click to navigate to UserProfile
  const handleUserClick = (item) => {
    navigate('/user-profile', {
      state: {
        sub_cat_id: item.sub_cat_id,
        user_id: item.pro_reg_id
      }
    });
  };



  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-header">
          <h1 className="wishlist-title">My Followers</h1>
        </div>
        <div className="wishlist-loading-container">
          <div className="wishlist-spinner"></div>
          <p>Loading followers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-header">
          <h1 className="wishlist-title">My Followers</h1>
        </div>
        <div className="wishlist-error-container">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const validFollowers = wishlistItems.filter(item => item.pro_reg_id && item.userName && item.userName.trim() !== '');

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1 className="wishlist-title">
          My Followers <span className="wishlist-count-badge">{validFollowers.length}</span>
        </h1>
      </div>

      {validFollowers.length === 0 ? (
        <div className="wishlist-empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No Followers Yet</h3>
          <p>Your followers will appear here once other users start following your profile.</p>
          <button className="empty-state-btn" onClick={() => navigate('/craft')}>
            Explore Opportunities
          </button>
        </div>
      ) : (
        <div className="wishlist-list">
          {validFollowers.map((item) => (
            <div key={item.wid} className="wishlist-card">
              <div className="wishlist-card-left" onClick={() => handleUserClick(item)} style={{ cursor: 'pointer' }}>
                <div className="wishlist-avatar-container">
                  {item.userProfileImage ? (
                    <img
                      src={getImageUrl(item.userProfileImage)}
                      alt={item.userName}
                      className="wishlist-avatar-img"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div
                    className="wishlist-fallback-avatar"
                    style={{
                      display: item.userProfileImage ? 'none' : 'flex'
                    }}
                  >
                    {item.userName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                </div>

                <div className="wishlist-info">
                  <h3 className="wishlist-name">{item.userName}</h3>
                  <span className="wishlist-profession">
                    {item.sub_cat_name || 'Professional'}
                  </span>
                </div>
              </div>

              <div className="wishlist-actions">
                <button
                  type="button"
                  className="wishlist-btn btn-view"
                  onClick={() => handleUserClick(item)}
                >
                  View Profile
                </button>
                {blockedUsers[item.pro_reg_id] ? (
                  <button
                    type="button"
                    className="wishlist-btn btn-unfollow"
                    onClick={() => handleUnblockUser(item)}
                    style={{ backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }}
                  >
                    Unblock
                  </button>
                ) : (
                  <button
                    type="button"
                    className="wishlist-btn btn-unfollow"
                    onClick={() => handleUnfollowClick(item)}
                  >
                    Unfollow
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Popup */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className={`message-popup ${messageContent.type === 'success' ? 'message-success' : 'message-error'}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <span className="message-icon">
              {messageContent.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="message-text">{messageContent.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unfollow Confirmation Modal */}
      <AnimatePresence>
        {isUnfollowModalOpen && userToUnfollow && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseUnfollowModal}
          >
            <motion.div
              className="unfollow-modal-content"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="unfollow-modal-header">
                <h3>Unfollow User</h3>
                <button className="unfollow-modal-close" onClick={handleCloseUnfollowModal}>
                  ✕
                </button>
              </div>
              <div className="unfollow-modal-body">
                <p>Are you sure you want to unfollow <strong>{userToUnfollow.userName}</strong>?</p>
              </div>
              <div className="unfollow-modal-footer">
                <button className="unfollow-modal-cancel" onClick={handleCloseUnfollowModal}>
                  Cancel
                </button>
                <button className="unfollow-modal-confirm" onClick={confirmUnfollow}>
                  UnFollow
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WishlistPage;




































