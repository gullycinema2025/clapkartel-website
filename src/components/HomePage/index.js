import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatSubcategoryName, getSubcategoryLineCount, compareSubcategories } from '../../utils/textUtils';


import image1 from "../../assets/banner1.png";
import image2 from "../../assets/banner32.png";
import image3 from "../../assets/banner3.png";

import "./index.css";

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // API Configuration
  const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
  const IMAGE_BASE_URL = 'https://www.whysocial.in/clap-kartel/public/uploads';



  const BANNER_IMAGE_BASE_URL = 'https://www.whysocial.in/clap-kartel/public/uploads/banners';
  const CRAFT_IMAGE_BASE_URL = 'https://whysocial.in/clap-kartel/public/uploads/cat-list';

  // State for API data
  const [podcastData, setPodcastData] = useState([]);
  const [bannerData, setBannerData] = useState([]);
  const [craftCategories, setCraftCategories] = useState([]);
  const [otherSections, setOtherSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for hero carousel
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPlaying, setHeroPlaying] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // State for craft tabs
  const [activeTab, setActiveTab] = useState('24crafts');

  // Ref to track pending scroll action from navigation state
  const pendingScrollRef = useRef(null);

  // State for craft rentals subcategories (shown in Other Sections > Rentals)
  const [craftRentalsSubcategories, setCraftRentalsSubcategories] = useState([]);

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

  // Helper to extract YouTube video ID
  const getYouTubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2] && match[2].length === 11) {
      return match[2];
    }
    const altMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    if (altMatch && altMatch[1]) {
      return altMatch[1];
    }
    return '';
  };

  // Helper function to convert YouTube watch URL to embed URL
  const convertToEmbedUrl = (url, autoplay = false) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) {
      // Strip existing params and add our own
      const baseEmbed = url.split('?')[0];
      return `${baseEmbed}?mute=1&controls=1&modestbranding=1&rel=0${autoplay ? '&autoplay=1' : ''}`;
    }
    const videoId = getYouTubeId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?mute=1&controls=1&modestbranding=1&rel=0${autoplay ? '&autoplay=1' : ''}`;
    }
    return url;
  };

  // Build hero video slides from the API response
  const getHeroVideos = useCallback(() => {
    if (podcastData && podcastData.length > 0) {
      // Map all video URLs from the response
      return podcastData.map(podcast => podcast.video_url).filter(Boolean);
    }
    return [];
  }, [podcastData]);

  const heroVideos = getHeroVideos();
  const totalHero = heroVideos.length;

  const heroNext = () => {
    if (totalHero <= 1) return;
    setHeroIndex((prev) => (prev + 1) % totalHero);
    setHeroPlaying(false);
  };

  const heroPrev = () => {
    if (totalHero <= 1) return;
    setHeroIndex((prev) => (prev - 1 + totalHero) % totalHero);
    setHeroPlaying(false);
  };

  // Helper function to calculate circular index offset for 3D stack
  const getOffset = (idx) => {
    if (totalHero === 0) return 0;
    let offset = idx - heroIndex;
    if (offset < -totalHero / 2) {
      offset += totalHero;
    } else if (offset > totalHero / 2) {
      offset -= totalHero;
    }
    return offset;
  };

  // Helper to construct thumbnail URL
  const getYouTubeThumbnail = (url) => {
    const id = getYouTubeId(url);
    if (id) {
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }
    return '';
  };

  // Fallback for YouTube thumbnails if maxresdefault isn't available
  const handleThumbnailError = (e) => {
    if (e.target.src && e.target.src.includes('maxresdefault')) {
      e.target.src = e.target.src.replace('maxresdefault', 'hqdefault');
    }
  };

  // Handle craft item click
  const handleCraftClick = (craft) => {
    navigate('/craft-detail', {
      state: {
        categoryId: craft.id,
        categoryName: craft.cat_name,
        categoryImage: craft.cat_image,
        sourcePage: '/'
      }
    });
  };

  // Handle other section item click — same logic as /other-section page
  // If data_exists is false → go directly to /other-section-content
  // Otherwise → go to /other-section-detail for sub-category drill-down
  const handleOtherSectionClick = (section) => {
    if (section.is_craft) {
      navigate('/craft-detail', {
        state: {
          categoryId: section.id,
          categoryName: section.cat_name,
          categoryImage: section.cat_image || section.sub_picture,
          sourcePage: '/'
        }
      });
      return;
    }

    if (section.data_exists === false) {
      // No sub-detail page; navigate straight to content using section.other_id
      navigate('/other-section-content', {
        state: {
          otherId: section.other_id || section.id,
          mainCatId: section.main_cat_id || '23',
          categoryName: section.sub_cat_name,
          sourcePage: '/'
        }
      });
    } else {
      navigate('/other-section-detail', {
        state: {
          sectionId: section.id,
          mainCatId: section.main_cat_id || '23',
          sectionName: section.sub_cat_name,
          sectionImage: section.sub_picture || section.cat_image,
          sourcePage: '/'
        }
      });
    }
  };

  // Auto-scroll references for the promotional banners
  const promoBannerRefTop = useRef(null);
  const promoBannerRefBottom = useRef(null);
  // Ref for the Rentals section in Other Sections
  const rentalsRef = useRef(null);
  const tabsRef = useRef(null);

  // Auto-scroll effect for promotional banners (every 3 seconds)
  useEffect(() => {
    const scrollInterval = setInterval(() => {
      const scrollBanner = (ref) => {
        if (ref.current) {
          const { scrollLeft, scrollWidth, clientWidth } = ref.current;
          // Exact dimensions of the banner card + gap is 567.856px + 14px = ~581.856px.
          // Let's scroll by the card width roughly.
          const scrollAmount = 582;

          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            // Reached the end, scroll back out to start smoothly or instantly
            ref.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Scroll right by exactly one banner width
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
        }
      };

      scrollBanner(promoBannerRefTop);
      scrollBanner(promoBannerRefBottom);
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, []);

  // Window resize handler to maintain responsiveness for 3D carousel
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to reliably scroll to target element with centering and retries
  const performScroll = useCallback((target) => {
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(() => {
      attempts++;
      const el = target === 'rentals' ? rentalsRef.current : tabsRef.current;
      if (el) {
        clearInterval(interval);
        if (target === 'rentals') {
          // Center the rentals section vertically in the viewport so it is fully visible
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Tabs header: scroll with sticky header offset
          const headerOffset = 140;
          const rect = el.getBoundingClientRect();
          const offsetPosition = rect.top + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 50);
  }, []);

  // Effect to capture navigation state on first arrival
  useEffect(() => {
    if (location.state) {
      if (location.state.activeTab) {
        setActiveTab(location.state.activeTab);
        pendingScrollRef.current = location.state.scrollToRentals ? 'rentals' : 'tabs';
      } else if (location.state.scrollToRentals) {
        setActiveTab('other');
        pendingScrollRef.current = 'rentals';
      }
      // Clear router state so it doesn't re-trigger on next render
      window.history.replaceState({}, document.title);

      // If loading is already done, trigger scroll
      if (!loading && pendingScrollRef.current) {
        const target = pendingScrollRef.current;
        pendingScrollRef.current = null;
        performScroll(target);
      }
    }
    // location.key changes on every navigation event, even back to the same path
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, performScroll]);

  // Scroll to section AFTER loading completes (for fresh page loads)
  useEffect(() => {
    if (!loading && pendingScrollRef.current) {
      const target = pendingScrollRef.current;
      pendingScrollRef.current = null;
      performScroll(target);
    }
  }, [loading, performScroll]);

  // Fetch API data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch podcast data (matches mobile: /api/podcast/home)
        try {
          const podcastResponse = await fetch(`${BASE_URL}/api/podcast/home`, {
            method: 'GET',
            headers: getAuthHeaders()
          });
          if (podcastResponse.ok) {
            const podcastResult = await podcastResponse.json();
            if (podcastResult?.data && Array.isArray(podcastResult.data) && podcastResult.data.length > 0) {
              setPodcastData(podcastResult.data);
            } else if (podcastResult?.result && Array.isArray(podcastResult.result) && podcastResult.result.length > 0) {
              setPodcastData(podcastResult.result);
            }
          } else {
            // Fallback to /getpodcast
            const fbResponse = await fetch(`${BASE_URL}/getpodcast`, {
              method: 'GET',
              headers: getAuthHeaders()
            });
            if (fbResponse.ok) {
              const fbResult = await fbResponse.json();
              if (fbResult?.data && Array.isArray(fbResult.data)) {
                setPodcastData(fbResult.data);
              } else if (fbResult?.result && Array.isArray(fbResult.result)) {
                setPodcastData(fbResult.result);
              }
            }
          }
        } catch (podcastErr) {
          console.warn('[HomePage] Podcast fetch non-fatal:', podcastErr.message);
        }

        // Fetch banners (Home menu_id=1)
        try {
          const bannerResponse = await fetch(`${BASE_URL}/dash/getbanners/1`, {
            method: 'GET',
            headers: getAuthHeaders()
          });
          if (bannerResponse.ok) {
            const bannerResult = await bannerResponse.json();
            console.log('=== [Banner API: menu_id=1 (Home)] ===', bannerResult);
            if (bannerResult?.banners && bannerResult.banners.length > 0) {
              setBannerData(bannerResult.banners);
            }
          }
        } catch (bErr) {
          console.warn('[HomePage] Home banner fetch error:', bErr);
        }

        // Fetch banners (Category menu_id=2)
        try {
          const categoryBannerResponse = await fetch(`${BASE_URL}/dash/getbanners/2`, {
            method: 'GET',
            headers: getAuthHeaders()
          });
          if (categoryBannerResponse.ok) {
            const categoryBannerResult = await categoryBannerResponse.json();
            console.log('=== [Banner API: menu_id=2 (Category)] ===', categoryBannerResult);
          } else {
            console.log('=== [Banner API: menu_id=2 (Category)] Status:', categoryBannerResponse.status);
          }
        } catch (catBannerErr) {
          console.warn('[HomePage] Category banner fetch error:', catBannerErr);
        }

        // Fetch category list for crafts section
        const categoryResponse = await fetch(`${BASE_URL}/api/allCategoryList`, {
          method: 'GET',
          headers: getAuthHeaders()
        });
        if (!categoryResponse.ok) throw new Error(`Failed to fetch categories: ${categoryResponse.status}`);
        const categoryResult = await categoryResponse.json();
        if (categoryResult?.categoryList && categoryResult.categoryList.length > 0) {
          const filteredCategories = categoryResult.categoryList.filter(cat => String(cat.id) !== '22');
          setCraftCategories(filteredCategories);
        }

        // Fetch other sections/formats
        const otherSectionsResponse = await fetch(`${BASE_URL}/api/get-other-formats`, {
          method: 'GET',
          headers: getAuthHeaders()
        });
        if (!otherSectionsResponse.ok) throw new Error(`Failed to fetch other sections: ${otherSectionsResponse.status}`);
        const otherSectionsResult = await otherSectionsResponse.json();

        if (otherSectionsResult?.subcategories) {
          let subcategories = otherSectionsResult.subcategories;
          // Remove old Rentals group from other-formats so we show craft rentals instead
          delete subcategories['Rentals'];
          setOtherSections(subcategories);
        }

        // Fetch subcategories of Craft Rentals (id 22) to display in Other Sections > Rentals
        const rentalsSubResponse = await fetch(`${BASE_URL}/api/allSubCategoryList/22?only_display=rentals`, {
          method: 'GET',
          headers: getAuthHeaders()
        });
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
        console.error('Error fetching homepage data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fallback images for banners
  const fallbackBanners = [image1, image2, image3, image1, image2, image3];







  // Banner items to render
  const bannerItems = bannerData.length > 0 ? bannerData : fallbackBanners;

  return (
    <div className="page-wrapper">

      {/* ===== HERO VIDEO CAROUSEL ===== */}
      {heroVideos.length > 0 ? (
        <div className="hero-carousel-section">
          {heroVideos.length > 1 && (
            <button className="hero-arrow hero-arrow-left" onClick={heroPrev} aria-label="Previous video">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}

          <div className="hero-carousel-track-3d">
            {heroVideos.map((videoUrl, idx) => {
              const offset = getOffset(idx);
              const isVisible = Math.abs(offset) <= 1;

              if (!isVisible) return null;

              const isActive = offset === 0;
              const thumbnailUrl = getYouTubeThumbnail(videoUrl);

              // Responsive config for offsets
              const getResponsiveConfig = () => {
                if (windowWidth > 1200) {
                  return { xOffset: 34, scaleSide: 0.8, opacitySide: 0.35, blurSide: '2px' };
                } else if (windowWidth > 768) {
                  return { xOffset: 26, scaleSide: 0.78, opacitySide: 0.25, blurSide: '2px' };
                } else if (windowWidth > 480) {
                  return { xOffset: 16, scaleSide: 0.75, opacitySide: 0.15, blurSide: '3px' };
                } else {
                  return { xOffset: 10, scaleSide: 0.7, opacitySide: 0.1, blurSide: '4px' };
                }
              };
              const config = getResponsiveConfig();

              return (
                <motion.div
                  key={idx}
                  className={`hero-slide-3d ${isActive ? 'active' : 'side'}`}
                  style={{
                    zIndex: isActive ? 5 : 2,
                    pointerEvents: isVisible ? 'auto' : 'none',
                  }}
                  drag={isActive && !heroPlaying ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    const swipeThreshold = 50;
                    if (info.offset.x < -swipeThreshold) {
                      heroNext();
                    } else if (info.offset.x > swipeThreshold) {
                      heroPrev();
                    }
                  }}
                  animate={{
                    x: `${offset * config.xOffset}%`,
                    scale: isActive ? 1.05 : config.scaleSide,
                    opacity: isActive ? 1 : config.opacitySide,
                    rotateY: offset * -15,
                    filter: isActive ? 'blur(0px)' : `blur(${config.blurSide})`,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  onClick={() => {
                    if (!isActive) {
                      setHeroIndex(idx);
                      setHeroPlaying(false);
                    } else if (!heroPlaying) {
                      setHeroPlaying(true);
                    }
                  }}
                >
                  {isActive && heroPlaying ? (
                    <iframe
                      title="Featured Video"
                      src={convertToEmbedUrl(videoUrl, true)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="hero-video-iframe"
                    />
                  ) : (
                    <div className="hero-thumbnail-wrapper">
                      <img
                        src={thumbnailUrl}
                        alt={`Video thumbnail ${idx + 1}`}
                        className="hero-thumbnail-img"
                        onError={handleThumbnailError}
                      />
                      <div className="hero-play-overlay-3d">
                        <div className="hero-play-btn-3d">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    </div>
                  )}
                  {!isActive && <div className="hero-slide-overlay-3d" />}
                </motion.div>
              );
            })}
          </div>

          {heroVideos.length > 1 && (
            <button className="hero-arrow hero-arrow-right" onClick={heroNext} aria-label="Next video">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}
        </div>
      ) : (
        <div className="hero-carousel-section" style={{ minHeight: '120px' }} />
      )}

      {/* ===== PROMOTIONAL BANNER STRIP ===== */}
      <div className="promo-banner-section">
        <div className="promo-banner-strip" ref={promoBannerRefTop}>
          {bannerItems.map((item, index) => {
            const imgSrc = typeof item === 'string'
              ? item
              : getBannerImageUrl(item?.banner_img || item?.image || item?.banner_image || item?.url);
            return (
              <div key={index} className="promo-banner-card">
                <img
                  src={imgSrc || fallbackBanners[index % fallbackBanners.length]}
                  alt={item?.title || item?.name || `Banner ${index + 1}`}
                  className="promo-banner-img"
                  onError={(e) => { e.target.src = fallbackBanners[index % fallbackBanners.length]; }}
                />
              </div>
            );
          })}
        </div>
      </div>



      {/* ===== CONTENT SECTIONS WITH TABS ===== */}
      <div className="content-section-card" ref={tabsRef}>
        {/* ===== CRAFT TABS ===== */}
        <div className="craft-tabs-section" style={{ paddingBottom: '20px', borderBottom: '1px solid #eee', marginBottom: '20px' }}>
          <div className="craft-tabs-container">
            <button
              className={`craft-tab-btn ${activeTab === '24crafts' ? 'craft-tab-active' : ''}`}
              onClick={() => setActiveTab('24crafts')}
            >
              24 Crafts
            </button>

            <button
              className={`craft-tab-btn ${activeTab === 'other' ? 'craft-tab-active' : ''}`}
              onClick={() => setActiveTab('other')}
            >
              Other Sections
            </button>
          </div>
        </div>

        {activeTab === '24crafts' && (
          <div className="content-section-inner">
            <h2 className="content-section-title">24 Crafts</h2>
            <div
              style={{
                borderRadius: '10px',
                background: '#F9F9F9',
                boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
                padding: '30px 20px'
              }}
            >
              <div className="content-grid">
                {[...craftCategories]
                  .sort((a, b) => compareSubcategories(a, b, 'cat_name'))
                  .map((craft, index) => {
                  const craftImgSrc = getCraftImageUrl(craft.cat_image);
                  return (
                    <div
                      key={craft.id || index}
                      className="content-grid-item"
                      onClick={() => handleCraftClick(craft)}
                    >
                      <div className="content-icon-circle">
                        {craftImgSrc ? (
                          <img
                            src={craftImgSrc}
                            alt={craft.cat_name}
                            className="content-icon-img"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="content-icon-placeholder" />
                        )}
                      </div>
                      <span className="content-item-label">{toTitleCase(craft.cat_name)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'other' && otherSections && (
          <div className="content-section-inner">
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
                  <div ref={rentalsRef} key={group.apiKey} style={{ marginBottom: '40px', scrollMarginTop: '160px' }}>
                    <h2 className="content-section-title" style={{ textAlign: 'center', marginBottom: '15px' }}>{group.displayTitle}</h2>
                    <div
                      style={{
                        borderRadius: '10px',
                        background: '#F9F9F9',
                        boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
                        padding: '30px 20px'
                      }}
                    >
                      <div className="content-grid">
                        {[...craftRentalsSubcategories]
                          .sort((a, b) => compareSubcategories(a, b, 'sub_cat_name'))
                          .map((sub, index) => {
                            const subImgSrc = getRentalSubImage(sub.sub_cat_name, sub.sub_picture || sub.cat_image);
                            return (
                              <div
                                key={sub.id || index}
                                className="content-grid-item"
                                onClick={() => navigate('/subcategory-users', {
                                  state: {
                                    subCategoryId: sub.id,
                                    subCategoryName: sub.sub_cat_name,
                                    categoryName: 'Rentals',
                                    sourcePage: '/'
                                  }
                                })}
                              >
                                <div className="content-icon-circle">
                                  {subImgSrc ? (
                                    <img
                                      src={subImgSrc}
                                      alt={sub.sub_cat_name}
                                      className="content-icon-img"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <div className="content-icon-placeholder" />
                                  )}
                                </div>
                                <span className="content-item-label">{formatSubcategoryName(sub.sub_cat_name)}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                );
              }

              const groupItems = otherSections[group.apiKey];
              if (!groupItems || groupItems.length === 0) return null;

              return (
                <div key={group.apiKey} style={{ marginBottom: '40px' }}>
                  <h2 className="content-section-title" style={{ textAlign: 'center', marginBottom: '15px' }}>{group.displayTitle}</h2>
                  <div
                    style={{
                      borderRadius: '10px',
                      background: '#F9F9F9',
                      boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
                      padding: '30px 20px'
                    }}
                  >
                    <div className="content-grid">
                      {[...groupItems]
                        .sort((a, b) => compareSubcategories(a, b, 'sub_cat_name'))
                        .map((section, index) => {
                          const sectionImgSrc = getOtherSectionImageUrl(section.sub_picture || section.cat_image);
                          return (
                            <div
                              key={section.id || index}
                              className="content-grid-item"
                              onClick={() => handleOtherSectionClick(section)}
                            >
                              <div className="content-icon-circle">
                                {sectionImgSrc ? (
                                  <img
                                    src={sectionImgSrc}
                                    alt={section.sub_cat_name}
                                    className="content-icon-img"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div className="content-icon-placeholder" />
                                )}
                              </div>
                              <span className="content-item-label">{formatSubcategoryName(section.sub_cat_name)}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== BOTTOM PROMOTIONAL BANNERS ===== */}
      <div className="promo-banner-section promo-banner-bottom">
        <div className="promo-banner-strip" ref={promoBannerRefBottom}>
          {(bannerData.length > 0 ? bannerData : fallbackBanners).map((item, index) => {
            const imgSrc = typeof item === 'string'
              ? item
              : getBannerImageUrl(item?.banner_img || item?.image || item?.banner_image || item?.url);
            return (
              <div key={`bottom-${index}`} className="promo-banner-card">
                <img
                  src={imgSrc || fallbackBanners[index % fallbackBanners.length]}
                  alt={item?.title || item?.name || `Banner ${index + 1}`}
                  className="promo-banner-img"
                  onError={(e) => { e.target.src = fallbackBanners[index % fallbackBanners.length]; }}
                />
              </div>
            );
          })}
        </div>
      </div>



    </div>
  );
};

export default HomePage;