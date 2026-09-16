import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import { FaHeart, FaComment, FaShare, FaPlay, FaPlus, FaSpinner, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { IoClose, IoArrowBack, IoEllipsisVertical } from 'react-icons/io5';
import { FiTrash2, FiVideo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserId } from '../../utils/auth';

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0a0a0'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

// ──────────────────────────────────────────────
// Single Reel Item Component
// ──────────────────────────────────────────────
const ReelItem = ({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onOpenComments,
  onShare,
  onNavigateProfile,
  onOpenOptions,
  isOwner
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLiked, setIsLiked] = useState(reel.is_liked || false);
  const [likesCount, setLikesCount] = useState(parseInt(reel.likes_count) || 0);
  const [showHeart, setShowHeart] = useState(false);
  const lastTap = useRef(0);

  // Video buffering event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onWaiting  = () => setIsBuffering(true);
    const onCanPlay  = () => setIsBuffering(false);
    const onPlaying  = () => { setIsBuffering(false); setIsPlaying(true); };
    const onStalled  = () => setIsBuffering(true);

    video.addEventListener('waiting',  onWaiting);
    video.addEventListener('canplay',  onCanPlay);
    video.addEventListener('playing',  onPlaying);
    video.addEventListener('stalled',  onStalled);

    return () => {
      video.removeEventListener('waiting',  onWaiting);
      video.removeEventListener('canplay',  onCanPlay);
      video.removeEventListener('playing',  onPlaying);
      video.removeEventListener('stalled',  onStalled);
    };
  }, []);

  // Play / Pause based on active state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      // Always restart from the beginning, just like Instagram/YouTube Shorts
      video.currentTime = 0;
      setIsBuffering(true);  // show spinner immediately while video loads
      // Start muted first — browser autoplay policy requires this
      video.muted = true;

      const p = video.play();
      if (p !== undefined) {
        p.then(() => {
          video.muted = isMuted;
          setIsPlaying(true);
        }).catch(() => {
          video.muted = true;
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
      }
      addView();
    } else {
      video.pause();
      video.currentTime = 0; // reset so it's ready to start fresh next time
      setIsPlaying(false);
    }
  }, [isActive]);

  // Sync mute state whenever user toggles the volume button
  useEffect(() => {
    if (videoRef.current && isActive) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, isActive]);

  const addView = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('https://www.whysocial.in/clap-kartel-reels-module/public/api/reels/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reel_id: reel.id.toString() })
      });
    } catch (_) {}
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) { video.pause(); setIsPlaying(false); }
    else { video.play(); setIsPlaying(true); }
  };

  const handleTap = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap → like
      if (!isLiked) handleLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    } else {
      // Single tap after short delay to distinguish from double
      setTimeout(() => {
        if (Date.now() - lastTap.current >= DOUBLE_TAP_DELAY) {
          togglePlay();
        }
      }, DOUBLE_TAP_DELAY);
    }
    lastTap.current = now;
  };

  const handleLike = async () => {
    const oldLiked = isLiked;
    const oldLikesCount = likesCount;

    setIsLiked(!oldLiked);
    setLikesCount(oldLiked ? oldLikesCount - 1 : oldLikesCount + 1);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://www.whysocial.in/clap-kartel-reels-module/public/api/reels/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reel_id: reel.id.toString() })
      });
      const data = await res.json();
      if (data && data.status === false) {
        setIsLiked(oldLiked);
        setLikesCount(oldLikesCount);
      }
    } catch (_) {
      setIsLiked(oldLiked);
      setLikesCount(oldLikesCount);
    }
  };

  const videoSrc = reel.video_url?.startsWith('http')
    ? reel.video_url
    : `https://www.whysocial.in/clap-kartel-reels-module/public/${reel.video_url || reel.video}`;

  return (
    <div className="reel-item" onClick={handleTap}>
      {/* Video */}
      <video
        ref={videoRef}
        className="reel-video"
        src={videoSrc}
        loop
        playsInline
        preload="auto"
        poster={reel.thumbnail_url || reel.thumbnail}
      />

      {/* Sound Mute / Unmute Button Overlay */}
      <button 
        className="reel-mute-btn" 
        onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
        title={isMuted ? "Unmute Sound" : "Mute Sound"}
      >
        {isMuted ? <FaVolumeMute size={18} color="white" /> : <FaVolumeUp size={18} color="white" />}
      </button>

      {/* Buffering spinner — shown while video data is loading */}
      <AnimatePresence>
        {isBuffering && (
          <motion.div
            className="reel-buffer-spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="reel-spinner-ring" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play icon overlay — only show when paused AND not buffering */}
      <AnimatePresence>
        {!isPlaying && !isBuffering && (
          <motion.div
            className="reel-play-overlay"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.15 }}
          >
            <FaPlay />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Double-tap heart burst */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            className="reel-heart-burst"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1.4 }}
            exit={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 0.4 }}
          >
            <FaHeart />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right action bar */}
      <div className="reel-actions">
        {/* Like */}
        <div className="reel-action-item" onClick={(e) => { e.stopPropagation(); handleLike(); }}>
          <FaHeart size={26} color={isLiked ? '#ff3b5c' : 'white'} className={isLiked ? 'liked-icon' : ''} />
          <span>{likesCount}</span>
        </div>

        {/* Comment */}
        <div className="reel-action-item" onClick={(e) => { e.stopPropagation(); onOpenComments(reel); }}>
          <FaComment size={24} color="white" />
          <span>{reel.comments_count || 0}</span>
        </div>

        {/* Share */}
        <div className="reel-action-item" onClick={(e) => { e.stopPropagation(); onShare(reel); }}>
          <FaShare size={22} color="white" />
          <span>{reel.share_count || 0}</span>
        </div>

        {/* 3-dots Menu — shown when reel belongs to user, matching mobile */}
        {isOwner && (
          <div
            className="reel-action-item reel-more-btn-wrap"
            onClick={(e) => {
              e.stopPropagation();
              onOpenOptions(reel);
            }}
          >
            <div className="reel-more-btn" title="Options">
              <IoEllipsisVertical size={22} color="white" />
            </div>
            <div className="reel-more-tooltip">Options</div>
          </div>
        )}
      </div>

      {/* Bottom info */}
      <div className="reel-bottom-info">
        <div className="reel-user-row" onClick={(e) => { e.stopPropagation(); onNavigateProfile(reel); }} style={{ cursor: 'pointer' }}>
          <img
            className="reel-user-avatar"
            src={reel.user_profile_image
              ? (reel.user_profile_image.startsWith('http') ? reel.user_profile_image : `https://www.whysocial.in/clap-kartel/public/${reel.user_profile_image}`)
              : DEFAULT_AVATAR}
            alt={reel.uploader_name}
            onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
          />
          <span className="reel-username">@{reel.uploader_name || reel.user_name || 'anonymous'}</span>
        </div>
        {reel.title && (
          <p className="reel-title-text">{reel.title}</p>
        )}
        {reel.description && (
          <p className="reel-desc-text">{reel.description}</p>
        )}
        <span className="reel-views">{reel.views_count || 0} views</span>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Comments Bottom Sheet
