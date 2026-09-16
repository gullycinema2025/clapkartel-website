import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { ApiConstants } from '../../utils/apiConstants';
import './index.css';

const AccountSettings = () => {
    const navigate = useNavigate();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', isSuccess: false });

    const handleLogout = () => {
        try {
            signOut(auth);
        } catch (_) { }

        localStorage.clear();
        sessionStorage.clear();
        window.location.replace(window.location.origin + '/login');
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setStatusModal({
                    show: true,
                    title: "Session Expired",
                    message: "Session expired. Please login again.",
                    isSuccess: true
                });
                return;
            }

            // MultipartRequest matching Flutter implementation
            const formData = new FormData();
            formData.append('status', '0');

            const response = await fetch(`${ApiConstants.baseUrl}/user/deleteuser`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            /* console.log('Delete User Status Code:', response.status); */
            setShowDeleteModal(false);

            if (response.status === 200 || response.ok) {
                const result = await response.json().catch(() => null);
                setStatusModal({
                    show: true,
                    title: "Account Deleted",
                    message: result?.message || result?.messages?.success || "User deactivated successfully.",
                    isSuccess: true
                });
            } else {
                const result = await response.json().catch(() => null);
                const errMsg = result?.message || result?.messages?.error || result?.error || "Failed to delete account. Please try again.";
                setStatusModal({
                    show: true,
                    title: "Error",
                    message: errMsg,
                    isSuccess: false
                });
            }
        } catch (error) {
            /* console.error("Delete User Error:", error); */
            setShowDeleteModal(false);
            setStatusModal({
                show: true,
                title: "Error",
                message: "An error occurred while deleting account. Please try again.",
                isSuccess: false
            });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="settings-page-wrapper">
            {/* Header Area */}
            <div className="settings-header">
                <span className="settings-back-arrow" onClick={() => navigate(-1)}>‹</span>
                <h1 className="settings-title">Account Settings</h1>
            </div>

            <div className="settings-container-card">
                {/* Profile & Password Section */}
                <div className="settings-section">
                    <h2 className="settings-section-title">Settings</h2>

                    {/* Edit Profile */}
                    <div className="settings-item-card" onClick={() => navigate('/profileupate')}>
                        <div className="settings-item-left">
                            <span className="settings-icon">👤</span>
                            <span className="settings-item-text">Edit Profile</span>
                        </div>
                        <span className="settings-arrow">›</span>
                    </div>

                    {/* Change Password */}
                    <div className="settings-item-card" onClick={() => navigate('/change-password')}>
                        <div className="settings-item-left">
                            <span className="settings-icon">🔑</span>
                            <span className="settings-item-text">Change Password</span>
                        </div>
                        <span className="settings-arrow">›</span>
                    </div>

                    {/* Notifications Toggle */}
                    <div className="settings-item-card toggle-card">
                        <div className="settings-item-left">
                            <span className="settings-icon">🔔</span>
                            <span className="settings-item-text">Notifications</span>
                        </div>
                        <div
                            className={`settings-toggle ${notificationsEnabled ? 'active' : ''}`}
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        >
                            <div className="settings-toggle-circle"></div>
                        </div>
                    </div>
                </div>

                {/* App Information Section */}
                <div className="settings-section">
                    <h2 className="settings-section-title">App Info</h2>

                    {/* Privacy Policy */}
                    <div className="settings-item-card" onClick={() => navigate('/privacy-policy')}>
                        <div className="settings-item-left">
                            <span className="settings-icon">🛡️</span>
                            <span className="settings-item-text">Privacy Policy</span>
                        </div>
                        <span className="settings-arrow">›</span>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="settings-item-card" onClick={() => navigate('/terms-conditions')}>
                        <div className="settings-item-left">
                            <span className="settings-icon">📄</span>
                            <span className="settings-item-text">Terms &amp; Conditions</span>
                        </div>
                        <span className="settings-arrow">›</span>
                    </div>

                    {/* Help & Support */}
                    <div className="settings-item-card" onClick={() => navigate('/support')}>
                        <div className="settings-item-left">
                            <span className="settings-icon">❓</span>
                            <span className="settings-item-text">Help &amp; Support</span>
                        </div>
                        <span className="settings-arrow">›</span>
                    </div>

                    {/* About App */}
                    <div className="settings-item-card" onClick={() => navigate('/about-app')}>
                        <div className="settings-item-left">
                            <span className="settings-icon">ℹ️</span>
                            <span className="settings-item-text">About App</span>
                        </div>
                        <span className="settings-arrow">›</span>
                    </div>
                </div>

                {/* Account Actions Section */}
                <div className="settings-section">
                    <h2 className="settings-section-title">Account</h2>

                    {/* Logout */}
                    <div className="settings-item-card" onClick={() => setShowLogoutModal(true)}>
                        <div className="settings-item-left">
                            <span className="settings-icon">🚪</span>
                            <span className="settings-item-text">Logout</span>
                        </div>
                        <span className="settings-arrow">›</span>
                    </div>

                    {/* Delete Account */}
                    <div className="settings-item-card delete-card" onClick={() => setShowDeleteModal(true)}>
                        <div className="settings-item-left">
                            <span className="settings-icon text-red">🗑️</span>
                            <span className="settings-item-text text-red">Delete Account</span>
                        </div>
                        <span className="settings-arrow text-red">›</span>
                    </div>
                </div>

                <div className="settings-version-footer">
                    Version 1.0.0
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="settings-modal-backdrop" onClick={() => setShowLogoutModal(false)}>
                    <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="settings-modal-title">Logout</h3>
                        <p className="settings-modal-text">Are you sure you want to logout?</p>
                        <div className="settings-modal-actions">
                            <button className="settings-modal-btn cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            <button className="settings-modal-btn confirm-logout" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <div className="settings-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
                    <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="settings-modal-title">Delete Account</h3>
                        <p className="settings-modal-text">Are you sure you want to permanently delete your account?</p>
                        <div className="settings-modal-actions">
                            <button className="settings-modal-btn cancel" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</button>
                            <button className="settings-modal-btn confirm-delete" onClick={handleDeleteAccount} disabled={deleting}>
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status / Message Popup Modal */}
            {statusModal.show && (
                <div
                    className="settings-modal-backdrop"
                    onClick={() => {
                        if (statusModal.isSuccess) handleLogout();
                        else setStatusModal(prev => ({ ...prev, show: false }));
                    }}
                >
                    <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className={`settings-status-icon ${statusModal.isSuccess ? 'success' : 'error'}`}>
                            {statusModal.isSuccess ? '✓' : '!'}
                        </div>
                        <h3 className="settings-modal-title">{statusModal.title}</h3>
                        <p className="settings-modal-text">{statusModal.message}</p>
                        <div className="settings-modal-actions">
                            <button
                                className="settings-modal-btn confirm-logout"
                                onClick={() => {
                                    if (statusModal.isSuccess) {
                                        handleLogout();
                                    } else {
                                        setStatusModal(prev => ({ ...prev, show: false }));
                                    }
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountSettings;
