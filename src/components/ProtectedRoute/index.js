import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * 
 * A wrapper component that protects routes from unauthorized access.
 * It checks for the presence of an access_token in localStorage.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactNode} - Returns children if authenticated, otherwise redirects to login
 */
const ProtectedRoute = ({ children }) => {
    /**
     * Check if user is authenticated by verifying the presence of access_token
     * The token is stored in localStorage with key 'token' after successful login
     */
    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        return token !== null && token !== undefined && token !== '';
    };

    /**
     * If user is not authenticated, redirect to login page
     * The 'replace' prop ensures the login page replaces the current entry in history
     * This prevents users from navigating back to protected pages using browser back button
     */
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    /**
     * If authenticated, render the protected component
     */
    return children;
};

export default ProtectedRoute;
