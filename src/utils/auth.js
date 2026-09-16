/**
 * Authentication Utilities
 * Handles inconsistent localStorage keys used across different login flows
 */

/**
 * Get the current user's ID from localStorage
 * Checks multiple possible keys: 'userData', 'user', and 'userid'
 * @returns {string|null} The user ID or null if not found
 */
export const getCurrentUserId = () => {
    // 1. Check 'userData' (Set by LoginPassword.js)
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const parsedData = JSON.parse(userData);
            const id = parsedData.user_id || parsedData.id || parsedData.userId;
            if (id) return String(id);
        } catch (error) {
            console.error('Error parsing userData:', error);
        }
    }

    // 2. Check 'user' (Used by legacy/other components)
    const user = localStorage.getItem('user');
    if (user) {
        try {
            const parsedData = JSON.parse(user);
            const id = parsedData.user_id || parsedData.id || parsedData.userId;
            if (id) return String(id);
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }

    // 3. Check 'userid' (Set by OTPVerification.js)
    const userid = localStorage.getItem('userid');
    if (userid) return String(userid);

    return null;
};

/**
 * Check if a user is currently logged in
 * @returns {boolean} True if a token and user ID exist
 */
export const isUserLoggedIn = () => {
    const token = localStorage.getItem('token');
    const userId = getCurrentUserId();
    return !!(token && userId);
};

/**
 * Get authorization headers for API requests
 * @returns {Object} Headers object with Authorization Bearer token
 */
export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};
