import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPhotoLibrary, MdDelete, MdCloudUpload, MdArrowBack, MdCheckCircle, MdClose, MdZoomIn } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const Gallery = () => {
    const navigate = useNavigate();
    const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';

    // State management
    const [images, setImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Success modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Image preview modal state
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Drag and drop state
    const [isDragging, setIsDragging] = useState(false);

    // Upload modal state
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Message popup state
    const [showMessage, setShowMessage] = useState(false);
    const [messageContent, setMessageContent] = useState({ type: '', text: '' });

    const displayMessage = (type, text) => {
        setMessageContent({ type, text });
        setShowMessage(true);
        setTimeout(() => {
            setShowMessage(false);
        }, 3000);
    };

    // Get authorization headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // Fetch user ID from profile data
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await fetch(`${BASE_URL}/userpro/getprofessionrecord`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result?.status === 'success' && result?.data && result.data.length > 0) {
                        const userData = result.data[0];
                        const id = userData.regId?.trim() || userData['regId ']?.trim();
                        setUserId(id);
                    }
                }
            } catch (err) {
                /* console.error('Error fetching user ID:', err); */
            }
        };

        fetchUserId();
    }, []);

    // Fetch gallery images
    useEffect(() => {
        if (!userId) return;

        const fetchGalleryImages = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${BASE_URL}/api/getUserImages/${userId}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch gallery images');
                }

                const result = await response.json();
                /* console.log('Gallery Images Response:', result); */

                // Parse the actual API response structure
                if (result?.status && result?.data && Array.isArray(result.data)) {
                    setImages(result.data);
                } else if (result?.data && Array.isArray(result.data)) {
                    setImages(result.data);
                } else if (Array.isArray(result)) {
                    setImages(result);
                } else {
                    setImages([]);
                }
            } catch (err) {
                /* console.error('Error fetching gallery:', err); */
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGalleryImages();
    }, [userId]);

    // Handle file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        // Validate files
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                displayMessage('error', 'Please select only image files');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                displayMessage('error', `${file.name} is too large. Max size is 5MB`);
                return false;
            }
            return true;
        });

        setSelectedFiles(validFiles);

        // Create preview URLs
        const urls = validFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    // Handle drag and drop events
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);

        // Validate files
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                displayMessage('error', 'Please select only image files');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                displayMessage('error', `${file.name} is too large. Max size is 5MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            setSelectedFiles(validFiles);

            // Create preview URLs
            const urls = validFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(urls);
        }
    };

    // Handle image upload
    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            displayMessage('error', 'Please select images to upload');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();

            // Append all files with the field name 'myFiles[]'
            selectedFiles.forEach(file => {
                formData.append('myFiles[]', file);
            });

            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/userImagePost`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload images');
            }

            const result = await response.json();
            /* console.log('Upload Response:', result); */

            // Show success modal instead of alert
            setSuccessMessage('Images uploaded successfully!');
            setShowSuccessModal(true);

            // Close upload modal
            setShowUploadModal(false);

            // Clear selection and previews
            setSelectedFiles([]);
            setPreviewUrls([]);

            // Refresh gallery
            if (userId) {
                const galleryResponse = await fetch(`${BASE_URL}/api/getUserImages/${userId}`, {
                    method: 'GET',
                    headers: getAuthHeaders()
                });

                if (galleryResponse.ok) {
                    const galleryResult = await galleryResponse.json();
                    if (galleryResult?.status && galleryResult?.data && Array.isArray(galleryResult.data)) {
                        setImages(galleryResult.data);
                    } else if (galleryResult?.data && Array.isArray(galleryResult.data)) {
                        setImages(galleryResult.data);
                    } else if (Array.isArray(galleryResult)) {
                        setImages(galleryResult);
                    }
                }
            }
        } catch (err) {
            /* console.error('Error uploading images:', err); */
            displayMessage('error', `Failed to upload images: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    // Handle delete button click - show modal
    const handleDelete = (image) => {
        setImageToDelete(image);
        setShowDeleteModal(true);
    };

    // Confirm and execute delete
    const confirmDelete = async () => {
        if (!imageToDelete) return;

        setDeleting(true);

        try {
            const response = await fetch(`${BASE_URL}/api/deleteUserImage/${imageToDelete.p_id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to delete image');
            }

            // Remove from local state using p_id
            setImages(images.filter(img => img.p_id !== imageToDelete.p_id));

            // Close modal
            setShowDeleteModal(false);
            setImageToDelete(null);
        } catch (err) {
            /* console.error('Error deleting image:', err); */
            displayMessage('error', `Failed to delete image: ${err.message}`);
        } finally {
            setDeleting(false);
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setImageToDelete(null);
    };

    // Close success modal
    const closeSuccessModal = () => {
        setShowSuccessModal(false);
        setSuccessMessage('');
    };

    // Handle image click to preview
    const handleImageClick = (imageUrl) => {
        setPreviewImage(imageUrl);
        setShowImagePreview(true);
    };

    // Close image preview
    const closeImagePreview = () => {
        setShowImagePreview(false);
        setPreviewImage(null);
    };

    // Clear preview
    const clearPreviews = () => {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        setSelectedFiles([]);
    };

    return (
        <div className="gallery-container">
            {/* Header */}
            <div className="gallery-header">
                <button onClick={() => navigate('/profile')} className="gallery-back-button">
                    <MdArrowBack size={24} />
                    Back to Profile
                </button>
                <div className="gallery-header-right">
                    <h1 className="gallery-title">
                        <MdPhotoLibrary size={32} />
                        My Gallery
                    </h1>
                    <button onClick={() => setShowUploadModal(true)} className="gallery-add-button">
                        <MdCloudUpload size={20} />
                        Add Images
                    </button>
                </div>
            </div>

            {/* Gallery Grid - Shown First */}
            <div className="gallery-content">
                {loading ? (
                    <div className="gallery-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading gallery...</p>
                    </div>
                ) : error ? (
                    <div className="gallery-error">
                        <p className="error-message">{error}</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className="gallery-empty">
                        <MdPhotoLibrary size={64} />
                        <p>No images in your gallery yet</p>
                        <span>Click "Add Images" button to upload!</span>
                    </div>
                ) : (
                    <div className="gallery-grid">
                        {images.map((image) => {
                            // Use p_id for the image ID
                            const imgId = image.p_id;
                            // Use p_name for the filename
                            const imgFileName = image.p_name;
                            // Construct the full image URL
                            const fullImageUrl = `${BASE_URL}/uploads/user_photos/${imgFileName}`;

                            return (
                                <div key={imgId} className="gallery-item">
                                    <img
                                        src={fullImageUrl}
                                        alt="Gallery"
                                    />
                                    <div className="gallery-item-overlay">
                                        <div className="overlay-buttons">
                                            <button
                                                onClick={() => handleImageClick(fullImageUrl)}
                                                className="preview-button"
                                                title="View full size"
                                            >
                                                <MdZoomIn size={24} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(image)}
                                                className="delete-button"
                                                title="Delete image"
                                            >
                                                <MdDelete size={24} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="upload-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="upload-modal-header">
                            <h2>Upload Images</h2>
                            <button onClick={() => setShowUploadModal(false)} className="upload-modal-close">
                                <MdClose size={24} />
                            </button>
                        </div>

                        <div className="upload-modal-body">
                            <div
                                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <label htmlFor="file-input" className="upload-label">
                                    <MdCloudUpload size={48} />
                                    <p>Click to select images</p>
                                    <span className="upload-hint">or drag and drop</span>
                                    <span className="upload-limit">Max 5MB per image</span>
                                </label>
                                <input
                                    id="file-input"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="file-input"
                                />
                            </div>

                            {/* Preview Selected Images */}
                            {previewUrls.length > 0 && (
                                <div className="preview-section">
                                    <div className="preview-header">
                                        <h3>Selected Images ({selectedFiles.length})</h3>
                                        <button onClick={clearPreviews} className="clear-button">Clear All</button>
                                    </div>
                                    <div className="preview-grid">
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className="preview-item">
                                                <img src={url} alt={`Preview ${index + 1}`} />
                                                <span className="preview-name">{selectedFiles[index].name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="upload-button"
                                    >
                                        {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length > 1 ? 's' : ''}`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="delete-modal-overlay" onClick={cancelDelete}>
                    <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="delete-modal-header">
                            <MdDelete size={48} className="delete-modal-icon" />
                            <h2>Delete Image?</h2>
                        </div>
                        <div className="delete-modal-body">
                            <p>Are you sure you want to delete this image?</p>
                            <p className="delete-modal-warning">This action cannot be undone.</p>
                        </div>
                        <div className="delete-modal-actions">
                            <button
                                onClick={cancelDelete}
                                className="delete-modal-cancel"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="delete-modal-confirm"
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="success-modal-overlay" onClick={closeSuccessModal}>
                    <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="success-modal-header">
                            <MdCheckCircle size={48} className="success-modal-icon" />
                            <h2>Success!</h2>
                        </div>
                        <div className="success-modal-body">
                            <p>{successMessage}</p>
                        </div>
                        <button onClick={closeSuccessModal} className="success-modal-ok">
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {showImagePreview && previewImage && (
                <div className="image-preview-overlay" onClick={closeImagePreview}>
                    <div className="image-preview-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="image-preview-close"
                            onClick={closeImagePreview}
                            title="Close"
                        >
                            <MdClose size={32} />
                        </button>
                        <img
                            src={previewImage}
                            alt="Full size preview"
                            className="image-preview-img"
                        />
                    </div>
                </div>
            )}
            {/* Custom Message Popup */}
            <AnimatePresence>
                {showMessage && (
                    <motion.div
                        className={`message-popup message-${messageContent.type}`}
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="message-icon">
                            {messageContent.type === 'success' ? '✓' : '✕'}
                        </div>
                        <div className="message-text">
                            {messageContent.text}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;
