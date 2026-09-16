import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubcategoryLineCount, compareSubcategories } from '../../utils/textUtils';
import './index.css';

const CraftPage = () => {
  const navigate = useNavigate();

  // API Configuration
  const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
  const CRAFT_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/cat-list';

  // State for API data
  const [craftCategories, setCraftCategories] = useState([]);
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

  // Helper function to convert text to title case (first letter capital, rest lowercase)
  const toTitleCase = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };




  // Helper function to construct craft category image URL
  const getCraftImageUrl = (imageName) => {
    if (!imageName) return '';
    // If already a full URL, return as is
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) {
      return imageName;
    }
    // If it's just the filename like 'art.png', prepend the base URL
    return `${CRAFT_IMAGE_BASE_URL}/${imageName}`;
  };

  // Handle craft item click - navigate to detail page
  const handleCraftClick = (craft) => {
    navigate('/craft-detail', {
      state: {
        categoryId: craft.id,
        categoryName: craft.cat_name,
        categoryImage: craft.cat_image,
        sourcePage: '/craft'
      }
    });
  };

  // Fetch API data on component mount
  useEffect(() => {
    const fetchCraftCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch category list for crafts section
        const categoryResponse = await fetch(`${BASE_URL}/api/allCategoryList`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!categoryResponse.ok) {
          throw new Error(`Failed to fetch categories: ${categoryResponse.status}`);
        }

        const categoryResult = await categoryResponse.json();
        console.log('Category List API Response:', categoryResult);

        // Extract category list from response
        if (categoryResult?.categoryList && categoryResult.categoryList.length > 0) {
          const filteredCategories = categoryResult.categoryList.filter(cat => String(cat.id) !== '22');
          setCraftCategories(filteredCategories);
          console.log('Craft Categories:', filteredCategories);
        }

      } catch (err) {
        console.error('Error fetching craft categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCraftCategories();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="craft-page">
        <h1 className="craft-title">24 Crafts</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading crafts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="craft-page">
        <h1 className="craft-title">24 Crafts</h1>
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
    <div className="craft-page">
      <h1 className="craft-title">24 Crafts</h1>
      <div className="craft-grid">
        {[...craftCategories]
          .sort((a, b) => compareSubcategories(a, b, 'cat_name'))
          .map((craft) => {
            const craftImgSrc = getCraftImageUrl(craft.cat_image);

          return (
            <div
              key={craft.id}
              className="craft-item"
              onClick={() => handleCraftClick(craft)}
            >
              <div className="craft-image-wrapper">
                <img
                  src={craftImgSrc}
                  alt={craft.cat_name}
                  className="craft-image"
                  onError={(e) => {
                    console.error('Failed to load craft image:', craftImgSrc);
                    e.target.src = 'https://placehold.co/120x120?text=No+Image';
                  }}
                />
              </div>
              <p className="craft-name">{toTitleCase(craft.cat_name)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CraftPage;