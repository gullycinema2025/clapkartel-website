import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoText from "../../assets/Clap kartel Logo White.svg";
import SearchIcon from "../../assets/searchVector.png";
import { getCurrentUserId, getAuthHeaders } from "../../utils/auth";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
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
import "../../components/Header/index.css";
import "../../components/Navbar/index.css";
import './index.css';

const UsersPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

    // Close drawer on page navigation
    useEffect(() => {
        setIsDrawerOpen(false);
    }, [location.pathname]);

    // Data states
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search state (from header search bar)
    const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || '');

    // ── Filter panel state ──────────────────────────────────────────────────────
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    // Location data
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // Selected (staged — not yet applied)
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [countrySearch, setCountrySearch] = useState('');
    const [stateSearch, setStateSearch] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [filteredStates, setFilteredStates] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    // Applied (triggers re-fetch)
    const [appliedCountry, setAppliedCountry] = useState('');
    const [appliedState, setAppliedState] = useState('');
    const [appliedCity, setAppliedCity] = useState('');
    const [appliedCountryName, setAppliedCountryName] = useState('');
    const [appliedStateName, setAppliedStateName] = useState('');
    const [appliedCityName, setAppliedCityName] = useState('');

    const filterPanelRef = useRef(null);
    // ───────────────────────────────────────────────────────────────────────────

    // Sync search query from navigation state when location changes
    useEffect(() => {
        if (location.state?.searchQuery !== undefined) {
            setSearchQuery(location.state.searchQuery);
        }
    }, [location.state]);

    // Message popup state
    const [showMessage, setShowMessage] = useState(false);
    const [messageContent, setMessageContent] = useState({ type: '', text: '' });

    // Notification Unread Count state
    const [unreadCount, setUnreadCount] = useState(0);

    // User Profile state for header
    const [userData, setUserData] = useState(null);

    // Helper function to display message popup
    const displayMessage = (type, text) => {
        setMessageContent({ type, text });
        setShowMessage(true);
        setTimeout(() => {
            setShowMessage(false);
        }, 3000);
    };



    // Handle search from header
    const handleHeaderSearch = () => {
        navigate('/users', { state: { searchQuery: searchQuery.trim() } });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleHeaderSearch();
    };

    // Fetch Notification Unread Count
    useEffect(() => {
        const userId = getCurrentUserId();
        if (!userId) return;
        const notifRef = collection(db, 'notifications', userId, 'user_notifications');
        const unreadQuery = query(notifRef, where('isRead', '==', false));
        const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
            setUnreadCount(snapshot.docs.length);
        });
        return () => unsubscribe();
    }, []);

    // Fetch User Profile Data for Header
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
                console.error('Error fetching user data in UsersPage:', err);
            }
        };

        fetchUserData();
    }, [location.pathname]);


    // ── Fetch Countries on mount ────────────────────────────────────────────────
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoadingCountries(true);
                const response = await fetch(`${BASE_URL}/api/locations`, { method: 'GET', headers: getAuthHeaders() });
                if (!response.ok) throw new Error();
                const result = await response.json();
                const data = result?.data && Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
                setCountries(data);
            } catch (err) {
                console.error('Error fetching countries:', err);
            } finally {
                setLoadingCountries(false);
            }
        };
        fetchCountries();
    }, []);

    // Fetch States when country changes
    useEffect(() => {
        if (!selectedCountry) { setStates([]); setSelectedState(''); setStateSearch(''); setCities([]); setSelectedCity(''); setCitySearch(''); return; }
        const fetchStates = async () => {
            try {
                setLoadingStates(true); setStates([]);
                const response = await fetch(`${BASE_URL}/api/locations?country_id=${selectedCountry}`, { method: 'GET', headers: getAuthHeaders() });
                if (!response.ok) throw new Error();
                const result = await response.json();
                const data = result?.data && Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
                setStates(data);
            } catch (err) { console.error('Error fetching states:', err); setStates([]); }
            finally { setLoadingStates(false); }
        };
        fetchStates();
    }, [selectedCountry]);

    // Fetch Cities when state changes
    useEffect(() => {
        if (!selectedState) { setCities([]); setSelectedCity(''); setCitySearch(''); return; }
        const fetchCities = async () => {
            try {
                setLoadingCities(true); setCities([]);
                const response = await fetch(`${BASE_URL}/api/locations?state_id=${selectedState}`, { method: 'GET', headers: getAuthHeaders() });
                if (!response.ok) throw new Error();
                const result = await response.json();
                const data = result?.data && Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
                setCities(data);
            } catch (err) { console.error('Error fetching cities:', err); setCities([]); }
            finally { setLoadingCities(false); }
        };
        fetchCities();
    }, [selectedState]);

    // Filter dropdown lists by search text
    useEffect(() => { setFilteredCountries(countrySearch.trim() === '' ? countries : countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))); }, [countrySearch, countries]);
    useEffect(() => { setFilteredStates(stateSearch.trim() === '' ? states : states.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase()))); }, [stateSearch, states]);
    useEffect(() => { setFilteredCities(citySearch.trim() === '' ? cities : cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()))); }, [citySearch, cities]);
    // ───────────────────────────────────────────────────────────────────────────

    // Fetch all users — re-runs whenever applied filters change
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);

                // Build query params — same pattern as mobile app's ProfessionalProfilesProvider
                const params = new URLSearchParams();
                if (appliedCountry) params.set('country', appliedCountry);
                if (appliedState) params.set('state', appliedState);
                if (appliedCity) params.set('city', appliedCity);

                const queryString = params.toString();
                const apiUrl = `${BASE_URL}/api/getAllUsersList${queryString ? '?' + queryString : ''}`;

                console.log('Fetching users from:', apiUrl);

                const response = await fetch(apiUrl, { method: 'GET', headers: getAuthHeaders() });
                const result = await response.json();
                if (result.userList) {
                    setUsers(result.userList);
                } else {
                    setUsers([]);
                }
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [appliedCountry, appliedState, appliedCity]);

    // Filter users based on search query (client-side, after API results)
    useEffect(() => {
        let filtered = [...users];
        if (searchQuery.trim() !== '') {
            filtered = filtered.filter(user =>
                user.userName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setFilteredUsers(filtered);
    }, [users, searchQuery]);

    // Close dropdowns when clicking outside the filter panel
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (filterPanelRef.current && !filterPanelRef.current.contains(e.target)) {
                setShowCountryDropdown(false);
                setShowStateDropdown(false);
                setShowCityDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    // Get image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://placehold.co/120?text=No+Image';
        return `${BASE_URL}/${imagePath}`;
    };

    // ── Filter handlers ─────────────────────────────────────────────────────────
    const handleCountrySelect = (country) => {
        setSelectedCountry(country.id);
        setCountrySearch(country.name);
        setShowCountryDropdown(false);
        setSelectedState(''); setSelectedCity('');
        setStateSearch(''); setCitySearch('');
        setStates([]); setCities([]);
    };
    const handleStateSelect = (state) => {
        setSelectedState(state.id);
        setStateSearch(state.name);
        setShowStateDropdown(false);
        setSelectedCity(''); setCitySearch(''); setCities([]);
    };
    const handleCitySelect = (city) => {
        setSelectedCity(city.id);
        setCitySearch(city.name);
        setShowCityDropdown(false);
    };

    const handleApplyFilters = () => {
        setAppliedCountry(selectedCountry);
        setAppliedState(selectedState);
        setAppliedCity(selectedCity);
        setAppliedCountryName(countrySearch);
        setAppliedStateName(stateSearch);
        setAppliedCityName(citySearch);
        setShowFilterPanel(false);
    };

    const handleClearFilters = () => {
        setSelectedCountry(''); setSelectedState(''); setSelectedCity('');
        setCountrySearch(''); setStateSearch(''); setCitySearch('');
        setStates([]); setCities([]);
        setShowCountryDropdown(false); setShowStateDropdown(false); setShowCityDropdown(false);
        setAppliedCountry(''); setAppliedState(''); setAppliedCity('');
        setAppliedCountryName(''); setAppliedStateName(''); setAppliedCityName('');
    };

    const isFilterActive = !!(appliedCountry || appliedState || appliedCity);
    // ───────────────────────────────────────────────────────────────────────────

    // Handle Follow/Unfollow action
    const handleFollowToggle = async (user) => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) { displayMessage('error', 'Please login to follow users'); return; }
        if (user.is_wishlist === "1") { displayMessage('info', `You are already following ${user.userName}`); return; }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/wish/addtowishlist`, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUserId, pro_reg_id: user.userId }),
            });
            const result = await response.json();
            if (result.status === 'success' || response.ok) {
                setUsers(users.map(u => u.userId === user.userId ? { ...u, is_wishlist: "1" } : u));
                displayMessage('success', `You are now following ${user.userName}`);

                // Real-time Follow Notification write to Firestore
                try {
                    const senderName = localStorage.getItem('name_key') || 'A User';
                    const senderImage = localStorage.getItem('userProfileImage') || '';
                    let subcatId = '';
                    const userDataStr = localStorage.getItem('userData');
                    if (userDataStr) {
                        const parsed = JSON.parse(userDataStr);
                        subcatId = parsed.sub_cat_id || parsed.initial_sub_cat_id || parsed.initial_subcat_id || '';
                    }

                    const notifRef = collection(db, 'notifications', user.userId, 'user_notifications');
                    await addDoc(notifRef, {
                        title: senderName,
                        message: `${senderName} added you to their wishlist!`,
                        timestamp: serverTimestamp(),
                        senderId: currentUserId,
                        senderImage: senderImage,
                        receiverId: user.userId,
                        type: 'wishlist',
                        subcatId: subcatId,
                        isRead: false
                    });
                    console.log("📌 Follow notification sent in real-time to receiver!");
                } catch (notifErr) {
                    console.error("Failed to write follow notification to Firestore:", notifErr);
                }
            } else {
                displayMessage('error', 'Failed to follow user');
            }
        } catch (err) {
            console.error('Error following user:', err);
            displayMessage('error', 'Failed to follow user. Please try again.');
        }
    };

    // Handle Message action
    const handleMessage = (user) => {
        navigate('/messages', {
            state: { peerId: user.userId, peerName: user.userName, peerImage: getImageUrl(user.userProfileImage), subCatId: user.sub_cat_id || '' }
        });
    };

    // Handle user card click
    const handleUserClick = (user) => {
        navigate('/user-profile', { state: { sub_cat_id: user.sub_cat_id, user_id: user.userId } });
    };

    // Helper functions for header profile
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

    // Render Header (embedded)
    const renderHeader = () => (
        <div className="header-container">
            <img src={logoText} alt="logoText" className="header-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
            <div className="header-search-wrapper">
                <input
                    type="text"
                    className="header-search-input"
                    placeholder="Search users by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <img src={SearchIcon} alt="searchVector" className="header-search-icon" onClick={handleHeaderSearch} style={{ cursor: 'pointer' }} />
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

    const getActiveStyle = (path) => location.pathname === path ? { color: '#BF8906', fontWeight: 'bold' } : {};

    // Render Navbar (embedded)
    const renderNavbar = () => (
        <div className="navbar-container">
            <ul className="navbar-left-menu">
                <li style={location.pathname === '/craft-detail' && location.state?.categoryId === '13' ? { color: '#BF8906', fontWeight: 'bold' } : {}}
                    onClick={() => navigate('/craft-detail', { state: { categoryId: '13', categoryName: 'Cast & Crew' } })}>Cast &amp; Crew</li>
                <li style={getActiveStyle('/other-section-detail')} onClick={() => navigate('/other-section-detail', { state: { sectionId: '181', sectionName: 'Lessons', sectionImage: 'dailyNews.png' } })}>Lessons</li>
                <li style={location.pathname === '/' && location.state?.scrollToRentals ? { color: '#BF8906', fontWeight: 'bold' } : {}} onClick={() => navigate('/', { state: { scrollToRentals: true } })}>Rentals</li>
                <li style={getActiveStyle('/directory')} onClick={() => navigate('/directory')}>Directory</li>
                <li style={getActiveStyle('/craft')} onClick={() => navigate('/craft')}>24 Crafts</li>
                <li style={getActiveStyle('/other-section')} onClick={() => navigate('/other-section')}>Other Sections</li>
            </ul>
            <ul className="navbar-right-menu">
                <li style={getActiveStyle('/users')} onClick={() => navigate('/users')}>Users</li>
                <li style={getActiveStyle('/followers')} onClick={() => navigate('/followers')}>Followers</li>
                <li style={getActiveStyle('/reels')} onClick={() => navigate('/reels')}>Reels</li>
            </ul>
        </div>
    );

    if (loading) {
        return (
            <>
                {renderHeader()}
                {renderNavbar()}
                <div className="users-page">
                    <h1 className="users-title">All Users</h1>
                    <div className="users-container">
                        <p style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                {renderHeader()}
                {renderNavbar()}
                <div className="users-page">
                    <h1 className="users-title">All Users</h1>
                    <div className="users-container">
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Embedded Header */}
            {renderHeader()}

            {/* Embedded Navbar */}
            {renderNavbar()}

            <div className="users-page">
                {/* ── Title + Filter Bar ───────────────────────────────────────── */}
                <div className="users-title-row">
                    <h1 className="users-title">All Users ({filteredUsers.length})</h1>

                    <div className="users-filter-bar">
                        {/* Active filter chips */}
                        {isFilterActive && (
                            <div className="filter-chips">
                                {appliedCountryName && <span className="filter-chip">📍 {appliedCountryName}</span>}
                                {appliedStateName && <span className="filter-chip">{appliedStateName}</span>}
                                {appliedCityName && <span className="filter-chip">{appliedCityName}</span>}
                                <button className="filter-chip-clear" onClick={handleClearFilters} title="Clear all filters">✕ Clear</button>
                            </div>
                        )}

                        {/* Filter button */}
                        <button
                            className={`users-filter-btn${isFilterActive ? ' filter-btn-active' : ''}`}
                            onClick={() => setShowFilterPanel(prev => !prev)}
                            title="Filter by location"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="4" y1="6" x2="20" y2="6" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                                <line x1="11" y1="18" x2="13" y2="18" />
                            </svg>
                            Filters
                            {isFilterActive && <span className="filter-badge">●</span>}
                        </button>
                    </div>
                </div>

                {/* ── Filter Panel (slide-in) ──────────────────────────────────── */}
                <AnimatePresence>
                    {showFilterPanel && (
                        <motion.div
                            className="users-filter-panel"
                            ref={filterPanelRef}
                            initial={{ opacity: 0, y: -12, scaleY: 0.97 }}
                            animate={{ opacity: 1, y: 0, scaleY: 1 }}
                            exit={{ opacity: 0, y: -8, scaleY: 0.97 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                        >
                            <div className="filter-panel-header">
                                <span className="filter-panel-title">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#BF8906" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                    Filter by Location
                                </span>
                                <button className="filter-panel-close" onClick={() => setShowFilterPanel(false)}>✕</button>
                            </div>

                            <div className="filter-panel-dropdowns">
                                {/* Country */}
                                <div className="filter-dropdown-wrap">
                                    <label className="filter-label">Country</label>
                                    <div className="search-input-wrapper">
                                        <input
                                            type="text"
                                            className="filter-search-input"
                                            placeholder={loadingCountries ? 'Loading...' : 'Select country'}
                                            value={countrySearch}
                                            onChange={(e) => { setCountrySearch(e.target.value); setShowCountryDropdown(true); }}
                                            onFocus={() => setShowCountryDropdown(true)}
                                            disabled={loadingCountries}
                                        />
                                        {countrySearch && (
                                            <button className="clear-search-btn" onClick={() => { setCountrySearch(''); setSelectedCountry(''); setSelectedState(''); setSelectedCity(''); setStateSearch(''); setCitySearch(''); setStates([]); setCities([]); setShowCountryDropdown(false); }}>×</button>
                                        )}
                                        {showCountryDropdown && filteredCountries.length > 0 && (
                                            <div className="search-dropdown">
                                                {filteredCountries.map(c => (
                                                    <div key={c.id} className="dropdown-item" onClick={() => handleCountrySelect(c)}>{c.name}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* State */}
                                <div className="filter-dropdown-wrap">
                                    <label className="filter-label">State</label>
                                    <div className="search-input-wrapper">
                                        <input
                                            type="text"
                                            className="filter-search-input"
                                            placeholder={!selectedCountry ? 'Select country first' : loadingStates ? 'Loading...' : 'Select state'}
                                            value={stateSearch}
                                            onChange={(e) => { setStateSearch(e.target.value); setShowStateDropdown(true); }}
                                            onFocus={() => { if (selectedCountry) setShowStateDropdown(true); }}
                                            disabled={!selectedCountry || loadingStates}
                                        />
                                        {stateSearch && (
                                            <button className="clear-search-btn" onClick={() => { setStateSearch(''); setSelectedState(''); setSelectedCity(''); setCitySearch(''); setCities([]); setShowStateDropdown(false); }}>×</button>
                                        )}
                                        {showStateDropdown && filteredStates.length > 0 && (
                                            <div className="search-dropdown">
                                                {filteredStates.map(s => (
                                                    <div key={s.id} className="dropdown-item" onClick={() => handleStateSelect(s)}>{s.name}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* City */}
                                <div className="filter-dropdown-wrap">
                                    <label className="filter-label">City</label>
                                    <div className="search-input-wrapper">
                                        <input
                                            type="text"
                                            className="filter-search-input"
                                            placeholder={!selectedState ? 'Select state first' : loadingCities ? 'Loading...' : 'Select city'}
                                            value={citySearch}
                                            onChange={(e) => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                                            onFocus={() => { if (selectedState) setShowCityDropdown(true); }}
                                            disabled={!selectedState || loadingCities}
                                        />
                                        {citySearch && (
                                            <button className="clear-search-btn" onClick={() => { setCitySearch(''); setSelectedCity(''); setShowCityDropdown(false); }}>×</button>
                                        )}
                                        {showCityDropdown && filteredCities.length > 0 && (
                                            <div className="search-dropdown">
                                                {filteredCities.map(c => (
                                                    <div key={c.id} className="dropdown-item" onClick={() => handleCitySelect(c)}>{c.name}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="filter-panel-actions">
                                <button
                                    className="clear-filters-btn"
                                    onClick={handleClearFilters}
                                    disabled={!selectedCountry && !selectedState && !selectedCity && !appliedCountry}
                                >
                                    Clear
                                </button>
                                <button
                                    className="apply-filters-btn"
                                    onClick={handleApplyFilters}
                                    disabled={!selectedCountry && !appliedCountry}
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* ──────────────────────────────────────────────────────────────── */}

                <div className="users-grid">
                    {filteredUsers.length === 0 ? (
                        <div className="no-users-found">
                            <p className="no-users-message">
                                {isFilterActive
                                    ? 'No users found for the selected location'
                                    : searchQuery
                                        ? 'No users found matching your search'
                                        : 'No users found'}
                            </p>
                            {(searchQuery || isFilterActive) && (
                                <button
                                    className="clear-all-filters-btn"
                                    onClick={() => { setSearchQuery(''); handleClearFilters(); }}
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredUsers.filter(user => user.userId && user.userName && user.userName.trim() !== '').map((user) => (
                            <motion.div
                                key={user.userId}
                                className="user-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div
                                    className="user-card-image"
                                    onClick={() => handleUserClick(user)}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {user.userProfileImage ? (
                                        <img
                                            src={getImageUrl(user.userProfileImage)}
                                            alt={user.userName}
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                        />
                                    ) : null}
                                    <div
                                        className="user-card-fallback-avatar"
                                        style={{
                                            display: user.userProfileImage ? 'none' : 'flex',
                                            width: '100%', height: '100%', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #FE5908, #f54800)',
                                            color: '#fff', fontFamily: 'Sen, sans-serif',
                                            fontSize: '36px', fontWeight: '700',
                                            alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        {user.userName?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                </div>

                                <div className="user-card-info" onClick={() => handleUserClick(user)} style={{ cursor: 'pointer' }}>
                                    <h3 className="user-name">{user.userName}</h3>
                                    {user.sub_cat_name && <p className="user-category">{user.sub_cat_name}</p>}
                                    {!user.sub_cat_name && <p className="user-category" style={{ color: '#999' }}>No category</p>}
                                </div>

                                <div className="user-card-actions">
                                    {String(user.userId) === localStorage.getItem('userid') ? (
                                        <span className="you-badge" style={{ padding: '6px 16px', background: '#f5f5f5', borderRadius: '20px', color: '#888', fontSize: '13px', fontWeight: 'bold', border: '1px solid #ddd', cursor: 'default' }}>
                                            You
                                        </span>
                                    ) : (
                                        <>
                                            {user.is_wishlist === "1" ? (
                                                <button className="following-btn" onClick={() => handleFollowToggle(user)} title="Following">Following</button>
                                            ) : (
                                                <button className="follow-btn" onClick={() => handleFollowToggle(user)} title="Follow">Follow</button>
                                            )}
                                            <button className="message-btn" onClick={() => handleMessage(user)} title="Message">Message</button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Message Popup */}
                <AnimatePresence>
                    {showMessage && (
                        <motion.div
                            className={`message-popup ${messageContent.type === 'success' ? 'message-success' : messageContent.type === 'error' ? 'message-error' : 'message-info'}`}
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="message-icon">
                                {messageContent.type === 'success' ? '✓' : messageContent.type === 'error' ? '✕' : 'ℹ'}
                            </span>
                            <span className="message-text">{messageContent.text}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default UsersPage;
