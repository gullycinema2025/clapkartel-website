import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import actor from "../../assets/actor.png";
import actress from "../../assets/actress.png";
import dailyNews from "../../assets/dailyNews.png";
import castingCall from "../../assets/castingCall.png";
import image1 from "../../assets/banner1.png";
import image2 from "../../assets/banner32.png";
import image3 from "../../assets/banner3.png";

import "./index.css";

const HomePage = () => {
  const navigate = useNavigate();

  // API Configuration
  const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
  const IMAGE_BASE_URL = 'https://www.whysocial.in/clap-kartel/public/uploads';
  const BANNER_IMAGE_BASE_URL = 'https://www.whysocial.in/clap-kartel/public/uploads/banners';
  const CRAFT_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/cat-list';

  // State for API data
  const [podcastData, setPodcastData] = useState(null);
  const [bannerData, setBannerData] = useState([]);
  const [craftCategories, setCraftCategories] = useState([]);
  const [otherSections, setOtherSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for craft modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCraft, setSelectedCraft] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [subCategoryError, setSubCategoryError] = useState(null);

  // State for other section modal
  const [isOtherModalOpen, setIsOtherModalOpen] = useState(false);
  const [selectedOtherSection, setSelectedOtherSection] = useState(null);
  const [otherCategories, setOtherCategories] = useState([]);
  const [loadingOtherCategories, setLoadingOtherCategories] = useState(false);
  const [otherCategoryError, setOtherCategoryError] = useState(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
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

  // Helper function to construct image URL
  const getImageUrl = (imageName) => {
    if (!imageName) return '';
    if (imageName.startsWith('http')) return imageName;
    return `${IMAGE_BASE_URL}/${imageName}`;
  };

  // Helper function to construct banner image URL
  const getBannerImageUrl = (imageName) => {
    if (!imageName) return '';
    if (imageName.startsWith('http')) return imageName;
    return `${BANNER_IMAGE_BASE_URL}/${imageName}`;
  };

  // Helper function to construct craft category image URL
  const getCraftImageUrl = (imageName) => {
    if (!imageName) return null;
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    return `${CRAFT_IMAGE_BASE_URL}/${imageName}`;
  };

  // Helper function to construct other section image URL
  const getOtherSectionImageUrl = (imageName) => {
    if (!imageName) return '';
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    return `${CRAFT_IMAGE_BASE_URL}/${imageName}`;
  };

  // Helper function to convert YouTube watch URL to embed URL
  const convertToEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) return url;
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`;
    }
    return url;
  };

  // Function to fetch subcategories when a craft is clicked
  const fetchSubCategories = async (catId) => {
    try {
      setLoadingSubCategories(true);
      setSubCategoryError(null);
      setSubCategories([]);

      /* console.log('Fetching subcategories for category:', catId); */

      const displayType = String(catId) === '22' ? 'rentals' : 'directory';
      const response = await fetch(`${BASE_URL}/api/allSubCategoryList/${catId}?only_display=${displayType}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subcategories: ${response.status}`);
      }

      const result = await response.json();
      /* console.log('Subcategory API Response:', result); */

      if (result?.subcategorylist && Array.isArray(result.subcategorylist) && result.subcategorylist.length > 0) {
        setSubCategories(result.subcategorylist);
      } else if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
        setSubCategories(result.data);
      } else if (Array.isArray(result) && result.length > 0) {
        setSubCategories(result);
      } else {
        /* console.log('No subcategories found for category:', catId); */
        setSubCategories([]);
      }

    } catch (err) {
      /* console.error('Error fetching subcategories:', err); */
      setSubCategoryError(err.message);
      setSubCategories([]);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  // Function to fetch other categories when other section is clicked
  const fetchOtherCategories = async (sectionId) => {
    try {
      setLoadingOtherCategories(true);
      setOtherCategoryError(null);
      setOtherCategories([]);
      setHasAttemptedFetch(false);

      /* console.log('Fetching other categories for section:', sectionId); */

      const response = await fetch(`${BASE_URL}/api/get-other-categories/${sectionId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      /* console.log('Response status:', response.status); */

      if (!response.ok) {
        throw new Error(`Failed to fetch other categories: ${response.status}`);
      }

      const result = await response.json();
      /* console.log('Other Categories API Full Response:', JSON.stringify(result, null, 2)); */

      let foundCategories = [];

      // Check multiple possible response structures
      if (result?.crafts241 && Array.isArray(result.crafts241)) {
        foundCategories = result.crafts241;
      } else if (result?.data && Array.isArray(result.data)) {
        foundCategories = result.data;
      } else if (result?.categories && Array.isArray(result.categories)) {
        foundCategories = result.categories;
      } else if (Array.isArray(result)) {
        foundCategories = result;
      }

      /* console.log('Found categories:', foundCategories); */
      /* console.log('Categories length:', foundCategories.length); */

      setOtherCategories(foundCategories);
      setHasAttemptedFetch(true);

    } catch (err) {
      /* console.error('Error fetching other categories:', err); */
      setOtherCategoryError(err.message);
      setOtherCategories([]);
      setHasAttemptedFetch(true);
    } finally {
      setLoadingOtherCategories(false);
    }
  };

  // Handle craft item click - Navigate to detail page for ALL crafts
  const handleCraftClick = (craft) => {
    navigate('/craft-detail', {
      state: {
        categoryId: craft.id,
        categoryName: craft.cat_name,
        categoryImage: craft.cat_image
      }
    });
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setLoadingSubCategories(false);
    setSubCategoryError(null);
    setTimeout(() => {
      setSelectedCraft(null);
      setSubCategories([]);
    }, 300);
  };

  // Handle other section item click
  const handleOtherSectionClick = (section) => {
    /* console.log('Opening modal for section:', section); */
    setSelectedOtherSection(section);
    setOtherCategories([]);
    setHasAttemptedFetch(false);
    setIsOtherModalOpen(true);
    fetchOtherCategories(section.id);
  };

  // Handle other section modal close
  const handleCloseOtherModal = () => {
    setIsOtherModalOpen(false);
    setLoadingOtherCategories(false);
    setOtherCategoryError(null);
    setHasAttemptedFetch(false);
    setTimeout(() => {
      setSelectedOtherSection(null);
      setOtherCategories([]);
    }, 300);
  };

  // Fetch API data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch podcast data
        const podcastResponse = await fetch(`${BASE_URL}/getpodcast`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!podcastResponse.ok) {
          throw new Error(`Failed to fetch podcast: ${podcastResponse.status}`);
        }

        const podcastResult = await podcastResponse.json();
        /* console.log('Podcast API Response:', podcastResult); */

        if (podcastResult?.result && podcastResult.result.length > 0) {
          setPodcastData(podcastResult.result[0]);
        }

        // Fetch banners
        const bannerResponse = await fetch(`${BASE_URL}/dash/getbanners/1`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!bannerResponse.ok) {
          throw new Error(`Failed to fetch banners: ${bannerResponse.status}`);
        }

        const bannerResult = await bannerResponse.json();
        /* console.log('Banner API Response:', bannerResult); */

        if (bannerResult?.banners && bannerResult.banners.length > 0) {
          setBannerData(bannerResult.banners.slice(0, 3));
        }

        // Fetch category list for crafts section
        const categoryResponse = await fetch(`${BASE_URL}/api/allCategoryList`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!categoryResponse.ok) {
          throw new Error(`Failed to fetch categories: ${categoryResponse.status}`);
        }

        const categoryResult = await categoryResponse.json();
        /* console.log('Category List API Response:', categoryResult); */

        if (categoryResult?.categoryList && categoryResult.categoryList.length > 0) {
          setCraftCategories(categoryResult.categoryList);
          /* console.log('Craft Categories:', categoryResult.categoryList); */
        }

        // Fetch other sections/formats
        const otherSectionsResponse = await fetch(`${BASE_URL}/api/get-other-formats`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!otherSectionsResponse.ok) {
          throw new Error(`Failed to fetch other sections: ${otherSectionsResponse.status}`);
        }

        const otherSectionsResult = await otherSectionsResponse.json();
        /* console.log('Other Sections API Response:', otherSectionsResult); */

        if (otherSectionsResult?.subcategories) {
          const flattenedSections = [];
          Object.keys(otherSectionsResult.subcategories).forEach(formatKey => {
            const items = otherSectionsResult.subcategories[formatKey];
            flattenedSections.push(...items);
          });
          /* console.log('Flattened Other Sections:', flattenedSections); */
          setOtherSections(flattenedSections);
        }

      } catch (err) {
        /* console.error('Error fetching homepage data:', err); */
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fallback images for banners
  const fallbackBanners = [image1, image2, image3];

  const categoryList = [
    { name: "Actors", image: actor, path: "/actors" },
    { name: "Actress", image: actress, path: "/actress" },
    { name: "Director", image: dailyNews, path: "/director" },
    { name: "Casting Call", image: castingCall, path: "/casting" },
  ];

  // Render modal body content for Other Sections
  const renderOtherModalContent = () => {
    /* console.log('Rendering Other Modal Content:', {
      loading: loadingOtherCategories,
      error: otherCategoryError,
      hasAttemptedFetch,
      categoriesCount: otherCategories?.length,
      categories: otherCategories
    }); */

    // Show loading state
    if (loadingOtherCategories) {
      return (
        <div className="modal-loading">
          <motion.div
            className="modal-loader"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading categories...</p>
        </div>
      );
    }

    // Show error state
    if (otherCategoryError) {
      return (
        <div className="modal-error">
          <div className="no-profiles-icon">⚠️</div>
          <h3 className="no-profiles-title">Error Loading Profiles</h3>
          <p className="no-profiles-subtitle">
            {otherCategoryError}
          </p>
        </div>
      );
    }

    // Show empty state - only after fetch has been attempted
    if (hasAttemptedFetch && (!otherCategories || !Array.isArray(otherCategories) || otherCategories.length === 0)) {
      return (
        <div className="no-profiles-container">
          <h3 className="no-profiles-title">Currently no profiles in this section</h3>
        </div>
      );
    }

    // Show categories grid
    return (
      <motion.div
        className="other-category-grid"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.08
            }
          }
        }}
      >
        {otherCategories.map((category, index) => (
          <motion.div
            key={category.id || index}
            className="other-category-card"
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            whileHover={{
              scale: 1.05,
              y: -5,
              boxShadow: "0 10px 30px rgba(191, 137, 6, 0.2)",
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Navigate to OtherSectionContentPage with category data
              navigate('/other-section-content', {
                state: {
                  categoryId: category.id,
                  categoryName: category.cat_name
                }
              });
              // Close the modal
              handleCloseOtherModal();
            }}
          >
            <div className="other-category-icon-wrapper">
              <img
                src={getCraftImageUrl(category.cat_image)}
                alt={category.cat_name}
                className="other-category-icon"
                onError={(e) => {
                  /* console.error('Failed to load category image:', category.cat_image); */
                }}
              />
            </div>
            <div className="other-category-info">
              <h3 className="other-category-name">
                {toTitleCase(category.cat_name)}
              </h3>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // Render modal body content for Crafts
  const renderCraftModalContent = () => {
    if (loadingSubCategories) {
      return (
        <div className="modal-loading">
          <motion.div
            className="modal-loader"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading...</p>
        </div>
      );
    }

    if (subCategoryError) {
      return (
        <div className="modal-error">
          <div className="no-profiles-icon">⚠️</div>
          <h3 className="no-profiles-title">Error Loading Profiles</h3>
          <p className="no-profiles-subtitle">
            {subCategoryError}
          </p>
        </div>
      );
    }

    if (!Array.isArray(subCategories) || subCategories.length === 0) {
      return (
        <div className="no-profiles-container">
          <h3 className="no-profiles-title">Currently no profiles in this category</h3>
        </div>
      );
    }

    return (
      <motion.div
        className="modal-subcategory-grid"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        {subCategories.map((subCategory, index) => (
          <motion.div
            key={subCategory.id || index}
            className="subcategory-chip"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            whileHover={{
              scale: 1.05,
              y: -3,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Navigate to SubCategoryUsersPage with sub-category data
              navigate('/subcategory-users', {
                state: {
                  subCategoryId: subCategory.id,
                  subCategoryName: subCategory.sub_cat_name,
                  categoryName: selectedCraft.cat_name,
                  sourcePage: '/'
                }
              });
              // Close the modal
              handleCloseModal();
            }}
          >
            <span className="subcategory-chip-text">
              {toTitleCase(subCategory.sub_cat_name)}
            </span>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="page-wrapper">
      {/* homepage-container */}
      <div className="homepage-container">
        <div className="homepage-left-section">
          <div className="homepage-video-wrapper">
            <iframe
              title="Featured Video"
              src={
                podcastData?.video_url
                  ? convertToEmbedUrl(podcastData.video_url)
                  : "https://www.youtube.com/embed/qtUIxjJDZK0?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0"
              }
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="homepage-video"
            ></iframe>
          </div>

          <div className="homepage-category-list">
            {categoryList.map((item, index) => (
              <div
                key={index}
                className="homepage-category-item"
                onClick={() => navigate(item.path)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="homepage-category-image"
                />
                <h1 className="homepage-category-name">
                  {item.name}
                </h1>
              </div>
            ))}
          </div>
        </div>

        <div className="homepage-right-section">
          <div className="banner-container">
            {(bannerData.length > 0 ? bannerData : fallbackBanners).map((item, index) => {
              const imgSrc = typeof item === 'string'
                ? item
                : getBannerImageUrl(item?.banner_img || item?.image || item?.banner_image || item?.url);

              return (
                <div key={index} className="homepage-image-wrapper">
                  <img
                    src={imgSrc || fallbackBanners[index]}
                    alt={item?.title || item?.name || `Banner ${index + 1}`}
                    className="homepage-image"
                    onError={(e) => {
                      e.target.src = fallbackBanners[index];
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 24 crafts-container */}
      <div className="crafts-container">
        <div className="crafts-header">
          <h1 className="crafts-title">24 Crafts</h1>
          <button onClick={() => navigate('/craft')} className="view-all-button">View all</button>
        </div>
        <div className="crafts-grid">
          {craftCategories.slice(0, 8).map((category, index) => {
            const craftImgSrc = getCraftImageUrl(category.cat_image);

            return (
              <div
                key={category.id || index}
                onClick={() => handleCraftClick(category)}
                className="craft-item"
              >
                <img
                  src={craftImgSrc}
                  alt={category.cat_name}
                  className="craft-image"
                  onError={(e) => {
                    /* console.error('Failed to load craft image:', craftImgSrc); */
                  }}
                />
                <h1 className="craft-name">{toTitleCase(category.cat_name)}</h1>
              </div>
            );
          })}
        </div>
      </div>

      {/* other-sections-container */}
      <div className="crafts-container">
        <div className="crafts-header">
          <h1 className="crafts-title">Other Sections</h1>
          <button onClick={() => navigate('/other-section')} className="view-all-button">View all</button>
        </div>
        <div className="crafts-grid">
          {otherSections.slice(0, 16).map((section, index) => {
            const sectionImgSrc = getOtherSectionImageUrl(section.sub_picture || section.cat_image);

            return (
              <div
                key={section.id || index}
                onClick={() => handleOtherSectionClick(section)}
                className="craft-item"
              >
                <img
                  src={sectionImgSrc}
                  alt={section.sub_cat_name}
                  className="craft-image"
                  onError={(e) => {
                    /* console.error('Failed to load other section image:', sectionImgSrc); */
                  }}
                />
                <h1 className="craft-name">{toTitleCase(section.sub_cat_name)}</h1>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for 24 Crafts */}
      <AnimatePresence>
        {isModalOpen && selectedCraft && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Background Elements */}
              <div className="modal-bg-decoration">
                <div className="modal-circle modal-circle-1"></div>
                <div className="modal-circle modal-circle-2"></div>
                <div className="modal-circle modal-circle-3"></div>
              </div>

              {/* Modal Header */}
              <div className="modal-header">
                <motion.div
                  className="modal-header-left"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="modal-logo-container">
                    <img
                      src={getCraftImageUrl(selectedCraft.cat_image)}
                      alt={selectedCraft.cat_name}
                      className="modal-craft-logo"
                    />
                  </div>
                  <h2 className="modal-craft-title">{toTitleCase(selectedCraft.cat_name)}</h2>
                </motion.div>
                <motion.button
                  className="modal-close-btn"
                  onClick={handleCloseModal}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                {renderCraftModalContent()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Other Sections */}
      <AnimatePresence>
        {isOtherModalOpen && selectedOtherSection && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseOtherModal}
          >
            <motion.div
              className="modal-content other-section-modal"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Background Elements */}
              <div className="modal-bg-decoration other-modal-bg">
                <div className="modal-circle modal-circle-1"></div>
                <div className="modal-circle modal-circle-2"></div>
                <div className="modal-circle modal-circle-3"></div>
              </div>

              {/* Modal Header */}
              <div className="modal-header other-modal-header">
                <motion.div
                  className="modal-header-left"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="modal-logo-container">
                    <img
                      src={getOtherSectionImageUrl(selectedOtherSection.sub_picture || selectedOtherSection.cat_image)}
                      alt={selectedOtherSection.sub_cat_name}
                      className="modal-craft-logo"
                    />
                  </div>
                  <div className="modal-header-info">
                    <h2 className="modal-craft-title">{toTitleCase(selectedOtherSection.sub_cat_name)}</h2>
                  </div>
                </motion.div>
                <motion.button
                  className="modal-close-btn"
                  onClick={handleCloseOtherModal}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                {renderOtherModalContent()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HomePage;