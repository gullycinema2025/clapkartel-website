import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import NavBar from './components/Navbar';
import Carousel from './components/Carousel';
import Footer from './components/Footer';

// Core entry pages
import Login from './components/Login/index';
import LoginPassword from './components/LoginPassword';
import HomePage from './components/HomePage';
import LandingPage from './components/LandingPage';

// Lazy-loaded routes for code-splitting (reduces initial JS bundle by ~70-80%)
const Signup = lazy(() => import('./components/Signup'));
const OTPVerification = lazy(() => import('./components/OTPVerification'));
const ForgotPassword = lazy(() => import('./components/ForgotPassword'));
const CraftPage = lazy(() => import('./components/CraftsPage'));
const CraftDetailPage = lazy(() => import('./components/CraftDetailPage'));
const OtherSection = lazy(() => import('./components/OtherSection'));
const OtherSectionDetailPage = lazy(() => import('./components/OtherSectionDetailPage'));
const OtherSectionContentPage = lazy(() => import('./components/OtherSectionContentPage'));
const InnerDataPage = lazy(() => import('./components/InnerDataPage'));
const ChoreographyPage = lazy(() => import('./components/ChoreographyPage'));
const DetailChoreographyPage = lazy(() => import('./components/DetailChoreographyPage'));
const WishlistPage = lazy(() => import('./components/WishlistPage'));
const NotificationsPage = lazy(() => import('./components/NotificationsPage'));
const Profile = lazy(() => import('./components/Profile'));
const ProfileUpdate = lazy(() => import('./components/ProfileUpdate'));
const Gallery = lazy(() => import('./components/Gallery'));
const SubCategoryUsersPage = lazy(() => import('./components/SubCategoryUsersPage'));
const UsersPage = lazy(() => import('./components/UsersPage'));
const ActorsPage = lazy(() => import('./components/ActorsPage'));
const ActressPage = lazy(() => import('./components/ActressPage'));
const CastingPage = lazy(() => import('./components/CastingPage'));
const UsersProfile = lazy(() => import('./components/UsersProfile'));
const DirectorPage = lazy(() => import('./components/DirectorPage'));
const MessagesPage = lazy(() => import('./components/Messages'));
const Reel = lazy(() => import('./components/Reel'));

// Settings & Support Pages
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const AccountSettings = lazy(() => import('./components/SettingsPage/AccountSettings'));
const SupportPage = lazy(() => import('./components/SupportPage'));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'));
const TermsConditionPage = lazy(() => import('./components/TermsConditionPage'));
const ChangePassword = lazy(() => import('./components/ChangePassword'));
const AboutAppPage = lazy(() => import('./components/AboutAppPage'));
const SupportContact = lazy(() => import('./components/SupportContact'));

// Lightweight fallback loader
const PageFallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: '36px', height: '36px', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

function App() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAuthenticated = token !== null && token !== undefined && token !== '';

  // Pages where Header, NavBar, Carousel, and Footer should NOT appear
  const authPages = ['/login', '/login-password', '/forgot-password', '/signup', '/verify-otp', '/support-contact'];

  // Pages that have embedded Header/NavBar (don't show global Header/NavBar)
  const embeddedHeaderPages = ['/users'];

  const isLandingPage = location.pathname === '/' && !isAuthenticated;

  const showHeaderNavCarousel = isAuthenticated && !authPages.includes(location.pathname) && !embeddedHeaderPages.includes(location.pathname) && !isLandingPage;

  // Pages where Carousel should NOT appear (but Header and NavBar should)
  const noCarouselPages = ['/', '/detailchoreographypage', '/notification', '/wishlist', '/users', '/followers', '/profile', '/profileupate', '/gallery', '/cast-crew', '/directory', '/casting', '/user-profile', '/director', '/craft-detail', '/subcategory-users', '/other-section-content', '/other-section-detail', '/inner-data', '/settings', '/account-settings', '/about-app', '/support', '/privacy-policy', '/terms-conditions', '/change-password', '/messages', '/reels'];

  const showCarousel = showHeaderNavCarousel && !noCarouselPages.includes(location.pathname);

  return (
    <div className="App">
      <ScrollToTop />
      {showHeaderNavCarousel && (
        <>
          <Header />
          <NavBar />
          {showCarousel && <Carousel />}
        </>
      )}

      {/* Semantic Main Landmark for Accessibility & Performance */}
      <main id="main-content" role="main" style={{ width: '100%' }}>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public Routes - No Authentication Required */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/login-password" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPassword />} />
            <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />} />
            <Route path="/verify-otp" element={isAuthenticated ? <Navigate to="/" replace /> : <OTPVerification />} />
            <Route path="/support-contact" element={<SupportContact />} />

            {/* Protected Routes - Authentication Required */}
            <Route path="/" element={isAuthenticated ? <ProtectedRoute><HomePage /></ProtectedRoute> : <LandingPage />} />
            <Route path="/craft" element={<ProtectedRoute><CraftPage /></ProtectedRoute>} />
            <Route path="/craft-detail" element={<ProtectedRoute><CraftDetailPage /></ProtectedRoute>} />
            <Route path="/other-section" element={<ProtectedRoute><OtherSection /></ProtectedRoute>} />
            <Route path='/choreography' element={<ProtectedRoute><ChoreographyPage /></ProtectedRoute>} />
            <Route path='/detailchoreographypage' element={<ProtectedRoute><DetailChoreographyPage /></ProtectedRoute>} />
            <Route path='/followers' element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path='/users' element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
            <Route path='/cast-crew' element={<ProtectedRoute><ActorsPage /></ProtectedRoute>} />
            <Route path='/directory' element={<ProtectedRoute><ActressPage /></ProtectedRoute>} />
            <Route path='/casting' element={<ProtectedRoute><CastingPage /></ProtectedRoute>} />
            <Route path='/director' element={<ProtectedRoute><DirectorPage /></ProtectedRoute>} />
            <Route path='/notification' element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path='/messages' element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path='/reels' element={<ProtectedRoute><Reel /></ProtectedRoute>} />

            <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path='/profileupate' element={<ProtectedRoute><ProfileUpdate /></ProtectedRoute>} />
            <Route path='/gallery' element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
            <Route path='/subcategory-users' element={<ProtectedRoute><SubCategoryUsersPage /></ProtectedRoute>} />
            <Route path='/other-section-content' element={<ProtectedRoute><OtherSectionContentPage /></ProtectedRoute>} />
            <Route path='/other-section-detail' element={<ProtectedRoute><OtherSectionDetailPage /></ProtectedRoute>} />
            <Route path='/inner-data' element={<ProtectedRoute><InnerDataPage /></ProtectedRoute>} />

            <Route path='/user-profile' element={<ProtectedRoute><UsersProfile /></ProtectedRoute>} />

            {/* Settings & Support Routes */}
            <Route path='/settings' element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path='/account-settings' element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
            <Route path='/about-app' element={<ProtectedRoute><AboutAppPage /></ProtectedRoute>} />
            <Route path='/support' element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
            <Route path='/privacy-policy' element={<PrivacyPolicyPage />} />
            <Route path='/terms-conditions' element={<TermsConditionPage />} />
            <Route path='/change-password' element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>

      {(showHeaderNavCarousel || embeddedHeaderPages.includes(location.pathname)) && location.pathname !== '/messages' && location.pathname !== '/reels' && <Footer />}
    </div>
  );
}

export default App;