// ──────────────────────────────────────────────
const CommentsSheet = ({ isOpen, reel, onClose, comments, loading, newText, setNewText, onPost }) => {
  return (
    <>
      {/* Dim overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="comments-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sheet itself */}
      <div className={`comments-sheet ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="comments-handle" />
        <div className="comments-header">
          <span className="comments-title">Comments</span>
          <button className="comments-close-btn" onClick={onClose}><IoClose size={22} /></button>
        </div>

        <div className="comments-list">
          {loading ? (
            <div className="comments-loading"><FaSpinner className="spin" /> Loading...</div>
          ) : comments.length === 0 ? (
            <div className="comments-empty">No comments yet. Be the first!</div>
          ) : (
            comments.map((c, i) => (
              <div className="comment-row" key={c.id || i}>
                <img
                  className="comment-avatar"
                  src={c.user_profile_image || DEFAULT_AVATAR}
                  alt={c.user_name}
                  onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                />
                <div className="comment-body">
                  <span className="comment-name">{c.user_name || 'Anonymous'}</span>
                  <p className="comment-text">{c.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="comments-input-row">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onPost()}
          />
          <button onClick={onPost} disabled={!newText.trim()}>Post</button>
        </div>
      </div>
    </>
  );
};

// ──────────────────────────────────────────────
// Reel Options Bottom Sheet (Matches Mobile Bottom Sheet)
// ──────────────────────────────────────────────
const ReelOptionsSheet = ({ isOpen, reel, onClose, onDeleteClick }) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="comments-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <div className={`reel-options-sheet ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="comments-handle" />
        <div className="reel-options-list">
          <button
            className="reel-option-item delete-option"
            onClick={() => {
              onClose();
              onDeleteClick(reel);
            }}
          >
            <FiTrash2 size={20} color="#ef4444" />
            <span style={{ color: '#ef4444', fontWeight: 600 }}>Delete Reel</span>
          </button>
          <button className="reel-option-item cancel-option" onClick={onClose}>
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </>
  );
};

// ──────────────────────────────────────────────
// Delete Reel Confirmation Modal (Matches Mobile Dialog)
// ──────────────────────────────────────────────
const DeleteReelModal = ({ isOpen, reel, onClose, onConfirm, isDeleting }) => {
  if (!isOpen || !reel) return null;
  return (
    <div className="upload-overlay" onClick={() => !isDeleting && onClose()}>
      <motion.div
        className="reel-delete-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="reel-delete-icon-wrap">
          <FiTrash2 size={32} color="#ef4444" />
        </div>
        <h3 className="reel-delete-title">Delete Reel?</h3>
        <p className="reel-delete-text">
          Are you sure you want to delete <strong>"{reel.title || 'this reel'}"</strong>?
        </p>
        <div className="reel-delete-actions">
          <button
            type="button"
            className="reel-delete-cancel-btn"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="reel-delete-confirm-btn"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <><FaSpinner className="spin" /> Deleting...</> : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Upload Modal
// ──────────────────────────────────────────────
const UploadModal = ({ isOpen, onClose, onSubmit, uploadData, setUploadData, onFileChange, isUploading }) => {
  if (!isOpen) return null;
  return (
    <div className="upload-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="upload-header">
          <h2>Upload Reel</h2>
          <button onClick={onClose}><IoClose size={22} /></button>
        </div>
        <form onSubmit={onSubmit} className="upload-form">
          <label>Title</label>
          <input type="text" required value={uploadData.title} onChange={(e) => setUploadData(p => ({ ...p, title: e.target.value }))} placeholder="Title" />
          <label>Description</label>
          <textarea required value={uploadData.description} onChange={(e) => setUploadData(p => ({ ...p, description: e.target.value }))} rows="3" placeholder="Description" />
          <label>Duration (seconds)</label>
          <input type="number" required value={uploadData.duration} onChange={(e) => setUploadData(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 15" />
          <label>Video File</label>
          <input type="file" accept="video/*" required onChange={onFileChange} />
          <button type="submit" className="upload-submit-btn" disabled={isUploading}>
            {isUploading ? <><FaSpinner className="spin" /> Uploading...</> : 'Upload Reel'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Main Reel Page
// ──────────────────────────────────────────────
const Reel = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const currentUserId = getCurrentUserId();

  // Hide the global Header / Navbar / Footer while on this page
  useEffect(() => {
    document.body.classList.add('reels-active');
    return () => document.body.classList.remove('reels-active');
  }, []);

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'my-reels'
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const reelsLengthRef = useRef(0);
  const [isMuted, setIsMuted] = useState(false); // Sound ON by default

  // Comments state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [activeReel, setActiveReel] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Options & Delete state (matches mobile bottom sheet + dialog)
  const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);
  const [selectedReelForOptions, setSelectedReelForOptions] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reelToDelete, setReelToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '', duration: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync refs
  useEffect(() => { activeIndexRef.current = activeIndex; }, [activeIndex]);
  useEffect(() => { reelsLengthRef.current = reels.length; }, [reels]);

  // ── Fetch reels ──
  useEffect(() => { fetchReels(activeTab); }, [activeTab]);

  const fetchReels = async (tab = activeTab) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = tab === 'my-reels'
        ? 'https://www.whysocial.in/clap-kartel-reels-module/public/api/reels/my-reels'
        : 'https://www.whysocial.in/clap-kartel-reels-module/public/api/reels/feed';

      const res = await fetch(endpoint, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      let list = [];
      if (data.status && data.data?.reels?.length) list = data.data.reels;
      else if (data.status && data.data?.data?.length) list = data.data.data;
      else if (data.status && Array.isArray(data.data) && data.data.length) list = data.data;
      else if (data.status && Array.isArray(data.reels) && data.reels.length) list = data.reels;
      else if (tab === 'feed') {
        list = [
          { id: 1, title: 'Demo Reel', uploader_name: 'demo_user', description: 'Scroll down for more #demo', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', likes_count: 42, comments_count: 5, views_count: 320 },
          { id: 2, title: 'Another Reel', uploader_name: 'filmmaker', description: 'Another great reel #bts', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', likes_count: 99, comments_count: 12, views_count: 780 },
        ];
      }
      setReels(list);
      setActiveIndex(0);
    } catch (_) { setReels([]); }
    finally { setLoading(false); }
  };

  // ── Delete Reel Handler (Matching Mobile API) ──
  const handleDeleteOptionClick = (reel) => {
    setReelToDelete(reel);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteReel = async () => {
    if (!reelToDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://www.whysocial.in/clap-kartel-reels-module/public/api/reels/${reelToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok || res.status === 200 || res.status === 204) {
        showToast('Reel deleted successfully!', 'success');
        setDeleteModalOpen(false);
        const deletedId = reelToDelete.id;
        setReelToDelete(null);
        setReels(prev => {
          const updated = prev.filter(r => r.id !== deletedId);
          if (activeIndex >= updated.length) {
            setActiveIndex(Math.max(0, updated.length - 1));
          }
          return updated;
        });
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Failed to delete reel', 'error');
      }
    } catch (e) {
      showToast('Error deleting reel', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Wheel scroll (desktop) — strictly one reel per scroll action ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isLocked = false;
    const releaseLock = () => { isLocked = false; };

    const scrollToReel = (idx) => {
      isLocked = true;
      container.scrollTo({ top: idx * container.clientHeight, behavior: 'smooth' });

      if ('onscrollend' in window) {
        container.addEventListener('scrollend', releaseLock, { once: true });
      } else {
        let lastTop = -1;
        let stableCount = 0;
        const poll = () => {
          if (container.scrollTop === lastTop) {
            stableCount++;
            if (stableCount >= 3) { releaseLock(); return; }
          } else {
            stableCount = 0;
            lastTop = container.scrollTop;
          }
          requestAnimationFrame(poll);
        };
        requestAnimationFrame(poll);
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      if (isLocked) return;
      if (Math.abs(e.deltaY) < 5) return;

      const cur = activeIndexRef.current;
      const len = reelsLengthRef.current;
      let next = cur;
      if (e.deltaY > 0 && cur < len - 1) next = cur + 1;
      else if (e.deltaY < 0 && cur > 0) next = cur - 1;

      if (next !== cur) scrollToReel(next);
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('scrollend', releaseLock);
    };
  }, []);

  // ── IntersectionObserver — track which reel is in view ──
  useEffect(() => {
    const slides = containerRef.current?.querySelectorAll('.reel-slide');
    if (!slides || slides.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = parseInt(entry.target.dataset.index, 10);
            if (!isNaN(idx) && idx !== activeIndexRef.current) {
              setActiveIndex(idx);
              activeIndexRef.current = idx;
              setCommentsOpen(false);
              setOptionsSheetOpen(false);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [reels]);

  // ── Comments ──
  const openComments = useCallback((reel) => {
    setActiveReel(reel);
    setCommentsOpen(true);
    fetchComments(reel.id);
  }, []);

  const closeComments = useCallback(() => {
    setCommentsOpen(false);
    setComments([]);
    setNewComment('');
  }, []);

  const fetchComments = async (reelId) => {
    setCommentsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://www.whysocial.in/clap-kartel-reels-module/public/api/reels/comments/${reelId}`, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setComments(data.status && data.data ? data.data : []);
    } catch (_) { setComments([]); }
    finally { setCommentsLoading(false); }
  };

  const postComment = async () => {
    if (!newComment.trim() || !activeReel) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://www.whysocial.in/clap-kartel-reels-module/public/api/reels/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reel_id: activeReel.id, comment: newComment.trim() })
      });
      const data = await res.json();
      if (data.status) {
        showToast('Comment posted!');
        setNewComment('');
        fetchComments(activeReel.id);
        setReels(prev => prev.map(r => r.id === activeReel.id ? { ...r, comments_count: (parseInt(r.comments_count) || 0) + 1 } : r));
      } else showToast('Failed to post comment', 'error');
    } catch (_) { showToast('Error posting comment', 'error'); }
  };

  // Set of reel IDs shared in this session to prevent duplicate spam
  const sharedReelsRef = useRef(new Set());

  // ── Share Callback ──
  const handleShare = useCallback(async (reel) => {
    const reelUrl = `${window.location.origin}/reels?reelId=${reel.id}`;
    if (navigator.share) {
      navigator.share({
        title: reel.title || 'ClapKartel Reel',
        text: reel.description || 'Check out this reel on ClapKartel!',
        url: reelUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(reelUrl).then(() => {
        showToast('Reel link copied to clipboard!');
      }).catch(() => {
        showToast('Failed to copy link', 'error');
      });
    }

    // Prevent duplicate API calls if the user already shared this reel in the current session
    if (sharedReelsRef.current.has(reel.id)) {
      return;
    }
    sharedReelsRef.current.add(reel.id);

    // Call mobile-matching share count API
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://www.whysocial.in/clap-kartel-reels-module/public/api/reels/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reel_id: parseInt(reel.id, 10) })
      });
      const data = await res.json();
      if (data && data.status) {
        const newCount = data.data?.share_count ?? ((parseInt(reel.share_count, 10) || 0) + 1);
        setReels(prev => prev.map(r => r.id === reel.id ? { ...r, share_count: newCount } : r));
      }
    } catch (_) {}
  }, []);

  // ── Profile Navigation Callback ──
  const handleNavigateProfile = useCallback(async (reel) => {
    const userId = reel.user_id || reel.userId;
    if (!userId) {
      showToast('User profile details unavailable', 'error');
      return;
    }
    try {
      const res = await fetch(`https://www.whysocial.in/clap-kartel/public/api/get-user-profession?user_id=${userId}`);
      const data = await res.json();
      if (data.status && data.data && data.data.length > 0 && data.data[0].sub_cat_id) {
        navigate('/user-profile', { state: { sub_cat_id: data.data[0].sub_cat_id, user_id: userId } });
      } else {
        navigate('/user-profile', { state: { user_id: userId } });
      }
    } catch (_) {
      navigate('/user-profile', { state: { user_id: userId } });
    }
  }, [navigate]);

  // ── Keyboard Arrow Navigation ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (commentsOpen || uploadOpen || deleteModalOpen || optionsSheetOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const cur = activeIndexRef.current;
        const len = reelsLengthRef.current;
        if (cur < len - 1) {
          const next = cur + 1;
          containerRef.current?.scrollTo({ top: next * containerRef.current.clientHeight, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const cur = activeIndexRef.current;
        if (cur > 0) {
          const next = cur - 1;
          containerRef.current?.scrollTo({ top: next * containerRef.current.clientHeight, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commentsOpen, uploadOpen, deleteModalOpen, optionsSheetOpen]);

  // ── Upload ──
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    const vid = document.createElement('video');
    vid.preload = 'metadata';
    vid.src = URL.createObjectURL(file);
    vid.onloadedmetadata = () => {
      URL.revokeObjectURL(vid.src);
      setUploadData(p => ({ ...p, duration: Math.round(vid.duration).toString() }));
    };
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) { showToast('Select a video first', 'error'); return; }
    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('title', uploadData.title);
      fd.append('description', uploadData.description);
      fd.append('duration', uploadData.duration);
      fd.append('video', uploadFile);
      const res = await fetch('https://www.whysocial.in/clap-kartel-reels-module/public/api/reels/upload', {
        method: 'POST', headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }, body: fd
      });
      const data = await res.json();
      if (data.status || res.ok) {
        showToast('Reel uploaded!');
        setUploadOpen(false);
        setUploadData({ title: '', description: '', duration: '' });
        setUploadFile(null);
        fetchReels(activeTab);
      } else showToast(data.message || 'Upload failed', 'error');
    } catch (_) { showToast('Upload error', 'error'); }
    finally { setIsUploading(false); }
  };

  // ── Render ──
  if (loading) {
    return (
      <div className="reels-loading-screen">
        <FaSpinner className="spin" size={32} />
        <p>Loading Reels...</p>
      </div>
    );
  }

  return (
    <div className="reels-page">
      {/* Top bar */}
      <div className="reels-topbar">
        <button className="reels-back-btn" onClick={() => navigate('/')}><IoArrowBack size={22} /></button>
        <div className="reels-tabs">
          <button
            className={`reels-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            Explore
          </button>
          <button
            className={`reels-tab-btn ${activeTab === 'my-reels' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-reels')}
          >
            My Reels
          </button>
        </div>
        <button className="reels-upload-topbar-btn" onClick={() => setUploadOpen(true)} title="Upload Reel"><FaPlus size={18} /></button>
      </div>

      {/* Full-screen scroll container */}
      <div className="reels-feed" ref={containerRef}>
        {reels.length === 0 ? (
          <div className="reels-empty-screen">
            <div style={{ textAlign: 'center' }}>
              <FiVideo size={48} style={{ color: '#bf8906', marginBottom: 12 }} />
              <p style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
                {activeTab === 'my-reels' ? 'No uploaded reels yet' : 'No reels yet'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>
                {activeTab === 'my-reels' ? 'Upload your first reel to share your talent!' : 'Check back later for new reels!'}
              </p>
              {activeTab === 'my-reels' && (
                <button
                  className="reels-upload-empty-btn"
                  onClick={() => setUploadOpen(true)}
                >
                  <FaPlus size={14} /> Upload Reel
                </button>
              )}
            </div>
          </div>
        ) : (
          reels.map((reel, i) => {
            const isOwner = activeTab === 'my-reels' || (
              currentUserId && (
                String(reel.user_id) === String(currentUserId) ||
                String(reel.userId) === String(currentUserId) ||
                String(reel.uploader_id) === String(currentUserId)
              )
            );

            return (
              <div className="reel-slide" key={reel.id || i} data-index={i}>
                {/* Desktop: centered 9:16 card with sidebar */}
                <div className="reel-slide-inner">
                  <div className="reel-card">
                    <ReelItem
                      reel={reel}
                      isActive={i === activeIndex}
                      isMuted={isMuted}
                      onToggleMute={() => setIsMuted(p => !p)}
                      onOpenComments={openComments}
                      onShare={handleShare}
                      onNavigateProfile={handleNavigateProfile}
                      onOpenOptions={(r) => {
                        setSelectedReelForOptions(r);
                        setOptionsSheetOpen(true);
                      }}
                      isOwner={isOwner}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Comments sheet (portal-like, rendered at root of reels-page) */}
      <CommentsSheet
        isOpen={commentsOpen}
        reel={activeReel}
        onClose={closeComments}
        comments={comments}
        loading={commentsLoading}
        newText={newComment}
        setNewText={setNewComment}
        onPost={postComment}
      />

      {/* Options sheet (matching mobile 3-dots bottom sheet) */}
      <ReelOptionsSheet
        isOpen={optionsSheetOpen}
        reel={selectedReelForOptions}
        onClose={() => setOptionsSheetOpen(false)}
        onDeleteClick={handleDeleteOptionClick}
      />

      {/* Delete Confirmation Modal (matching mobile AlertDialog) */}
      <DeleteReelModal
        isOpen={deleteModalOpen}
        reel={reelToDelete}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteReel}
        isDeleting={isDeleting}
      />

      {/* Upload modal */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleUpload}
        uploadData={uploadData}
        setUploadData={setUploadData}
        onFileChange={handleFileChange}
        isUploading={isUploading}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`reels-toast ${toast.type}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reel;
