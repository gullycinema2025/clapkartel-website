import { useNavigate, useLocation } from 'react-router-dom';
import logoText from "../../assets/Clap kartel Logo White.svg";
import SearchIcon from "../../assets/searchVector.png";
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getCurrentUserId } from '../../utils/auth';
import {
  Menu,
  X,
  Film,
  BookOpen,
  Key,
  Folder,
  Briefcase,
  Grid,
  Users,
  UserPlus,
  MessageSquare,
  Bell,
  Settings,
  User as UserIcon,
  Play
} from 'lucide-react';
import "./index.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    const notifRef = collection(db, 'notifications', userId, 'user_notifications');
    const unreadQuery = query(notifRef, where('isRead', '==', false));

    const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [location.pathname]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('https://www.whysocial.in/clap-kartel/public/userpro/getprofessionrecord', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result?.status === 'success' && result?.data && result.data.length > 0) {
            setUserData(result.data[0]);
          }
        }
      } catch (err) {
        /* console.error('Error fetching user data in Header:', err); */
      }
    };

    fetchUserData();
  }, [location.pathname]);

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `https://www.whysocial.in/clap-kartel/public/${imagePath}`;
  };

  const getProfileInitials = (name) => {
    if (!name) return 'U';
    const trimmed = name.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return trimmed[0]?.toUpperCase() || 'U';
  };

  const getHeaderActiveStyle = (path) => {
    return location.pathname === path ? { color: '#FFDC26', fontWeight: 'bold' } : {};
  };


  // Close drawer on page navigation
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Logout logic removed, now handled in Settings -> Account Settings

  /**
   * Handle search - Navigate to users page with search query
   */
  const handleSearch = () => {
    navigate('/users', {
      state: { searchQuery: searchQuery.trim() }
    });
  };

  /**
   * Handle Enter key press in search input
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const menuItems = [
    {
      label: 'Cast & Crew',
      path: '/craft-detail',
      icon: Film,
      state: { categoryId: '13', categoryName: 'Cast & Crew' }
    },
    {
      label: 'Lessons',
      path: '/other-section-detail',
      icon: BookOpen,
      state: { sectionId: '181', sectionName: 'Lessons', sectionImage: 'dailyNews.png' }
    },
    { label: 'Rentals', path: '/', icon: Key, state: { scrollToRentals: true } },
    { label: 'Directory', path: '/directory', icon: Folder },
    { label: '24 Crafts', path: '/craft', icon: Briefcase },
    { label: 'Other Sections', path: '/other-section', icon: Grid },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'Followers', path: '/followers', icon: UserPlus },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Reels', path: '/reels', icon: Play },
    { label: 'Notifications', path: '/notification', icon: Bell, showBadge: true },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Profile', path: '/profile', icon: UserIcon }
  ];

  const handleMenuItemClick = (item) => {
    setIsDrawerOpen(false);
    if (item.state) {
      navigate(item.path, { state: item.state });
    } else {
      navigate(item.path);
    }
  };

  const isItemActive = (item) => {
    if (item.path === '/') {
      return location.pathname === '/' && location.state?.scrollToRentals;
    }
    if (item.state && item.state.categoryId) {
      return location.pathname === item.path && location.state?.categoryId === item.state.categoryId;
    }
    if (item.state && item.state.sectionId) {
      return location.pathname === item.path && location.state?.sectionId === item.state.sectionId;
    }
    return location.pathname === item.path;
  };

  return (
    <div className="header-container">
      <img
        src={logoText}
        alt="logoText"
        className="header-logo"
        onClick={() => navigate('/')}
      />
      <div className="header-search-wrapper">
        <input
          type="text"
          className="header-search-input"
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => navigate('/users')}
        />
        <img
          src={SearchIcon}
          alt="searchVector"
          className="header-search-icon"
          onClick={handleSearch}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Desktop Header Menu */}
      <ul className="header-right-menu">
        <li style={getHeaderActiveStyle('/messages')} onClick={() => navigate('/messages')}>Messages</li>
        <li style={getHeaderActiveStyle('/notification')} onClick={() => navigate('/notification')}>
          Notifications
          {unreadCount > 0 && (
            <span className="header-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </li>
        <li style={getHeaderActiveStyle('/settings')} onClick={() => navigate('/settings')}>Settings</li>
        <li style={getHeaderActiveStyle('/profile')} onClick={() => navigate('/profile')}>
          <div className="header-profile-wrapper">
            <span>Profile</span>
            {userData?.userProfileImage ? (
              <img
                src={getProfileImageUrl(userData.userProfileImage)}
                alt="Profile"
                className="header-profile-logo"
              />
            ) : (
              <div className="header-profile-initials">
                {getProfileInitials(userData?.userName || userData?.['userName '])}
              </div>
            )}
          </div>
        </li>
      </ul>

      {/* Hamburger button for mobile/tablet */}
      <button
        className="header-hamburger-button"
        onClick={() => setIsDrawerOpen(true)}
        aria-label="Open Navigation Drawer"
      >
        <Menu size={26} color="#FFDC26" />
      </button>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div className={`mobile-drawer-panel ${isDrawerOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <img
            src={logoText}
            alt="logoText"
            className="drawer-logo"
            onClick={() => {
              setIsDrawerOpen(false);
              navigate('/');
            }}
          />
          <button
            className="drawer-close-button"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close Navigation Drawer"
          >
            <X size={26} color="#FFDC26" />
          </button>
        </div>

        <div className="mobile-drawer-content">
          <ul className="mobile-drawer-menu">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const activeClass = isItemActive(item) ? 'active' : '';
              return (
                <li
                  key={item.label}
                  className={`mobile-drawer-item ${activeClass}`}
                  onClick={() => handleMenuItemClick(item)}
                >
                  <IconComponent size={20} className="drawer-item-icon" />
                  <span className="drawer-item-label">{item.label}</span>
                  {item.showBadge && unreadCount > 0 && (
                    <span className="drawer-badge">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;