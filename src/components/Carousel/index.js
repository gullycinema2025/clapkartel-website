import { useState, useEffect, useRef } from "react";
import carouselImage from "../../assets/carouselImage.jpeg";
import "./index.css";



const Carousel = () => {
  // API Configuration
  const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
  const BANNER_IMAGE_BASE_URL = 'https://www.whysocial.in/clap-kartel/public/uploads/banners';

  // State for banner data
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback images
  const fallbackImages = [carouselImage, carouselImage, carouselImage, carouselImage];

  // Use API banners if available, otherwise use fallback
  const images = banners.length > 0
    ? banners.map(banner => `${BANNER_IMAGE_BASE_URL}/${banner.banner_img}`)
    : fallbackImages;

  const [index, setIndex] = useState(0);
  const slidesToShow = 2;
  const imageWidth = 679;
  const imageHeight = 127;
  const containerRef = useRef(null);

  const extendedImages = [...images, ...images.slice(0, slidesToShow)];

  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Check if token exists before attempting fetch
        const token = localStorage.getItem('token');
        if (!token) {
          /* console.log('No token found, skipping banner fetch'); */
          setLoading(false);
          return;
        }

        setLoading(true);

        // Wait a bit for token to be fully set
        await new Promise(resolve => setTimeout(resolve, 500));

        const response = await fetch(`${BASE_URL}/dash/getbanners/1`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          // Silently fail and use fallback images
          /* console.log('Using fallback banner images'); */
          setLoading(false);
          return;
        }

        const result = await response.json();
        /* console.log('=== [Carousel Banner API (dash/getbanners/1)] ===', result); */

        // Extract banners array from response
        if (result?.banners && result.banners.length > 0) {
          setBanners(result.banners);
        }
      } catch (err) {
        // Silently fail - use fallback images
        /* console.log('Using fallback banner images'); */
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (index >= images.length) {
      const timeout = setTimeout(() => {
        setIndex(0);
        if (containerRef.current) {
          containerRef.current.style.transition = "none";
          containerRef.current.style.transform = `translateX(0px)`;
          requestAnimationFrame(() => {
            if (containerRef.current) {
              containerRef.current.style.transition = "transform 1s ease-in-out";
            }
          });
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [index, images.length]);

  return (
    <div
      className="carousel-container"
      style={{
        width: "calc(100% - 2rem)",
        height: `${imageHeight}px`,
      }}
    >
      <div
        ref={containerRef}
        className="carousel-track"
        style={{
          width: `${extendedImages.length * imageWidth}px`,
          transform: `translateX(-${index * imageWidth}px)`,
        }}
      >
        {extendedImages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i}`}
            style={{
              width: `${imageWidth}px`,
              height: `${imageHeight}px`,
              objectFit: "cover",
              flexShrink: 0,
            }}
            className="carousel-image"
            onError={(e) => {
              // Fallback to static image if banner fails to load
              e.target.src = carouselImage;
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;