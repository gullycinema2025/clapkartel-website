import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatSubcategoryName, getSubcategoryLineCount, compareSubcategories } from '../../utils/textUtils';
import './index.css';

const OtherSections = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rentalsRef = useRef(null);

  // API Configuration
  const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
  const CRAFT_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/cat-list';

  // State for sections data
  const [sectionsData, setSectionsData] = useState(null);
  const [craftRentalsSubcategories, setCraftRentalsSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Helper function to construct image URL
  const getOtherSectionImageUrl = (imageName) => {
    if (!imageName) return '';
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    return `${CRAFT_IMAGE_BASE_URL}/${imageName}`;
  };

  // Helper function to convert text to title case



  // Helper function to build rental sub image URL from specific image mapping
  const getRentalSubImage = (subName, apiImage) => {
    const rentalImagesMap = {
      'drone': 'drones.png',
      'nagara': 'Editing Studios.png',
      'rentals': 'rentals.png',
      'cameras': 'camers.png',
      'caravan': 'caravan 1.png',
      'costumes': 'coustmes.png',
      'locations': 'locationn.png',
      'ac anaconda': 'AC Anaconda.png',
      'rain effect': 'rain effect.png',
      'outdoor fans': 'outdoor fans.png',
      'gopro cameras': 'Gopro Camera.png',
      'unit vehicles': 'unit vechiles.png',
      'editing studios': 'Editing Studio.png',
      'grading studios': 'Grading Studio.png',
      'dubbing studios': 'Dubbing Studio.png',
      'podcast studios': 'Podcast Studio.png',
      'choreography studios': 'Choreography Studio.png',
      'tent house equipment': 'Tent House Equipment.png',
      'greenmat / bluemat clothes': 'Green Mat : Blue Mat Clothes.png',
      'properties / set suppliers': 'Properties : Set Suppliers.png',
      'premium vehicles for imported': 'Premium Vehicles for Imported.png',
    };

    if (subName) {
      const normalizedName = subName.trim().toLowerCase();
      if (rentalImagesMap[normalizedName]) {
        return `https://whysocial.in/clap-kartel/public/uploads/cat-list/${rentalImagesMap[normalizedName]}`;
      }
    }

    // Fallback to what was provided by API
    if (!apiImage) return '';
    if (apiImage.startsWith('http://') || apiImage.startsWith('https://')) {
      return apiImage;
    }
    return `${CRAFT_IMAGE_BASE_URL}/${apiImage}`;
  };

  // Fetch other sections data
  useEffect(() => {
    const fetchOtherSections = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch formats and craft rentals subcategories in parallel
        const [formatsResponse, rentalsSubResponse] = await Promise.all([
          fetch(`${BASE_URL}/api/get-other-formats`, { method: 'GET', headers: getAuthHeaders() }),
          fetch(`${BASE_URL}/api/allSubCategoryList/22?only_display=rentals`, { method: 'GET', headers: getAuthHeaders() })
        ]);

        if (!formatsResponse.ok) {
          throw new Error(`Failed to fetch sections data`);
        }

        const formatsResult = await formatsResponse.json();

        let subcategories = formatsResult.subcategories || {};
        // Remove old Rentals group from other-formats — we show craft rentals instead
        delete subcategories['Rentals'];

        setSectionsData({ ...formatsResult, subcategories });

        // Set craft rentals subcategories
        if (rentalsSubResponse.ok) {
          const rentalsSubResult = await rentalsSubResponse.json();
          let subs = [];
          if (rentalsSubResult?.subcategorylist && Array.isArray(rentalsSubResult.subcategorylist)) {
            subs = rentalsSubResult.subcategorylist;
          } else if (rentalsSubResult?.data && Array.isArray(rentalsSubResult.data)) {
            subs = rentalsSubResult.data;
          } else if (Array.isArray(rentalsSubResult)) {
            subs = rentalsSubResult;
          }
          setCraftRentalsSubcategories(subs);
        }

      } catch (err) {
        /* console.error('Error fetching other sections:', err); */
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOtherSections();
  }, []);

  // Smooth scroll to rentals when requested
  useEffect(() => {
    if (!loading && location.state?.scrollToRentals) {
      window.history.replaceState({}, document.title);
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (rentalsRef.current) {
          clearInterval(interval);
          rentalsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (attempts >= 20) {
          clearInterval(interval);
        }
      }, 50);
    }
  }, [loading, location.state]);

  // Handle section item click
  const handleSectionClick = (section) => {
    if (section.data_exists === false) {
      navigate('/other-section-content', {
        state: {
          otherId: section.other_id || section.id,
          mainCatId: section.main_cat_id || '23',
          categoryName: section.sub_cat_name,
          sourcePage: '/other-section'
        }
      });
    } else {
      navigate('/other-section-detail', {
        state: {
          sectionId: section.id,
          mainCatId: section.main_cat_id || '23',
          sectionName: section.sub_cat_name,
          sectionImage: section.sub_picture || section.cat_image,
          sourcePage: '/other-section'
        }
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="os-container">
        <div className="page-loading">
          <motion.div
            className="page-loader"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading sections...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="os-container">
        <div className="page-error">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!sectionsData || !sectionsData.subcategories) {
    return (
      <div className="os-container">
        <div className="page-empty">
          <p>No sections available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="os-container">
      <h1 className="os-main-title">Other Sections</h1>

      {[
        { apiKey: 'Learning', displayTitle: 'Learning' },
        { apiKey: 'Support', displayTitle: 'Support' },
        { apiKey: 'Services', displayTitle: 'Services' },
        { apiKey: 'Rentals', displayTitle: 'Rentals' },
        { apiKey: 'Industry Exposure', displayTitle: 'Industry Exposure' },
        { apiKey: 'Industry Updates', displayTitle: 'Industry Updates' },
      ].map((group) => {
        if (group.apiKey === 'Rentals') {
          if (!craftRentalsSubcategories || craftRentalsSubcategories.length === 0) return null;
          return (
            <div ref={rentalsRef} key={group.apiKey} style={{ scrollMarginTop: '160px' }}>
              <div className="os-group-header">
                <h2 className="os-group-subtitle">{group.displayTitle}</h2>
              </div>
              <div className="os-craft-grid">
                {[...craftRentalsSubcategories]
                  .sort((a, b) => compareSubcategories(a, b, 'sub_cat_name'))
                  .map((sub, index) => {
                    const subImgSrc = getRentalSubImage(sub.sub_cat_name, sub.sub_picture || sub.cat_image);
                    return (
                      <div
                        key={sub.id || index}
                        className="os-craft-item"
                        onClick={() => navigate('/subcategory-users', {
                          state: {
                            subCategoryId: sub.id,
                            subCategoryName: sub.sub_cat_name,
                            categoryName: 'Rentals',
                            sourcePage: '/other-section'
                          }
                        })}
                      >
                        <div className="os-craft-image-wrapper">
                          {subImgSrc ? (
                            <img
                              src={subImgSrc}
                              alt={sub.sub_cat_name}
                              className="os-craft-image"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="os-craft-image-placeholder" />
                          )}
                        </div>
                        <p className="os-craft-name">{formatSubcategoryName(sub.sub_cat_name)}</p>
                      </div>
                    );
                  })}
              </div>
              <div className="os-divider"></div>
            </div>
          );
        }

        const groupItems = sectionsData.subcategories[group.apiKey];
        if (!groupItems || groupItems.length === 0) return null;

        return (
          <React.Fragment key={group.apiKey}>
            <div className="os-group-header">
              <h2 className="os-group-subtitle">{group.displayTitle}</h2>
            </div>

            <div className="os-craft-grid">
              {[...groupItems]
                .sort((a, b) => compareSubcategories(a, b, 'sub_cat_name'))
                .map((section, index) => {
                  const sectionImgSrc = getOtherSectionImageUrl(section.sub_picture || section.cat_image);
                  return (
                    <div
                      key={section.id || index}
                      className="os-craft-item"
                      onClick={() => handleSectionClick(section)}
                    >
                      <div className="os-craft-image-wrapper">
                        {sectionImgSrc ? (
                          <img
                            src={sectionImgSrc}
                            alt={section.sub_cat_name}
                            className="os-craft-image"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="os-craft-image-placeholder" />
                        )}
                      </div>
                      <p className="os-craft-name">{formatSubcategoryName(section.sub_cat_name)}</p>
                    </div>
                  );
                })}
            </div>

            <div className="os-divider"></div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default OtherSections;