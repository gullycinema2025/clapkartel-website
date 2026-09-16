import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoCarousel from '../VideoCarousel';
import Carousel from '../Carousel';
import './index.css';

const CastingPage = () => {
    const navigate = useNavigate();

    const handleUserClick = (user) => {
        navigate('/user-profile', {
            state: {
                sub_cat_id: CASTING_SUBCATEGORY_ID,
                user_id: user.userId
            }
        });
    };

    // API Configuration
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
    const CASTING_SUBCATEGORY_ID = '92'; // Subcategory ID for Casting

    // State for API data
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [pageInfo, setPageInfo] = useState({
        name: 'Casting',
        description: 'Professionals who select actors for roles'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    // Search input states
    const [countrySearch, setCountrySearch] = useState('');
    const [stateSearch, setStateSearch] = useState('');
    const [citySearch, setCitySearch] = useState('');

    // Dropdown visibility states
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // Filtered lists
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [filteredStates, setFilteredStates] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);

    // Applied filter states (used for API calls)
    const [appliedCountry, setAppliedCountry] = useState('');
    const [appliedState, setAppliedState] = useState('');
    const [appliedCity, setAppliedCity] = useState('');

    // Helper function to get authorization headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Helper function to construct user profile image URL
    const getUserProfileImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        return `${BASE_URL}/${imagePath}`;
    };

    // Helper function to convert text to title case
    const toTitleCase = (text) => {
        if (!text) return '';
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Fetch countries
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

                // Handle the response structure: { type: "countries", data: [...] }
                if (result?.type === 'countries' && result?.data && Array.isArray(result.data)) {
                    setCountries(result.data);
                } else if (result?.data && Array.isArray(result.data)) {
                    setCountries(result.data);
                } else if (Array.isArray(result)) {
                    setCountries(result);
                } else {
                    console.error('Unexpected countries response format:', result);
                    setCountries([]);
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
        if (!selectedCountry) {
            setStates([]);
            setSelectedState('');
            setCities([]);
            setSelectedCity('');
            return;
        }

        const fetchStates = async () => {
            try {
                setLoadingStates(true);
                setStates([]);

                const response = await fetch(`${BASE_URL}/api/locations?country_id=${selectedCountry}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch states: ${response.status}`);
                }

                const result = await response.json();

                // Handle the response structure: { type: "states", data: [...] }
                if (result?.type === 'states' && result?.data && Array.isArray(result.data)) {
                    setStates(result.data);
                } else if (result?.data && Array.isArray(result.data)) {
                    setStates(result.data);
                } else if (Array.isArray(result)) {
                    setStates(result);
                } else {
                    console.error('Unexpected states response format:', result);
                    setStates([]);
                }
            } catch (err) {
                console.error('Error fetching states:', err);
                setStates([]);
            } finally {
                setLoadingStates(false);
            }
        };

        fetchStates();
    }, [selectedCountry]);

    // Fetch cities when state is selected
    useEffect(() => {
        if (!selectedState) {
            setCities([]);
            setSelectedCity('');
            return;
        }

        const fetchCities = async () => {
            try {
                setLoadingCities(true);
                setCities([]);

                const response = await fetch(`${BASE_URL}/api/locations?state_id=${selectedState}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch cities: ${response.status}`);
                }

                const result = await response.json();

                // Handle the response structure: { type: "cities", data: [...] }
                if (result?.type === 'cities' && result?.data && Array.isArray(result.data)) {
                    setCities(result.data);
                } else if (result?.data && Array.isArray(result.data)) {
                    setCities(result.data);
                } else if (Array.isArray(result)) {
                    setCities(result);
                } else {
                    console.error('Unexpected cities response format:', result);
                    setCities([]);
                }
            } catch (err) {
                console.error('Error fetching cities:', err);
                setCities([]);
            } finally {
                setLoadingCities(false);
            }
        };

        fetchCities();
    }, [selectedState]);

    // Filter countries based on search input
    useEffect(() => {
        if (countrySearch.trim() === '') {
            setFilteredCountries(countries);
        } else {
            const filtered = countries.filter(country =>
                country.name.toLowerCase().includes(countrySearch.toLowerCase())
            );
            setFilteredCountries(filtered);
        }
    }, [countrySearch, countries]);

    // Filter states based on search input
    useEffect(() => {
        if (stateSearch.trim() === '') {
            setFilteredStates(states);
        } else {
            const filtered = states.filter(state =>
                state.name.toLowerCase().includes(stateSearch.toLowerCase())
            );
            setFilteredStates(filtered);
        }
    }, [stateSearch, states]);

    // Filter cities based on search input
    useEffect(() => {
        if (citySearch.trim() === '') {
            setFilteredCities(cities);
        } else {
            const filtered = cities.filter(city =>
                city.name.toLowerCase().includes(citySearch.toLowerCase())
            );
            setFilteredCities(filtered);
        }
    }, [citySearch, cities]);


    // Fetch casting professionals based on applied filters
    useEffect(() => {
        const fetchCastingProfessionals = async () => {
            try {
                setLoading(true);
                setError(null);

                // Build API URL dynamically based on applied filters
                // Pattern: /getUserListBasedOnSubCat/{sub_cat_id}[/{country_id}][/{state_id}][/{city_id}]
                let apiUrl = `${BASE_URL}/api/getUserListBasedOnSubCat/${CASTING_SUBCATEGORY_ID}`;

                // Add filter parameters only if they are applied
                if (appliedCountry) {
                    apiUrl += `/${appliedCountry}`;

                    if (appliedState) {
                        apiUrl += `/${appliedState}`;

                        if (appliedCity) {
                            apiUrl += `/${appliedCity}`;
                        }
                    }
                }

                console.log('Fetching casting professionals from:', apiUrl);

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch casting professionals: ${response.status}`);
                }

                const result = await response.json();
                console.log('Casting Professionals List API Response:', result);

                if (result?.userList && Array.isArray(result.userList)) {
                    setUsers(result.userList);
                    setFilteredUsers(result.userList);
                } else {
                    setUsers([]);
                    setFilteredUsers([]);
                }

                if (result?.subcategoryName) {
                    setPageInfo({
                        name: result.subcategoryName,
                        description: result.subcategoryDes || ''
                    });
                }

            } catch (err) {
                console.error('Error fetching casting professionals:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCastingProfessionals();
    }, [appliedCountry, appliedState, appliedCity]);

    // Handle country search input change
    const handleCountrySearchChange = (e) => {
        const value = e.target.value;
        setCountrySearch(value);
        setShowCountryDropdown(true);
    };

    // Handle country selection from dropdown
    const handleCountrySelect = (country) => {
        setSelectedCountry(country.id);
        setCountrySearch(country.name);
        setShowCountryDropdown(false);

        // Reset state and city
        setSelectedState('');
        setSelectedCity('');
        setStateSearch('');
        setCitySearch('');
        setStates([]);
        setCities([]);
    };

    // Handle state search input change
    const handleStateSearchChange = (e) => {
        const value = e.target.value;
        setStateSearch(value);
        setShowStateDropdown(true);
    };

    // Handle state selection from dropdown
    const handleStateSelect = (state) => {
        setSelectedState(state.id);
        setStateSearch(state.name);
        setShowStateDropdown(false);

        // Reset city
        setSelectedCity('');
        setCitySearch('');
        setCities([]);
    };

    // Handle city search input change
    const handleCitySearchChange = (e) => {
        const value = e.target.value;
        setCitySearch(value);
        setShowCityDropdown(true);
    };

    // Handle city selection from dropdown
    const handleCitySelect = (city) => {
        setSelectedCity(city.id);
        setCitySearch(city.name);
        setShowCityDropdown(false);
    };

    // Apply selected filters
    const handleApplyFilters = () => {
        setAppliedCountry(selectedCountry);
        setAppliedState(selectedState);
        setAppliedCity(selectedCity);
    };

    // Clear all filters
    const handleClearFilters = () => {
        // Clear selected filters
        setSelectedCountry('');
        setSelectedState('');
        setSelectedCity('');
        setCountrySearch('');
        setStateSearch('');
        setCitySearch('');
        setStates([]);
        setCities([]);
        setShowCountryDropdown(false);
        setShowStateDropdown(false);
        setShowCityDropdown(false);

        // Clear applied filters (this will trigger API to fetch all casting professionals)
        setAppliedCountry('');
        setAppliedState('');
        setAppliedCity('');
    };

    // Loading state
    if (loading) {
        return (
            <div className="casting-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading casting professionals...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="casting-page">
                <h1 className="casting-title">{pageInfo.name}</h1>
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
        <>
            {/* Breadcrumb Navigation */}
            <div className="breadcrumb-container">
                <div className="breadcrumb-nav">
                    <span className="breadcrumb-item breadcrumb-link" onClick={() => navigate('/')}>
                        Home
                    </span>
                    <span className="breadcrumb-separator">→</span>
                    <span className="breadcrumb-item breadcrumb-current">
                        Casting
                    </span>
                </div>
            </div>

            {/* Video Carousel - Full Width */}
            <VideoCarousel />

            {/* Carousel Banner - Full Width */}
            <Carousel />

            {/* Filters and Casting - Constrained Width */}
            <div className="casting-page">
                {/* Filter Section */}
                <div className="filter-section">
                    <div className="filter-container">
                        {/* Country Filter */}
                        <div className="filter-item">
                            <div className="search-input-wrapper">
                                <input
                                    type="text"
                                    className="filter-search-input"
                                    placeholder={loadingCountries ? 'Loading Countries...' : 'Search Country'}
                                    value={countrySearch}
                                    onChange={handleCountrySearchChange}
                                    onFocus={() => setShowCountryDropdown(true)}
                                    disabled={loadingCountries}
                                />
                                {showCountryDropdown && filteredCountries.length > 0 && (
                                    <div className="search-dropdown">
                                        {filteredCountries.map((country) => (
                                            <div
                                                key={country.id}
                                                className="dropdown-item"
                                                onClick={() => handleCountrySelect(country)}
                                            >
                                                {country.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* State Filter */}
                        <div className="filter-item">
                            <div className="search-input-wrapper">
                                <input
                                    type="text"
                                    className="filter-search-input"
                                    placeholder={
                                        !selectedCountry
                                            ? 'Select Country First'
                                            : loadingStates
                                                ? 'Loading States...'
                                                : 'Search State'
                                    }
                                    value={stateSearch}
                                    onChange={handleStateSearchChange}
                                    onFocus={() => setShowStateDropdown(true)}
                                    disabled={!selectedCountry || loadingStates}
                                />
                                {showStateDropdown && filteredStates.length > 0 && (
                                    <div className="search-dropdown">
                                        {filteredStates.map((state) => (
                                            <div
                                                key={state.id}
                                                className="dropdown-item"
                                                onClick={() => handleStateSelect(state)}
                                            >
                                                {state.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* City Filter */}
                        <div className="filter-item">
                            <div className="search-input-wrapper">
                                <input
                                    type="text"
                                    className="filter-search-input"
                                    placeholder={
                                        !selectedState
                                            ? 'Select State First'
                                            : loadingCities
                                                ? 'Loading Cities...'
                                                : 'Search City'
                                    }
                                    value={citySearch}
                                    onChange={handleCitySearchChange}
                                    onFocus={() => setShowCityDropdown(true)}
                                    disabled={!selectedState || loadingCities}
                                />
                                {showCityDropdown && filteredCities.length > 0 && (
                                    <div className="search-dropdown">
                                        {filteredCities.map((city) => (
                                            <div
                                                key={city.id}
                                                className="dropdown-item"
                                                onClick={() => handleCitySelect(city)}
                                            >
                                                {city.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Apply Filters Button */}
                        {(selectedCountry || selectedState || selectedCity) && (
                            <button
                                className="apply-filters-btn"
                                onClick={handleApplyFilters}
                            >
                                Apply Filters
                            </button>
                        )}

                        {/* Clear Filters Button */}
                        {(selectedCountry || selectedState || selectedCity) && (
                            <button
                                className="clear-filters-btn"
                                onClick={handleClearFilters}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Title and Description */}
                <h1 className="casting-title">{pageInfo.name}</h1>

                {pageInfo.description && (
                    <p className="casting-description">{pageInfo.description}</p>
                )}

                {/* Casting Professionals Grid */}
                {filteredUsers.length === 0 ? (
                    <div className="empty-container">
                        <p className="empty-message">
                            {selectedCountry || selectedState || selectedCity
                                ? 'No casting professionals found matching the selected filters'
                                : 'No casting professionals found'}
                        </p>
                    </div>
                ) : (
                    <div className="casting-grid">
                        {filteredUsers.filter(user => user.userId && user.userName && user.userName.trim() !== '').map((user) => {
                            const userImgSrc = getUserProfileImageUrl(user.userProfileImage);

                            return (
                                <div
                                    key={user.userId}
                                    className="casting-item"
                                    onClick={() => handleUserClick(user)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="casting-image-wrapper">
                                        {user.userProfileImage ? (
                                            <img
                                                src={userImgSrc}
                                                alt={user.userName}
                                                className="casting-image"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                            />
                                        ) : null}
                                        <div
                                            className="casting-image casting-image-fallback"
                                            style={{ display: user.userProfileImage ? 'none' : 'flex' }}
                                        >
                                            {user.userName?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                    </div>
                                    <div className="casting-info">
                                        <p className="casting-name">{toTitleCase(user.userName)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default CastingPage;
