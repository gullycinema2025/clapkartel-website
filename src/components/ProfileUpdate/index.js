import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';
import importIcon from '../../assets/import-image-icon.svg';
import deleteIcon from '../../assets/delete-image-icon.svg';

const ProfileUpdate = () => {
    const navigate = useNavigate();
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';

    // Form state
    const [formData, setFormData] = useState({
        regId: '',
        userCategory: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        userSecondNumber: '',
        gender: '',
        userCountry: '',
        userStateList: '',
        userCity: '',
        userZipcode: '',
        userAddress: '',
        userSocialLinkInsta: '',
        userSocialLinkYoutube: '',
        userSocialLinkFace: '',
        userBudgetType: 'Negotiable',
        userBudget: '',
        userBio: '',
        userAbout: '',
        userAge: '',
        userHeight: '',
        userProfileprivacy: '0',
        userProfileClaim: '1', // Changed from userAccountType
        experience: '',
        userProfileImage: null
    });

    // Location dropdown states
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Image previews
    const [imagePreview, setImagePreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    // Message popup state
    const [showMessage, setShowMessage] = useState(false);
    const [messageContent, setMessageContent] = useState({ type: '', text: '' });

    // Helper function to display message popup
    const displayMessage = (type, text) => {
        setMessageContent({ type, text });
        setShowMessage(true);
        setTimeout(() => {
            setShowMessage(false);
        }, 3000);
    };

    // Helper function to get authorization headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Fetch countries on component mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoadingCountries(true);
                const response = await fetch(`${BASE_URL}/api/locations`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch countries: ${response.status}`);
                }

                const result = await response.json();

                if (result?.type === 'countries' && result?.data && Array.isArray(result.data)) {
                    setCountries(result.data);
                } else if (result?.data && Array.isArray(result.data)) {
                    setCountries(result.data);
                } else if (Array.isArray(result)) {
                    setCountries(result);
                }
            } catch (err) {
                console.error('Error fetching countries:', err);
            } finally {
                setLoadingCountries(false);
            }
        };

        fetchCountries();
    }, []);

    // Fetch states when country is selected
    useEffect(() => {
        if (!formData.userCountry) {
            setStates([]);
            setFormData(prev => ({ ...prev, userStateList: '', userCity: '' }));
            setCities([]);
            return;
        }

        const fetchStates = async () => {
            try {
                setLoadingStates(true);
                setStates([]);

                const response = await fetch(`${BASE_URL}/api/locations?country_id=${formData.userCountry}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch states: ${response.status}`);
                }

                const result = await response.json();

                if (result?.type === 'states' && result?.data && Array.isArray(result.data)) {
                    setStates(result.data);
                } else if (result?.data && Array.isArray(result.data)) {
                    setStates(result.data);
                } else if (Array.isArray(result)) {
                    setStates(result);
                }
            } catch (err) {
                console.error('Error fetching states:', err);
                setStates([]);
            } finally {
                setLoadingStates(false);
            }
        };

        fetchStates();
    }, [formData.userCountry]);

    // Fetch cities when state is selected
    useEffect(() => {
        if (!formData.userStateList) {
            setCities([]);
            setFormData(prev => ({ ...prev, userCity: '' }));
            return;
        }

        const fetchCities = async () => {
            try {
                setLoadingCities(true);
                setCities([]);

                const response = await fetch(`${BASE_URL}/api/locations?state_id=${formData.userStateList}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch cities: ${response.status}`);
                }

                const result = await response.json();

                if (result?.type === 'cities' && result?.data && Array.isArray(result.data)) {
                    setCities(result.data);
                } else if (result?.data && Array.isArray(result.data)) {
                    setCities(result.data);
                } else if (Array.isArray(result)) {
                    setCities(result);
                }
            } catch (err) {
                console.error('Error fetching cities:', err);
                setCities([]);
            } finally {
                setLoadingCities(false);
            }
        };

        fetchCities();
    }, [formData.userStateList]);

    // Fetch existing profile data on component mount
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${BASE_URL}/userpro/getprofessionrecord`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch profile data: ${response.status}`);
                }

                const result = await response.json();

                if (result?.status === 'success' && result?.data && result.data.length > 0) {
                    const userData = result.data[0];

                    setFormData({
                        regId: userData.regId?.trim() || userData['regId ']?.trim() || '',
                        userCategory: userData.userCategory?.trim() || userData['userCategory ']?.trim() || '1',
                        fullName: userData.userName?.trim() || userData['userName ']?.trim() || '',
                        email: userData.userEmailid?.trim() || userData['userEmailid ']?.trim() || '',
                        phoneNumber: userData.userContact?.trim() || userData['userContact ']?.trim() || '',
                        userSecondNumber: userData.userSecondNumber || '',
                        gender: userData.gender || '',
                        userCountry: userData.userCountry || '',
                        userStateList: userData.userStateList || '',
                        userCity: userData.userCity || '',
                        userZipcode: userData.userZipcode || '',
                        userAddress: userData.userAddress || '',
                        userSocialLinkInsta: userData.userSocialLinkInsta || '',
                        userSocialLinkYoutube: userData.userSocialLinkYoutube || '',
                        userSocialLinkFace: userData.userSocialLinkFace || '',
                        userBudgetType: userData.userBudgetType || 'Negotiable',
                        userBudget: userData.userBudget || '',
                        userBio: userData.userBio || '',
                        userAbout: userData.userAbout || '',
                        userAge: userData.userAge || '',
                        userHeight: userData.userHeight || '',
                        userProfileprivacy: userData.userProfileprivacy || '0',
                        userProfileClaim: userData.userProfileClaim || '1', // Changed from userAccountType
                        experience: userData.experience || '',
                        userProfileImage: null
                    });

                    if (userData.userProfileImage) {
                        const imageUrl = userData.userProfileImage.startsWith('http')
                            ? userData.userProfileImage
                            : `${BASE_URL}/${userData.userProfileImage}`;
                        setImagePreview(imageUrl);
                    }
                } else {
                    throw new Error('No profile data found');
                }
            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle privacy button clicks
    const handlePrivacyClick = (value) => {
        setFormData(prev => ({
            ...prev,
            userProfileprivacy: value
        }));
    };

    // Handle account type button clicks (userProfileClaim)
    const handleAccountTypeClick = (value) => {
        setFormData(prev => ({
            ...prev,
            userProfileClaim: value // Changed from userAccountType
        }));
    };

    // Handle profile image file selection
    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                displayMessage('error', 'Please select a valid image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                displayMessage('error', 'Image size should be less than 5MB');
                return;
            }

            setFormData(prev => ({
                ...prev,
                userProfileImage: file
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle banner image change
    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                displayMessage('error', 'Please select a valid image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                displayMessage('error', 'Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setBannerPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle delete profile image
    const handleDeleteProfileImage = () => {
        setImagePreview(null);
        setFormData(prev => ({
            ...prev,
            userProfileImage: null
        }));
    };

    // Handle delete banner
    const handleDeleteBanner = () => {
        setBannerPreview(null);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.email || !formData.phoneNumber) {
            displayMessage('error', 'Please fill in all required fields (Name, Email, Phone Number)');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            displayMessage('error', 'Please enter a valid email address');
            return;
        }

        setSubmitting(true);
        const token = localStorage.getItem('token');
        let basicInfoUpdated = false;
        let professionalInfoUpdated = false;

        try {
            // Update Basic User Info
            const basicInfoData = new FormData();
            basicInfoData.append('fullName', formData.fullName);
            basicInfoData.append('email', formData.email);
            basicInfoData.append('phoneNumber', formData.phoneNumber);

            const basicResponse = await fetch(`${BASE_URL}/user/updateprofile`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: basicInfoData
            });

            let basicResponseText = await basicResponse.text();

            if (basicResponse.ok) {
                basicInfoUpdated = true;
            }

            // Update Professional Info
            const professionalData = new FormData();

            professionalData.append('regId', formData.regId);
            professionalData.append('userCategory', formData.userCategory || '1');
            professionalData.append('userSecondNumber', formData.userSecondNumber || '');

            // Gender: send as integer (1 for Male, 2 for Female)
            if (formData.gender) {
                professionalData.append('gender', formData.gender);
            }

            if (formData.userCountry) professionalData.append('userCountry', formData.userCountry);
            if (formData.userStateList) professionalData.append('userStateList', formData.userStateList);
            if (formData.userCity) professionalData.append('userCity', formData.userCity);
            professionalData.append('userZipcode', formData.userZipcode || '');
            professionalData.append('userAddress', formData.userAddress || '');
            professionalData.append('userSocialLinkInsta', formData.userSocialLinkInsta || '');
            professionalData.append('userSocialLinkYoutube', formData.userSocialLinkYoutube || '');
            professionalData.append('userSocialLinkFace', formData.userSocialLinkFace || '');
            professionalData.append('userBudgetType', formData.userBudgetType || '');
            professionalData.append('userBudget', formData.userBudget || '');
            professionalData.append('userBio', formData.userBio || '');
            professionalData.append('userAbout', formData.userAbout || '');
            professionalData.append('userAge', formData.userAge || '');
            professionalData.append('userHeight', formData.userHeight || '');
            professionalData.append('userProfileprivacy', formData.userProfileprivacy);

            // Changed from userAccountType to userProfileClaim
            professionalData.append('userProfileClaim', formData.userProfileClaim);

            professionalData.append('experience', formData.experience || '');

            if (formData.userProfileImage) {
                professionalData.append('userProfileImage', formData.userProfileImage);
            }

            const professionalResponse = await fetch(`${BASE_URL}/userpro/updateuserprofession/${formData.regId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: professionalData
            });

            let professionalResponseText = await professionalResponse.text();
            professionalResponseText = professionalResponseText.replace(/^\d+\s*/, '');

            if (professionalResponse.ok) {
                professionalInfoUpdated = true;
            } else {
                try {
                    const errorData = JSON.parse(professionalResponseText);
                    if (errorData.messages) {
                        const errors = Object.values(errorData.messages).join(', ');
                        throw new Error(`Professional info update failed: ${errors}`);
                    }
                    throw new Error(`Professional info update failed: ${professionalResponseText}`);
                } catch (parseError) {
                    if (parseError.message.includes('Professional info update failed')) {
                        throw parseError;
                    }
                    throw new Error(`Professional info update failed: ${professionalResponseText}`);
                }
            }

            if (basicInfoUpdated || professionalInfoUpdated) {
                let successMessage = 'Profile updated successfully!';
                if (basicInfoUpdated && !professionalInfoUpdated) {
                    successMessage = 'Basic information updated successfully!';
                } else if (!basicInfoUpdated && professionalInfoUpdated) {
                    successMessage = 'Professional information updated successfully!';
                }

                displayMessage('success', successMessage);
                setTimeout(() => {
                    navigate('/profile');
                }, 1500);
            } else {
                throw new Error('Failed to update profile');
            }

        } catch (err) {
            console.error('Error updating profile:', err);
            displayMessage('error', `Failed to update profile: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="pu-main-container">
                <div className="pu-loading-wrapper">
                    <div className="pu-loading-spinner"></div>
                    <p>Loading profile data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="pu-main-container">
                <div className="pu-error-wrapper">
                    <p className="pu-error-text">Error: {error}</p>
                    <button onClick={() => navigate('/profile')} className="pu-back-btn">
                        Back to Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pu-main-container">
            {/* Header */}
            <div className="pu-header-section">
                <h1 className="pu-page-title">Edit Profile</h1>
                <button
                    onClick={handleSubmit}
                    className="pu-save-btn"
                    disabled={submitting}
                >
                    {submitting ? 'Saving...' : 'Save'}
                </button>
            </div>

            {/* Grid Layout */}
            <form onSubmit={handleSubmit}>
                <div className="pu-content-grid">
                    {/* ROW 1 - LEFT: Privacy Setting + Cover & Profile Pic */}
                    <div className="pu-card-wrapper">
                        {/* Privacy Setting */}
                        <div className="pu-privacy-card">
                            <h3 className="pu-privacy-title">Privacy Setting</h3>
                            <div className="pu-privacy-toggle">
                                <button
                                    type="button"
                                    className={`pu-privacy-btn ${formData.userProfileprivacy === '0' ? 'pu-privacy-public-active' : ''}`}
                                    onClick={() => handlePrivacyClick('0')}
                                >
                                    Public
                                </button>
                                <button
                                    type="button"
                                    className={`pu-privacy-btn ${formData.userProfileprivacy === '1' ? 'pu-privacy-private-active' : ''}`}
                                    onClick={() => handlePrivacyClick('1')}
                                >
                                    Private
                                </button>
                            </div>
                        </div>

                        {/* Holder Account Type */}
                        <div className="pu-privacy-card" style={{ marginTop: '20px' }}>
                            <h3 className="pu-privacy-title">Holder Account Type</h3>
                            <div className="pu-privacy-toggle">
                                <button
                                    type="button"
                                    className={`pu-privacy-btn ${formData.userProfileClaim === '1' ? 'pu-privacy-public-active' : ''}`}
                                    onClick={() => handleAccountTypeClick('1')}
                                >
                                    Personal Account
                                </button>
                                <button
                                    type="button"
                                    className={`pu-privacy-btn ${formData.userProfileClaim === '2' ? 'pu-privacy-private-active' : ''}`}
                                    onClick={() => handleAccountTypeClick('2')}
                                >
                                    Business Account
                                </button>
                            </div>
                        </div>

                        {/* Cover & Profile Pic */}
                        <div className="pu-cover-profile-card">
                            <h3 className="pu-cover-title">Cover & Profile Pic</h3>

                            {/* Banner Image */}
                            <div className="pu-banner-container">
                                {bannerPreview ? (
                                    <img src={bannerPreview} alt="Banner" className="pu-banner-img" />
                                ) : (
                                    <p className="pu-banner-placeholder">Min. image size: 1920x335 pixels</p>
                                )}

                                <div className="pu-banner-icons">
                                    <label className="pu-icon-btn pu-import-icon">
                                        <img src={importIcon} alt="Import" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleBannerChange}
                                            className="pu-file-input-hidden"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        className="pu-icon-btn pu-delete-icon"
                                        onClick={handleDeleteBanner}
                                    >
                                        <img src={deleteIcon} alt="Delete" />
                                    </button>
                                </div>
                            </div>

                            {/* Profile Image Section */}
                            <div className="pu-profile-section">
                                <div className="pu-profile-img-wrapper">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Profile"
                                            className="pu-profile-img"
                                        />
                                    ) : (
                                        <div className="pu-profile-img pu-profile-placeholder">
                                            <span>No Image</span>
                                        </div>
                                    )}

                                    <div className="pu-profile-icons">
                                        <label className="pu-icon pu-upload-icon">
                                            <img src={importIcon} alt="Upload" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfileImageChange}
                                                className="pu-file-input-hidden"
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            className="pu-icon pu-delete-profile-icon"
                                            onClick={handleDeleteProfileImage}
                                        >
                                            <img src={deleteIcon} alt="Delete" />
                                        </button>
                                    </div>
                                </div>

                                <p className="pu-profile-hint">Min. image size: 275x275 pixels</p>
                            </div>
                        </div>
                    </div>

                    {/* ROW 1 - RIGHT: Basic Information */}
                    <div className="pu-card-wrapper">
                        <h3>Basic Information</h3>

                        <div className="pu-form-field">
                            <label>Full Name*</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="pu-form-input"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="pu-form-field">
                            <label>Email*</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="pu-form-input"
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>

                        <div className="pu-form-field">
                            <label>Phone Number*</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="pu-form-input"
                                placeholder="1234567890"
                                required
                            />
                        </div>

                        <div className="pu-form-field">
                            <label>Secondary Phone Number</label>
                            <input
                                type="tel"
                                name="userSecondNumber"
                                value={formData.userSecondNumber}
                                onChange={handleInputChange}
                                className="pu-form-input"
                                placeholder="Secondary contact number"
                            />
                        </div>

                        <div className="pu-form-field">
                            <label>Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="pu-form-select"
                            >
                                <option value="">Select Gender</option>
                                <option value="1">Male</option>
                                <option value="2">Female</option>
                            </select>
                        </div>

                        <div className="pu-form-field">
                            <label>Age Range</label>
                            <select
                                name="userAge"
                                value={formData.userAge}
                                onChange={handleInputChange}
                                className="pu-form-select"
                            >
                                <option value="">Select Age Range</option>
                                <option value="1-10 year">1-10 year</option>
                                <option value="11-20 year">11-20 year</option>
                                <option value="21-30 year">21-30 year</option>
                                <option value="31-40 year">31-40 year</option>
                                <option value="41-50 year">41-50 year</option>
                                <option value="51-60 year">51-60 year</option>
                                <option value="61-70 year">61-70 year</option>
                                <option value="71-80 year">71-80 year</option>
                                <option value="81-90 year">81-90 year</option>
                                <option value="91-100 year">91-100 year</option>
                            </select>
                        </div>

                        <div className="pu-form-field">
                            <label>Height (in feet)</label>
                            <input
                                type="text"
                                name="userHeight"
                                value={formData.userHeight}
                                onChange={handleInputChange}
                                className="pu-form-input"
                                placeholder="e.g., 5.8"
                            />
                        </div>

                        <div className="pu-form-field">
                            <label>Experience</label>
                            <input
                                type="text"
                                name="experience"
                                value={formData.experience}
                                onChange={handleInputChange}
                                className="pu-form-input"
                                placeholder="e.g., 5 years"
                            />
                        </div>
                    </div>

                    {/* ROW 2 - LEFT: Location */}
                    <div className="pu-card-wrapper">
                        <h3>Location</h3>

                        <div className="pu-form-field">
                            <label>Country</label>
                            <select
                                name="userCountry"
                                value={formData.userCountry}
                                onChange={handleInputChange}
                                className="pu-form-select"
                                disabled={loadingCountries}
                            >
                                <option value="">
                                    {loadingCountries ? 'Loading Countries...' : 'Select Country'}
                                </option>
                                {countries.map((country) => (
                                    <option key={country.id} value={country.id}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pu-form-field">
                            <label>State</label>
                            <select
                                name="userStateList"
                                value={formData.userStateList}
                                onChange={handleInputChange}
                                className="pu-form-select"
                                disabled={!formData.userCountry || loadingStates}
                            >
                                <option value="">
                                    {!formData.userCountry
                                        ? 'Select Country First'
                                        : loadingStates
                                            ? 'Loading States...'
                                            : states.length === 0
                                                ? 'No States Available'
                                                : 'Select State'}
                                </option>
                                {states.map((state) => (
                                    <option key={state.id} value={state.id}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pu-form-field">
                            <label>City</label>
                            <select
                                name="userCity"
                                value={formData.userCity}
                                onChange={handleInputChange}
                                className="pu-form-select"
                                disabled={!formData.userStateList || loadingCities}
                            >
                                <option value="">
                                    {!formData.userStateList
                                        ? 'Select State First'
                                        : loadingCities
                                            ? 'Loading Cities...'
                                            : cities.length === 0
                                                ? 'No Cities Available'
                                                : 'Select City'}
                                </option>
                                {cities.map((city) => (
                                    <option key={city.id} value={city.id}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pu-form-field">
                            <label>Pincode</label>
                            <input
                                type="text"
                                name="userZipcode"
                                value={formData.userZipcode}
                                onChange={handleInputChange}
                                className="pu-form-input"
                                placeholder="Postal code"
                            />
                        </div>

                        <div className="pu-form-field">
                            <label>Address</label>
                            <textarea
                                name="userAddress"
                                value={formData.userAddress}
                                onChange={handleInputChange}
                                className="pu-form-textarea"
                                placeholder="Your complete address"
                            />
                        </div>
                    </div>

                    {/* ROW 2 - RIGHT: Social Media & Budget Container */}
                    <div>
                        {/* Social Media Card */}
                        <div className="pu-card-wrapper">
                            <h3>Social Media</h3>

                            <div className="pu-form-field">
                                <label>Instagram</label>
                                <input
                                    type="text"
                                    name="userSocialLinkInsta"
                                    value={formData.userSocialLinkInsta}
                                    onChange={handleInputChange}
                                    className="pu-form-input"
                                    placeholder="Include Profile URL"
                                />
                            </div>

                            <div className="pu-form-field">
                                <label>Youtube</label>
                                <input
                                    type="text"
                                    name="userSocialLinkYoutube"
                                    value={formData.userSocialLinkYoutube}
                                    onChange={handleInputChange}
                                    className="pu-form-input"
                                    placeholder="Include Profile URL"
                                />
                            </div>

                            <div className="pu-form-field">
                                <label>Facebook</label>
                                <input
                                    type="text"
                                    name="userSocialLinkFace"
                                    value={formData.userSocialLinkFace}
                                    onChange={handleInputChange}
                                    className="pu-form-input"
                                    placeholder="Include Profile URL"
                                />
                            </div>
                        </div>

                        {/* Budget Card */}
                        <div className="pu-card-wrapper" style={{ marginTop: '20px' }}>
                            <h3>Budget</h3>

                            <div className="pu-form-field">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <label style={{ margin: 0, minWidth: 'fit-content' }}>Budget Type</label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="userBudgetType"
                                            value="Negotiable"
                                            checked={formData.userBudgetType === 'Negotiable'}
                                            onChange={handleInputChange}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <span>Negotiable</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="userBudgetType"
                                            value="Fixed"
                                            checked={formData.userBudgetType === 'Fixed'}
                                            onChange={handleInputChange}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <span>Fixed</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pu-form-field">
                                <label>Budget Amount</label>
                                <input
                                    type="text"
                                    name="userBudget"
                                    value={formData.userBudget}
                                    onChange={handleInputChange}
                                    className="pu-form-input"
                                    placeholder="Enter budget amount"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ROW 3 - LEFT: Your Bio */}
                    <div className="pu-card-wrapper">
                        <h3>Your Bio</h3>

                        <div className="pu-form-field">
                            <label>Bio</label>
                            <textarea
                                name="userBio"
                                value={formData.userBio}
                                onChange={handleInputChange}
                                className="pu-form-textarea"
                                placeholder="Tell us about yourself in brief"
                            />
                        </div>
                    </div>

                    {/* ROW 3 - RIGHT: About You */}
                    <div className="pu-card-wrapper">
                        <h3>About You</h3>

                        <div className="pu-form-field">
                            <label>About</label>
                            <textarea
                                name="userAbout"
                                value={formData.userAbout}
                                onChange={handleInputChange}
                                className="pu-form-textarea"
                                placeholder="Detailed information about yourself"
                            />
                        </div>
                    </div>
                </div>
            </form>

            {/* Message Popup */}
            <AnimatePresence>
                {showMessage && (
                    <motion.div
                        className={`pu-message-popup ${messageContent.type === 'success' ? 'pu-message-success' : 'pu-message-error'}`}
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span className="pu-message-icon">
                            {messageContent.type === 'success' ? '✓' : '✕'}
                        </span>
                        <span className="pu-message-text">{messageContent.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileUpdate;