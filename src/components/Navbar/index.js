import React from 'react';
import "./index.css";
import { useNavigate, useLocation } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveStyle = (path) => {
    return location.pathname === path ? { color: '#BF8906', fontWeight: 'bold' } : {};
  };

  return (
    <div className="navbar-container">
      <ul className="navbar-left-menu">
        <li style={location.pathname === '/craft-detail' && location.state?.categoryId === '13' ? { color: '#BF8906', fontWeight: 'bold' } : {}}
          onClick={() => navigate('/craft-detail', { state: { categoryId: '13', categoryName: 'Cast & Crew' } })}>Cast & Crew</li>
        <li style={getActiveStyle('/other-section-detail')} onClick={() => navigate('/other-section-detail', {
          state: { sectionId: '181', sectionName: 'Lessons', sectionImage: 'dailyNews.png' }
        })}>Lessons</li>
        <li style={location.pathname === '/' && location.state?.scrollToRentals ? { color: '#BF8906', fontWeight: 'bold' } : {}}
          onClick={() => navigate('/', { state: { scrollToRentals: true } })}>Rentals</li>
        <li style={getActiveStyle('/directory')} onClick={() => navigate('/directory')}>Directory</li>
        <li style={getActiveStyle('/craft')} onClick={() => navigate('/craft')}>24 Crafts</li>
        <li style={getActiveStyle('/other-section')} onClick={() => navigate('/other-section')}>Other Sections</li>
      </ul>
      <ul className="navbar-right-menu">
        <li style={getActiveStyle('/users')} onClick={() => navigate('/users')}>Users</li>
        <li style={getActiveStyle('/followers')} onClick={() => navigate('/followers')}>Followers</li>
        <li style={getActiveStyle('/reels')} onClick={() => navigate('/reels')}>Reels</li>
      </ul>
    </div>
  );
};

export default NavBar;