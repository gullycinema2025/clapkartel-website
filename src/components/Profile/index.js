import React, { useState, useEffect } from 'react'
import image2 from "../../assets/profileImage2.jpg";
import profileBanner from "../../assets/profile-banner.png";
import profileSkillIcon from "../../assets/profileskillicon.svg";
import skillViewIcon from "../../assets/skill-view-icon.svg";
import skillEditIcon from "../../assets/skill-edit-icon.svg";
import skillDeleteIcon from "../../assets/skill-delete-icon.svg";
import './index.css'
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEdit2, FiTrash2, FiUser, FiInfo, FiBriefcase, FiAward, FiFileText, FiVideo, FiCalendar, FiPlus, FiX, FiAlertTriangle } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { MdPhotoLibrary } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';


const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Location names state
  const [locationNames, setLocationNames] = useState({
    country: '',
    state: '',
    city: ''
  });

  // View Modal state
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillDetails, setSkillDetails] = useState(null);
  const [loadingSkillDetails, setLoadingSkillDetails] = useState(false);
  const [skillDetailsError, setSkillDetailsError] = useState(null);

  // Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    cat_id: '',
    sub_cat_id: '',
    user_about: '',
    user_special_skills: '',
    user_bio: '',
    videos: [{ title: '', description: '', link: '' }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add Skill Modal state
  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [addSkillFormData, setAddSkillFormData] = useState({
    cat_id: '',
    sub_cat_id: '',
    user_about: '',
    user_special_skills: '',
    user_bio: '',
    video_links: ['']
  });
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Message popup state
  const [showMessage, setShowMessage] = useState(false);
  const [messageContent, setMessageContent] = useState({ type: '', text: '' });

  // My Reels Modal state
  const [isMyReelsModalOpen, setIsMyReelsModalOpen] = useState(false);
  const [myReels, setMyReels] = useState([]);
  const [myReelsLoading, setMyReelsLoading] = useState(false);
  const [myReelsError, setMyReelsError] = useState(null);

  // Reel Delete state
  const [reelToDelete, setReelToDelete] = useState(null);
  const [isDeleteReelModalOpen, setIsDeleteReelModalOpen] = useState(false);
  const [isDeletingReel, setIsDeletingReel] = useState(false);

  const fetchMyReels = async () => {
    try {
      setMyReelsLoading(true);
      setMyReelsError(null);
      const token = localStorage.getItem('token');
      const res = await fetch('https://www.whysocial.in/clap-kartel-reels-module/public/api/reels/my-reels', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const decoded = await res.json();
        let list = [];
        if (decoded && decoded.data) {
          if (Array.isArray(decoded.data)) list = decoded.data;
          else if (typeof decoded.data === 'object') {
            if (Array.isArray(decoded.data.reels)) list = decoded.data.reels;
            else list = [decoded.data];
          }
        } else if (decoded && Array.isArray(decoded.reels)) {
          list = decoded.reels;
        } else if (Array.isArray(decoded)) {
          list = decoded;
        }
        setMyReels(list);
      } else {
        setMyReelsError('Failed to fetch reels.');
        setMyReels([]);
      }
    } catch (e) {
      setMyReelsError('Error loading reels.');
      setMyReels([]);
    } finally {
      setMyReelsLoading(false);
    }
  };

  const handleOpenMyReelsModal = () => {
    setIsMyReelsModalOpen(true);
    fetchMyReels();
  };

  const handleConfirmDeleteReel = async () => {
    if (!reelToDelete) return;
    try {
      setIsDeletingReel(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`https://www.whysocial.in/clap-kartel-reels-module/public/api/reels/${reelToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok || res.status === 200 || res.status === 204) {
        displayMessage('success', 'Reel deleted successfully');
        setIsDeleteReelModalOpen(false);
        setReelToDelete(null);
        fetchMyReels();
      } else {
        const data = await res.json().catch(() => ({}));
        displayMessage('error', data.message || 'Failed to delete reel');
      }
    } catch (e) {
      displayMessage('error', 'Error deleting reel');
    } finally {
      setIsDeletingReel(false);
    }
  };

  // Helper function to display message popup
  const displayMessage = (type, text) => {
    setMessageContent({ type, text });
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  // API Configuration
  const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';

  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch categories
  const fetchCategories = async (userLookingFor) => {
    try {
      setLoadingCategories(true);
      const response = await fetch(`${BASE_URL}/api/allCategoryList`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        let errorMsg = `Failed to fetch categories: ${response.status}`;
        try {
          const errRes = await response.json();
          if (errRes?.messages?.error) errorMsg = errRes.messages.error;
          else if (errRes?.error && typeof errRes.error === 'string') errorMsg = errRes.error;
          else if (errRes?.message) errorMsg = errRes.message;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      const result = await response.json();


      if (result?.categoryList && result.categoryList.length > 0) {
        // If skill user (null or 1): hide RENTALS (id=22)
        // If service user (2): show only RENTALS
        const isServiceUser = String(userLookingFor) === '2';
        if (isServiceUser) {
          setCategories(result.categoryList); // keep all, we lock the dropdown anyway
        } else {
          // null or 1 => filter out RENTALS
          const filtered = result.categoryList.filter(cat => String(cat.id) !== '22');
          setCategories(filtered);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      displayMessage('error', err.message || 'Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch subcategories based on category (matching mobile app)
  const fetchSubcategories = async (catId) => {
    try {
      setLoadingSubcategories(true);
      setSubcategories([]);

      const url = String(catId) === '22'
        ? `${BASE_URL}/api/allSubCategoryList/${catId}?only_display=rentals`
        : `${BASE_URL}/api/allSubCategoryList/${catId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        let errorMsg = `Failed to fetch subcategories: ${response.status}`;
        try {
          const errRes = await response.json();
          if (errRes?.messages?.error) errorMsg = errRes.messages.error;
          else if (errRes?.error && typeof errRes.error === 'string') errorMsg = errRes.error;
          else if (errRes?.message) errorMsg = errRes.message;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      const result = await response.json();

      let subList = [];
      if (result?.subcategorylist && Array.isArray(result.subcategorylist)) {
        subList = result.subcategorylist;
      } else if (result?.data && Array.isArray(result.data)) {
        subList = result.data;
      } else if (Array.isArray(result)) {
        subList = result;
      }

      if (subList.length > 0) {
        const sorted = [...subList].sort((a, b) =>
          (a.sub_cat_name || '').toLowerCase().localeCompare((b.sub_cat_name || '').toLowerCase())
        );
        setSubcategories(sorted);
      } else {
        setSubcategories([]);
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      displayMessage('error', err.message || 'Failed to load subcategories');
    } finally {
      setLoadingSubcategories(false);
    }
  };

  // Fetch user profile data and skills
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BASE_URL}/userpro/getprofessionrecord`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          let errorMsg = `Failed to fetch user data: ${response.status}`;
          try {
            const errRes = await response.json();
            if (errRes?.messages?.error) errorMsg = errRes.messages.error;
            else if (errRes?.error && typeof errRes.error === 'string') errorMsg = errRes.error;
            else if (errRes?.message) errorMsg = errRes.message;
          } catch (e) { }
          throw new Error(errorMsg);
        }

        const result = await response.json();

        console.log('=== PROFILE DATA API RESPONSE ===');
        console.log('Full API Response:', result);
        console.log('User Data:', result.data);
        console.log('================================');

        if (result?.status === 'success' && result?.data && result.data.length > 0) {
          setUserData(result.data[0]);
          console.log('User Profile Set:', result.data[0]);
        } else {
          throw new Error('No user data found');
        }

      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserSkills = async () => {
      try {
        setSkillsLoading(true);

        const response = await fetch(`${BASE_URL}/api/getUserSubCatList`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          let errorMsg = `Failed to fetch skills: ${response.status}`;
          try {
            const errRes = await response.json();
            if (errRes?.messages?.error) errorMsg = errRes.messages.error;
            else if (errRes?.error && typeof errRes.error === 'string') errorMsg = errRes.error;
            else if (errRes?.message) errorMsg = errRes.message;
          } catch (e) { }
          throw new Error(errorMsg);
        }

        const result = await response.json();


        if (result?.status && result?.userSubCatList && result.userSubCatList.length > 0) {
          setSkills(result.userSubCatList);
        }

      } catch (err) {
        console.error('Error fetching skills:', err);
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchUserData();
    fetchUserSkills();
  }, []);

  // Fetch location names when userData is available
  useEffect(() => {
    const fetchLocationNames = async () => {
      if (!userData) return;

      const BASE_URL = 'https://www.whysocial.in/clap-kartel/public';
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      try {
        // Fetch country name
        if (userData.userCountry && userData.userCountry !== '0') {
          const countryResponse = await fetch(`${BASE_URL}/api/locations`, {
            method: 'GET',
            headers: headers
          });

          if (countryResponse.ok) {
            const countryResult = await countryResponse.json();
            const countries = countryResult?.data || countryResult || [];
            const country = countries.find(c => c.id === userData.userCountry || c.id === parseInt(userData.userCountry));
            if (country) {
              setLocationNames(prev => ({ ...prev, country: country.name }));
            }
          }
        }

        // Fetch state name
        if (userData.userCountry && userData.userStateList && userData.userStateList !== '0') {
          const stateResponse = await fetch(`${BASE_URL}/api/locations?country_id=${userData.userCountry}`, {
            method: 'GET',
            headers: headers
          });

          if (stateResponse.ok) {
            const stateResult = await stateResponse.json();
            const states = stateResult?.data || stateResult || [];
            const state = states.find(s => s.id === userData.userStateList || s.id === parseInt(userData.userStateList));
            if (state) {
              setLocationNames(prev => ({ ...prev, state: state.name }));
            }
          }
        }

        // Fetch city name
        if (userData.userStateList && userData.userCity && userData.userCity !== '0') {
          const cityResponse = await fetch(`${BASE_URL}/api/locations?state_id=${userData.userStateList}`, {
            method: 'GET',
            headers: headers
          });

          if (cityResponse.ok) {
            const cityResult = await cityResponse.json();
            const cities = cityResult?.data || cityResult || [];
            const city = cities.find(c => c.id === userData.userCity || c.id === parseInt(userData.userCity));
            if (city) {
              setLocationNames(prev => ({ ...prev, city: city.name }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching location names:', error);
      }
    };

    fetchLocationNames();
  }, [userData]);

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `https://www.whysocial.in/clap-kartel/public/${imagePath}`;
  };

  const profileImageUrl = userData?.userProfileImage
    ? getProfileImageUrl(userData.userProfileImage)
    : image2;

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to get video URL
  const getVideoUrl = (video) => {
    if (!video) return null;
    if (typeof video === 'string') return video;
    return video?.link || video?.video_link || video?.url || video?.video_url || null;
  };

  // Skill action handlers
  const handleViewSkill = async (skill) => {
    try {
      setSelectedSkill(skill);
      setIsSkillModalOpen(true);
      setLoadingSkillDetails(true);
      setSkillDetailsError(null);

      const response = await fetch(`${BASE_URL}/api/viewUserSkills/${skill.e_pro_id}`, {
        method: 'GET',
        headers: getAuthHeaders()

      });
      console.log("skill", skill.e_pro_id)

      if (!response.ok) {
        let errorMsg = `Failed to view skill: ${response.status}`;
        try {
          const errRes = await response.json();
          if (errRes?.messages?.error) errorMsg = errRes.messages.error;
          else if (errRes?.error && typeof errRes.error === 'string') errorMsg = errRes.error;
          else if (errRes?.message) errorMsg = errRes.message;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      const result = await response.json();


      setSkillDetails(result.data);
      setLoadingSkillDetails(false);
    } catch (err) {
      console.error('Error viewing skill:', err);
      setSkillDetailsError(err.message || 'Failed to load skill details');
      setLoadingSkillDetails(false);
    }
  };

  const handleEditSkill = async (skill) => {
    try {
      setSelectedSkill(skill);
      setLoadingSkillDetails(true);

      // Fetch skill details first
      const response = await fetch(`${BASE_URL}/api/viewUserSkills/${skill.e_pro_id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        let errorMsg = `Failed to fetch skill details: ${response.status}`;
        try {
          const errRes = await response.json();
          if (errRes?.messages?.error) errorMsg = errRes.messages.error;
          else if (errRes?.error && typeof errRes.error === 'string') errorMsg = errRes.error;
          else if (errRes?.message) errorMsg = errRes.message;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      const result = await response.json();


      const professionInfo = result.data?.profession_info || {};
      const videoLinks = result.data?.video_links || [];
      const videoTitles = result.data?.video_title || [];
      const videoDescriptions = result.data?.video_short_description || [];

      // Align array elements to video objects
      const maxLen = Math.max(videoLinks.length, videoTitles.length, videoDescriptions.length);
      const videos = [];
      for (let i = 0; i < maxLen; i++) {
        videos.push({
          link: videoLinks[i] || '',
          title: videoTitles[i] || '',
          description: videoDescriptions[i] || ''
        });
      }

      if (videos.length === 0) {
        videos.push({ title: '', description: '', link: '' });
      }

      // Populate form with existing data
      setEditFormData({
        cat_id: professionInfo.cat_id || skill.cat_id || '',
        sub_cat_id: professionInfo.sub_cat_id || skill.sub_cat_id || '',
        user_about: professionInfo.user_about || '',
        user_special_skills: professionInfo.user_special_skills || '',
        user_bio: professionInfo.user_bio || '',
        videos: videos
      });

      setIsEditModalOpen(true);
      setLoadingSkillDetails(false);
    } catch (err) {
      console.error('Error loading skill for edit:', err);
      displayMessage('error', err.message || 'Failed to load skill details for editing');
      setLoadingSkillDetails(false);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVideoChange = (index, field, value) => {
    setEditFormData(prev => {
      const newVideos = [...prev.videos];
      newVideos[index] = {
        ...newVideos[index],
        [field]: value
      };
      return { ...prev, videos: newVideos };
    });
  };

  const handleAddVideo = () => {
    setEditFormData(prev => ({
      ...prev,
      videos: [...prev.videos, { title: '', description: '', link: '' }]
    }));
  };

  const handleRemoveVideo = (index) => {
    setEditFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSkill) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('cat_id', editFormData.cat_id);
      formData.append('sub_cat_id', editFormData.sub_cat_id);
      formData.append('user_about', editFormData.user_about);
      formData.append('user_special_skills', editFormData.user_special_skills);
      formData.append('user_bio', editFormData.user_bio);

      // Add video details
      editFormData.videos.forEach((video, index) => {
        if (video.link.trim()) {
          formData.append(`video_link[${index}]`, video.link.trim());
          formData.append(`video_title[${index}]`, video.title.trim());
          formData.append(`video_short_description[${index}]`, video.description.trim());
        }
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/upddateUserSkills/${selectedSkill.e_pro_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        let errorMsg = `Failed to update skill: ${response.status}`;
        try {
          const errRes = await response.json();
          if (errRes?.messages?.error) errorMsg = errRes.messages.error;
          else if (errRes?.error && typeof errRes.error === 'string') errorMsg = errRes.error;
          else if (errRes?.message) errorMsg = errRes.message;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        result = { status: true };
      }

      // Refresh skills list
      const skillsResponse = await fetch(`${BASE_URL}/api/getUserSubCatList`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (skillsResponse.ok) {
        const skillsResult = await skillsResponse.json();
        if (skillsResult?.status && skillsResult?.userSubCatList) {
          setSkills(skillsResult.userSubCatList);
        }
      }

      displayMessage('success', 'Skill updated successfully!');
      handleCloseEditModal();
    } catch (err) {
      console.error('Error updating skill:', err);
      displayMessage('error', err.message || 'Failed to update skill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTimeout(() => {
      setSelectedSkill(null);
      setEditFormData({
        cat_id: '',
        sub_cat_id: '',
        user_about: '',
        user_special_skills: '',
        user_bio: '',
        videos: [{ title: '', description: '', link: '' }]
      });
    }, 300);
  };

  const handleDeleteSkill = (skill) => {
    setSkillToDelete(skill);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!skillToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/deletUserSkills/${skillToDelete.e_pro_id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        let errorMsg = `Failed to delete skill: ${response.status}`;
        try {
          const errRes = await response.json();
          if (errRes?.messages?.error) errorMsg = errRes.messages.error;
          else if (errRes?.error && typeof errRes.error === 'string') errorMsg = errRes.error;
          else if (errRes?.message) errorMsg = errRes.message;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        result = { status: true };
      }

      // Remove the skill from the local state
      setSkills(prevSkills => prevSkills.filter(s => s.e_pro_id !== skillToDelete.e_pro_id));

      displayMessage('success', `Successfully deleted: ${skillToDelete.sub_cat_name}`);
      handleCloseDeleteModal();
    } catch (err) {
      console.error('Error deleting skill:', err);
      displayMessage('error', err.message || 'Failed to delete skill. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTimeout(() => {
      setSkillToDelete(null);
    }, 300);
  };

  // Add Skill Modal Handlers
  const handleOpenAddSkillModal = async () => {
    setIsAddSkillModalOpen(true);

    // userLookingFor comes from the profile API userData or localStorage (check both cases)
    const lookingFor = userData?.userLookingFor || userData?.userlookingfor || localStorage.getItem('userlookingFor');

    await fetchCategories(lookingFor);

    // If service user (userLookingFor === '2'), auto-lock to RENTALS (id=22)
    if (String(lookingFor) === '2') {
      setAddSkillFormData(prev => ({
        ...prev,
        cat_id: '22',
        sub_cat_id: ''
      }));
      fetchSubcategories('22');
    }
  };

  const handleCloseAddSkillModal = () => {
    setIsAddSkillModalOpen(false);
    setTimeout(() => {
      setAddSkillFormData({
        cat_id: '',
        sub_cat_id: '',
        user_about: '',
        user_special_skills: '',
        user_bio: '',
        video_links: ['']
      });
      setSubcategories([]);
    }, 300);
  };

  const handleAddSkillFormChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cat_id') {
      setAddSkillFormData(prev => ({
        ...prev,
        cat_id: value,
        sub_cat_id: '' // Reset subcategory when category changes
      }));

      if (value) {
        fetchSubcategories(value);
      } else {
        setSubcategories([]);
      }
    } else {
      setAddSkillFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddSkillVideoLinkChange = (index, value) => {
    setAddSkillFormData(prev => {
      const newVideoLinks = [...prev.video_links];
      newVideoLinks[index] = value;
      return { ...prev, video_links: newVideoLinks };
    });
  };

  const handleAddSkillAddVideoLink = () => {
    setAddSkillFormData(prev => ({
      ...prev,
      video_links: [...prev.video_links, '']
    }));
  };

  const handleAddSkillRemoveVideoLink = (index) => {
    setAddSkillFormData(prev => ({
      ...prev,
      video_links: prev.video_links.filter((_, i) => i !== index)
    }));
  };

  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!addSkillFormData.cat_id || !addSkillFormData.sub_cat_id) {
      displayMessage('error', 'Please select both Category and Subcategory');
      return;
    }

    setIsAddingSkill(true);

    try {
      const formData = new FormData();
      formData.append('cat_id', addSkillFormData.cat_id);
      formData.append('sub_cat_id', addSkillFormData.sub_cat_id);
      formData.append('user_about', addSkillFormData.user_about);
      formData.append('user_special_skills', addSkillFormData.user_special_skills);
      formData.append('user_bio', addSkillFormData.user_bio);

      // Add video links
      addSkillFormData.video_links.forEach((link, index) => {
        if (link.trim()) {
          formData.append(`video_link[${index}]`, link.trim());
        }
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/api/postuserskills`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        let errorMsg = `Failed to add skill: ${response.status}`;
        try {
          const errRes = await response.json();
          if (errRes?.messages?.error) errorMsg = errRes.messages.error;
          else if (errRes?.error && typeof errRes.error === 'string') errorMsg = errRes.error;
          else if (errRes?.message) errorMsg = errRes.message;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      let result;
      try {
        result = await response.json();
      } catch (e) {
        result = { status: true };
      }

      // Refresh skills list
      const skillsResponse = await fetch(`${BASE_URL}/api/getUserSubCatList`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (skillsResponse.ok) {
        const skillsResult = await skillsResponse.json();
        if (skillsResult?.status && skillsResult?.userSubCatList) {
          setSkills(skillsResult.userSubCatList);
        }
      }

      displayMessage('success', 'Skill added successfully!');
      handleCloseAddSkillModal();
    } catch (err) {
      console.error('Error adding skill:', err);
      displayMessage('error', err.message || 'Failed to add skill. Please try again.');
    } finally {
      setIsAddingSkill(false);
    }
  };

  // Handle modal close
  const handleCloseSkillModal = () => {
    setIsSkillModalOpen(false);
    setLoadingSkillDetails(false);
    setSkillDetailsError(null);
    setTimeout(() => {
      setSelectedSkill(null);
      setSkillDetails(null);
    }, 300);
  };

  // Render skill modal content
  const renderSkillModalContent = () => {
    // Show loading state
    if (loadingSkillDetails) {
      return (
        <div className="modal-loading">
          <motion.div
            className="modal-loader"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>Loading skill details...</p>
        </div>
      );
    }

    // Show error state
    if (skillDetailsError) {
      return (
        <div className="modal-error">
          <div className="no-profiles-icon">⚠️</div>
          <h3 className="no-profiles-title">Error Loading Details</h3>
          <p className="no-profiles-subtitle">
            {skillDetailsError}
          </p>
        </div>
      );
    }

    // Show empty state
    if (!skillDetails) {
      return (
        <div className="no-profiles-container">
          <h3 className="no-profiles-title">No details available</h3>
        </div>
      );
    }

    // Show skill details
    const professionInfo = skillDetails.profession_info || {};
    const videoLinks = skillDetails.video_links || [];

    return (
      <div className="skill-details-container">
        {/* Profession Details Section */}
        {selectedSkill && (
          <div className="skill-detail-section">
            <div className="skill-detail-header">
              <FiBriefcase className="skill-detail-icon" />
              <h3 className="skill-detail-title">General Info</h3>
            </div>
            <div className="skill-detail-content">
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{selectedSkill.cat_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Sub Category:</span>
                <span className="detail-value">{selectedSkill.sub_cat_name}</span>
              </div>
              {professionInfo.user_about && (
                <div className="detail-row">
                  <span className="detail-label">About:</span>
                  <span className="detail-value">{professionInfo.user_about}</span>
                </div>
              )}
              {professionInfo.create_at && (
                <div className="detail-row">
                  <span className="detail-label">Created At:</span>
                  <span className="detail-value">{formatDate(professionInfo.create_at)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Bio Section */}
        {professionInfo.user_bio && (
          <div className="skill-detail-section">
            <div className="skill-detail-header">
              <FiInfo className="skill-detail-icon" />
              <h3 className="skill-detail-title">Bio</h3>
            </div>
            <p className="skill-detail-content">{professionInfo.user_bio}</p>
          </div>
        )}

        {/* Special Skills Section */}
        {professionInfo.user_special_skills && (
          <div className="skill-detail-section">
            <div className="skill-detail-header">
              <FiAward className="skill-detail-icon" />
              <h3 className="skill-detail-title">Special Skills</h3>
            </div>
            <p className="skill-detail-content">{professionInfo.user_special_skills}</p>
          </div>
        )}

        {/* Video Links Section */}
        <div className="skill-detail-section">
          <div className="skill-detail-header">
            <FiVideo className="skill-detail-icon" />
            <h3 className="skill-detail-title">Videos</h3>
          </div>
          <div className="skill-detail-content">
            {videoLinks && videoLinks.length > 0 ? (
              <div className="video-links-container">
                {videoLinks.map((video, index) => {
                  const videoUrl = getVideoUrl(video);

                  if (!videoUrl) return null;

                  return (
                    <div key={index} className="video-link-item">
                      <div className="profile-video-thumbnail">
                        <FiVideo className="video-icon" />
                      </div>
                      <div className="video-info">
                        <p className="video-title">
                          {video?.title || video?.name || `Video ${index + 1}`}
                        </p>
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="video-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiVideo style={{ fontSize: '14px' }} />
                          Open Video Link
                        </a>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}

                {videoLinks.filter(video => getVideoUrl(video)).length === 0 && (
                  <div className="no-videos">
                    <FiVideo className="no-videos-icon" />
                    <p className="no-videos-text">No valid video links available</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-videos">
                <FiVideo className="no-videos-icon" />
                <p className="no-videos-text">No videos available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
        <div style={{ color: '#bf8906', fontSize: '18px', fontWeight: '500' }}>
          Loading profile...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
        <div style={{ color: '#bf8906', fontSize: '18px', fontWeight: '500' }}>
          Error loading profile: {error}
        </div>
      </div>
    );
  }

  // Determine if service user (userLookingFor === '2') or skill user (null / '1')
  // userData is fetched from the profile API on mount
  const isServiceUser = String(userData?.userLookingFor) === '2' || String(userData?.userlookingfor) === '2' || localStorage.getItem('userlookingFor') === '2';

  return (
    <>
      <div className="new-profile-container">
        {/* Left Column: Profile Card */}
        <div className="profile-card">
          {/* Banner Image with Profile Photo */}
          <div className="profile-banner-section">
            <img src={profileBanner} alt="Profile Banner" className="profile-banner-image" />
            <div className="profile-photo-wrapper">
              <img src={profileImageUrl} alt="Profile" className="profile-card-image" />
            </div>
          </div>

          {/* User Name */}
          <h2 className="profile-card-name">
            {userData?.['userName ']?.trim() || userData?.userName || 'User Name'}
          </h2>

          {/* Email and Phone */}
          <div className="profile-card-contact">
            <span className="profile-card-label">
              {userData?.['userEmailid ']?.trim() || userData?.userEmailid || 'Email not available'}
            </span>
            <span className="profile-card-detail-separator">|</span>
            <span className="profile-card-label">
              {userData?.['userContact ']?.trim() || userData?.userContact || 'Phone not available'}
            </span>
          </div>

          {/* Height and Age */}
          <div className="profile-card-detail-row">
            <span className="profile-card-detail-label">
              Height: {userData?.userHeight || 'N/A'}
            </span>
            <span className="profile-card-detail-separator">|</span>
            <span className="profile-card-detail-label">
              Age Group: {userData?.userAge || 'N/A'}
            </span>
          </div>

          {/* Location Section - White Background */}
          <div className="profile-card-section">
            <h4 className="profile-card-section-title">Location</h4>
            <p className="profile-card-section-text">
              {userData?.userAddress && userData.userAddress.trim() ? (
                <>
                  {userData.userAddress}
                  {(locationNames.city || locationNames.state || locationNames.country || userData?.userZipcode) && (
                    <>
                      <br />
                      {locationNames.city && `${locationNames.city}`}
                      {locationNames.state && `${locationNames.city ? ', ' : ''}${locationNames.state}`}
                      {locationNames.country && `${(locationNames.city || locationNames.state) ? ', ' : ''}${locationNames.country}`}
                      {userData?.userZipcode && userData.userZipcode.trim() && ` - ${userData.userZipcode}`}
                    </>
                  )}
                </>
              ) : (
                'Address not provided'
              )}
            </p>
          </div>

          {/* Social Links Section - White Background */}
          <div className="profile-card-section">
            <h4 className="profile-card-section-title">Social Links</h4>
            {(userData?.userSocialLinkFace || userData?.userSocialLinkInsta || userData?.userSocialLinkYoutube) ? (
              <div className="profile-card-social-icons">
                {userData?.userSocialLinkFace && userData.userSocialLinkFace.trim() !== '' ? (
                  <a
                    href={userData.userSocialLinkFace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-card-social-icon facebook"
                  >
                    <FaFacebookF />
                  </a>
                ) : null}

                {userData?.userSocialLinkInsta && userData.userSocialLinkInsta.trim() !== '' ? (
                  <a
                    href={userData.userSocialLinkInsta}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-card-social-icon instagram"
                  >
                    <FaInstagram />
                  </a>
                ) : null}

                {userData?.userSocialLinkYoutube && userData.userSocialLinkYoutube.trim() !== '' ? (
                  <a
                    href={userData.userSocialLinkYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-card-social-icon youtube"
                  >
                    <FaYoutube />
                  </a>
                ) : null}
              </div>
            ) : (
              <p className="profile-card-section-text profile-card-null-message">No social links added</p>
            )}
          </div>

          {/* Budget Section - White Background */}
          <div className="profile-card-section">
            <h4 className="profile-card-section-title">Budget</h4>
            <p className="profile-card-section-text">
              {userData?.userBudget && userData.userBudget.trim() !== ''
                ? `₹ ${userData.userBudget}`
                : 'Budget not specified'}
            </p>
          </div>

          {/* About Section - White Background */}
          <div className="profile-card-section">
            <h4 className="profile-card-section-title">About</h4>
            <p className="profile-card-section-text">
              {userData?.userAbout && userData.userAbout.trim() !== ''
                ? userData.userAbout
                : 'No description provided'}
            </p>
          </div>

          {/* Edit Profile Button */}
          <button className="profile-card-edit-button" onClick={() => navigate('/profileupate')}>
            Edit Profile
          </button>
        </div>

        {/* Right Column: Main Content */}
        <div className="profile-main-content">
          {/* Skills Section */}
          <div className="profile-skills-section">
            <div className="profile-section-header">
              <h3 className="profile-section-title">{isServiceUser ? 'Services' : 'Skills'}</h3>
              <div className="profile-section-buttons">
                <button
                  className="profile-gallery-button"
                  onClick={() => navigate('/gallery')}
                >
                  <MdPhotoLibrary size={18} />
                  Gallery
                </button>
                <button
                  className="profile-gallery-button profile-reels-btn"
                  onClick={handleOpenMyReelsModal}
                >
                  <FiVideo size={18} />
                  My Reels
                </button>
                <button
                  className="profile-add-skills-button"
                  onClick={handleOpenAddSkillModal}
                >
                  {isServiceUser ? 'Add More Services' : 'Add More Skills'}
                </button>
              </div>
            </div>

            {!skillsLoading && skills.length > 0 && (
              <div className="profile-skills-grid">
                {skills.map((skill, index) => (
                  <div key={index} className="profile-skill-card">
                    <div className="skill-card-header">
                      <div className="skill-header-left">
                        <img src={profileSkillIcon} alt="skill icon" className="skill-icon" />
                        <div className="skill-category">{skill.cat_name}</div>
                      </div>
                      <div className="skill-actions">
                        <button
                          className="skill-action-btn view-btn"
                          onClick={() => handleViewSkill(skill)}
                          title="View Details"
                        >
                          <img src={skillViewIcon} alt="view" className="skill-action-icon" />
                        </button>
                        <button
                          className="skill-action-btn edit-btn"
                          onClick={() => handleEditSkill(skill)}
                          title={isServiceUser ? 'Edit Service' : 'Edit Skill'}
                        >
                          <img src={skillEditIcon} alt="edit" className="skill-action-icon" />
                        </button>
                        <button
                          className="skill-action-btn delete-btn"
                          onClick={() => handleDeleteSkill(skill)}
                          title={isServiceUser ? 'Delete Service' : 'Delete Skill'}
                        >
                          <img src={skillDeleteIcon} alt="delete" className="skill-action-icon" />
                        </button>
                      </div>
                    </div>
                    <div className="skill-name">{skill.sub_cat_name}</div>
                    {skill.description && (
                      <div className="skill-description">{skill.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!skillsLoading && skills.length === 0 && (
              <div className="profile-skills-empty">
                <div className="no-profiles-container">
                  <div className="no-profiles-icon">🎯</div>
                  <h3 className="no-profiles-title">{isServiceUser ? 'No Services Added Yet' : 'No Skills Added Yet'}</h3>
                  <p className="no-profiles-subtitle">
                    {isServiceUser ? 'Click "Add More Services" to showcase your offerings' : 'Click "Add More Skills" to showcase your expertise'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal for Skill Details */}
      <AnimatePresence>
        {isSkillModalOpen && selectedSkill && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseSkillModal}
          >
            <motion.div
              className="modal-content skill-modal"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-bg-decoration">
                <div className="modal-circle modal-circle-1"></div>
                <div className="modal-circle modal-circle-2"></div>
                <div className="modal-circle modal-circle-3"></div>
              </div>

              <div className="modal-header">
                <motion.div
                  className="modal-header-left"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="modal-logo-container">
                    <img
                      src={profileSkillIcon}
                      alt="skill icon"
                      className="modal-craft-logo"
                    />
                  </div>
                  <div className="modal-header-info">
                    <h2 className="modal-craft-title">{selectedSkill.sub_cat_name}</h2>
                    <p className="modal-craft-subtitle">{selectedSkill.cat_name}</p>
                  </div>
                </motion.div>
                <motion.button
                  className="modal-close-btn"
                  onClick={handleCloseSkillModal}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              <div className="modal-body">
                {renderSkillModalContent()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedSkill && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseEditModal}
          >
            <motion.div
              className="modal-content edit-modal"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-bg-decoration">
                <div className="modal-circle modal-circle-1"></div>
                <div className="modal-circle modal-circle-2"></div>
                <div className="modal-circle modal-circle-3"></div>
              </div>

              <div className="modal-header">
                <motion.div
                  className="modal-header-left"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="modal-logo-container">
                    <FiEdit2 className="modal-craft-logo-icon" />
                  </div>
                  <div className="modal-header-info">
                    <h2 className="modal-craft-title">{isServiceUser ? 'Edit Service' : 'Edit Skill'}</h2>
                    <p className="modal-craft-subtitle">{selectedSkill.sub_cat_name}</p>
                  </div>
                </motion.div>
                <motion.button
                  className="modal-close-btn"
                  onClick={handleCloseEditModal}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleEditSubmit} className="edit-form">
                  <div className="edit-form-field">
                    <label className="edit-form-label">About</label>
                    <textarea
                      name="user_about"
                      value={editFormData.user_about}
                      onChange={handleEditFormChange}
                      className="edit-form-textarea"
                      placeholder="Describe your experience and what you can offer..."
                      rows="4"
                    />
                  </div>

                  <div className="edit-form-field">
                    <label className="edit-form-label">Bio</label>
                    <textarea
                      name="user_bio"
                      value={editFormData.user_bio}
                      onChange={handleEditFormChange}
                      className="edit-form-textarea"
                      placeholder="Enter a brief introduction..."
                      rows="3"
                    />
                  </div>

                  <div className="edit-form-field">
                    <div className="video-links-header" style={{ marginBottom: '1rem' }}>
                      <label className="edit-form-label">Videos</label>
                      <button
                        type="button"
                        onClick={handleAddVideo}
                        className="add-video-btn"
                      >
                        <FiPlus /> Add Video
                      </button>
                    </div>
                    <div className="video-links-list">
                      {editFormData.videos.map((video, index) => (
                        <div key={index} className="video-link-group-container">
                          <div className="video-link-group-header">
                            <span className="video-group-title-label">Video {index + 1}</span>
                            {editFormData.videos.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveVideo(index)}
                                className="video-group-remove-btn"
                              >
                                <FiTrash2 /> Remove
                              </button>
                            )}
                          </div>

                          <div className="edit-form-field" style={{ gap: '0.25rem' }}>
                            <input
                              type="text"
                              value={video.title}
                              onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                              className="edit-form-input"
                              placeholder={`Video Title`}
                            />
                          </div>

                          <div className="edit-form-field" style={{ gap: '0.25rem' }}>
                            <textarea
                              value={video.description}
                              onChange={(e) => handleVideoChange(index, 'description', e.target.value)}
                              className="edit-form-textarea"
                              placeholder={`Video Description`}
                              rows="2"
                              style={{ minHeight: '60px' }}
                            />
                          </div>

                          <div className="edit-form-field" style={{ gap: '0.25rem' }}>
                            <input
                              type="url"
                              value={video.link}
                              onChange={(e) => handleVideoChange(index, 'link', e.target.value)}
                              className="edit-form-input"
                              placeholder={`Video Link (URL)`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="edit-form-actions">
                    <button
                      type="button"
                      onClick={handleCloseEditModal}
                      className="cancel-btn"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : (isServiceUser ? 'Update Service' : 'Update Skill')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal — fully isolated dm- classes */}
      <AnimatePresence>
        {isDeleteModalOpen && skillToDelete && (
          <motion.div
            className="dm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleCloseDeleteModal}
          >
            <motion.div
              className="dm-box"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dm-icon-wrap">
                <FiAlertTriangle className="dm-icon" />
              </div>
              <h2 className="dm-title">
                {isServiceUser ? 'Delete Service?' : 'Delete Skill?'}
              </h2>
              <p className="dm-message">
                Are you sure you want to delete{' '}
                <span className="dm-highlight">"{skillToDelete.sub_cat_name}"</span>?
              </p>
              <div className="dm-actions">
                <button className="dm-btn dm-btn-cancel" onClick={handleCloseDeleteModal} disabled={isDeleting}>
                  Cancel
                </button>
                <button className="dm-btn dm-btn-delete" onClick={confirmDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : (isServiceUser ? 'Delete Service' : 'Delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Skill Modal */}
      <AnimatePresence>
        {isAddSkillModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCloseAddSkillModal}
          >
            <motion.div
              className="modal-content add-skill-modal"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-bg-decoration">
                <div className="modal-circle modal-circle-1"></div>
                <div className="modal-circle modal-circle-2"></div>
                <div className="modal-circle modal-circle-3"></div>
              </div>

              <div className="modal-header">
                <motion.div
                  className="modal-header-left"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="modal-logo-container">
                    <FiPlus className="modal-craft-logo-icon" />
                  </div>
                  <div className="add-skill-modal-header-content">
                    <h2 className="add-skill-modal-title">{isServiceUser ? 'Add Service' : 'Add Skill'}</h2>
                    <p className="add-skill-modal-subtitle">
                      Share your expertise - choose category, add details & links
                    </p>
                  </div>
                </motion.div>
                <motion.button
                  className="modal-close-btn"
                  onClick={handleCloseAddSkillModal}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleAddSkillSubmit} className="add-skill-form">
                  {/* Category Selection */}
                  <div className="add-skill-form-field">
                    <label className="add-skill-form-label">
                      <FiBriefcase style={{ fontSize: '16px' }} />
                      Category
                      <span className="required-star">*</span>
                    </label>
                    {loadingCategories ? (
                      <div className="loading-categories">
                        <div className="loading-spinner"></div>
                        Loading categories...
                      </div>
                    ) : isServiceUser ? (
                      // Service user: show locked RENTALS
                      <select
                        name="cat_id"
                        value={addSkillFormData.cat_id}
                        className="add-skill-form-select"
                        disabled
                        required
                      >
                        <option value="22">RENTALS</option>
                      </select>
                    ) : (
                      // Skill user: show categories without RENTALS
                      <select
                        name="cat_id"
                        value={addSkillFormData.cat_id}
                        onChange={handleAddSkillFormChange}
                        className="add-skill-form-select"
                        required
                      >
                        <option value="" disabled hidden style={{ display: 'none' }}>Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.cat_name?.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Subcategory Selection */}
                  <div className="add-skill-form-field">
                    <label className="add-skill-form-label">
                      <FiAward style={{ fontSize: '16px' }} />
                      Subcategory / {isServiceUser ? 'Service' : 'Skill'}
                      <span className="required-star">*</span>
                    </label>
                    {loadingSubcategories ? (
                      <div className="loading-categories">
                        <div className="loading-spinner"></div>
                        Loading subcategories...
                      </div>
                    ) : (
                      <select
                        name="sub_cat_id"
                        value={addSkillFormData.sub_cat_id}
                        onChange={handleAddSkillFormChange}
                        className="add-skill-form-select"
                        disabled={!addSkillFormData.cat_id || subcategories.length === 0}
                        required
                      >
                        <option value="" disabled hidden style={{ display: 'none' }}>
                          {!addSkillFormData.cat_id
                            ? 'Select a category first'
                            : subcategories.length === 0
                              ? 'No subcategories available'
                              : 'Select a subcategory'}
                        </option>
                        {subcategories.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.sub_cat_name?.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    )}
                    {addSkillFormData.cat_id && subcategories.length === 0 && !loadingSubcategories && (
                      <p className="field-helper-text">
                        No subcategories available for this category
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="add-skill-form-field">
                    <label className="add-skill-form-label">
                      <FiFileText style={{ fontSize: '16px' }} />
                      Description
                    </label>
                    <textarea
                      name="user_about"
                      value={addSkillFormData.user_about}
                      onChange={handleAddSkillFormChange}
                      className="add-skill-form-textarea"
                      placeholder={isServiceUser ? "Describe your service and offerings..." : "Describe your expertise and experience in this skill..."}
                      rows="4"
                    />
                    <p className="field-helper-text">
                      Tell others about your experience and what you can offer
                    </p>
                  </div>

                  {/* Special Skills */}
                  <div className="add-skill-form-field">
                    <label className="add-skill-form-label">
                      <FiAward style={{ fontSize: '16px' }} />
                      {isServiceUser ? 'Special Services' : 'Special Skills'}
                    </label>
                    <input
                      type="text"
                      name="user_special_skills"
                      value={addSkillFormData.user_special_skills}
                      onChange={handleAddSkillFormChange}
                      className="add-skill-form-input"
                      placeholder={isServiceUser ? "e.g., Camera, Lights, Editing" : "e.g., Singing, Acting, Dancing"}
                    />
                    <p className="field-helper-text">
                      {isServiceUser ? 'Separate multiple services with commas' : 'Separate multiple skills with commas'}
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="add-skill-form-field">
                    <label className="add-skill-form-label">
                      <FiUser style={{ fontSize: '16px' }} />
                      Bio
                    </label>
                    <textarea
                      name="user_bio"
                      value={addSkillFormData.user_bio}
                      onChange={handleAddSkillFormChange}
                      className="add-skill-form-textarea"
                      placeholder="Share a brief bio about yourself..."
                      rows="3"
                    />
                    <p className="field-helper-text">
                      A short introduction about who you are
                    </p>
                  </div>

                  {/* Video Links */}
                  <div className="add-skill-form-field">
                    <div className="video-links-header">
                      <label className="add-skill-form-label">
                        <FiVideo style={{ fontSize: '16px' }} />
                        Video Links
                      </label>
                      <button
                        type="button"
                        onClick={handleAddSkillAddVideoLink}
                        className="add-video-btn"
                      >
                        <FiPlus /> Add Link
                      </button>
                    </div>
                    <div className="video-links-list">
                      {addSkillFormData.video_links.map((link, index) => (
                        <div key={index} className="video-link-input-group">
                          <input
                            type="url"
                            value={link}
                            onChange={(e) => handleAddSkillVideoLinkChange(index, e.target.value)}
                            className="add-skill-form-input"
                            placeholder="https://youtube.com/..."
                          />
                          {addSkillFormData.video_links.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleAddSkillRemoveVideoLink(index)}
                              className="remove-video-btn"
                            >
                              <FiX />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="field-helper-text">
                      Add links to your work samples or portfolio videos
                    </p>
                  </div>

                  {/* Form Actions */}
                  <div className="edit-form-actions">
                    <button
                      type="button"
                      onClick={handleCloseAddSkillModal}
                      className="cancel-btn"
                      disabled={isAddingSkill}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isAddingSkill || !addSkillFormData.cat_id || !addSkillFormData.sub_cat_id}
                    >
                      {isAddingSkill 
                        ? (isServiceUser ? 'Adding Service...' : 'Adding Skill...') 
                        : (isServiceUser ? 'Add Service' : 'Add Skill')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Reels Modal */}
      <AnimatePresence>
        {isMyReelsModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMyReelsModalOpen(false)}
          >
            <motion.div
              className="modal-content profile-reels-modal"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-bg-decoration">
                <div className="modal-circle modal-circle-1"></div>
                <div className="modal-circle modal-circle-2"></div>
                <div className="modal-circle modal-circle-3"></div>
              </div>

              <div className="modal-header">
                <motion.div
                  className="modal-header-left"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="modal-logo-container" style={{ background: 'linear-gradient(135deg, #bf8906 0%, #8c6300 100%)' }}>
                    <FiVideo className="modal-craft-logo-icon" style={{ color: '#fff', fontSize: '22px' }} />
                  </div>
                  <div className="modal-header-info">
                    <h2 className="modal-craft-title">My Uploaded Reels</h2>
                    <p className="modal-craft-subtitle">
                      {myReels.length} {myReels.length === 1 ? 'reel' : 'reels'} published • Manage & delete your videos
                    </p>
                  </div>
                </motion.div>
                <motion.button
                  className="modal-close-btn"
                  onClick={() => setIsMyReelsModalOpen(false)}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              <div className="modal-body profile-reels-modal-body">
                {/* Top Action Bar */}
                <div className="profile-reels-topbar">
                  <div className="profile-reels-count-badge">
                    <FiVideo size={14} color="#bf8906" />
                    <span><strong>{myReels.length}</strong> Total Reels</span>
                  </div>
                  <button
                    type="button"
                    className="profile-reels-upload-action"
                    onClick={() => {
                      setIsMyReelsModalOpen(false);
                      navigate('/reels');
                    }}
                  >
                    <FiPlus size={16} />
                    <span>Upload New Reel</span>
                  </button>
                </div>

                {myReelsLoading ? (
                  <div className="profile-reels-loading">
                    <div className="profile-reels-spinner" />
                    <p>Loading your reels...</p>
                  </div>
                ) : myReelsError ? (
                  <div className="profile-reels-empty">
                    <p>{myReelsError}</p>
                  </div>
                ) : myReels.length === 0 ? (
                  <div className="profile-reels-empty">
                    <div className="profile-reels-empty-icon-wrap">
                      <FiVideo size={42} color="#bf8906" />
                    </div>
                    <h3 className="profile-reels-empty-title">No Reels Uploaded Yet</h3>
                    <p className="profile-reels-empty-subtitle">
                      Record or upload short video reels to showcase your talent to directors and producers!
                    </p>
                    <button
                      type="button"
                      className="profile-reels-empty-cta-btn"
                      onClick={() => {
                        setIsMyReelsModalOpen(false);
                        navigate('/reels');
                      }}
                    >
                      <FiPlus size={16} /> Upload Your First Reel
                    </button>
                  </div>
                ) : (
                  <div className="profile-reels-grid">
                    {myReels.map((reel, idx) => {
                      const videoSrc = reel.video_url?.startsWith('http')
                        ? reel.video_url
                        : `https://www.whysocial.in/clap-kartel-reels-module/public/${reel.video_url || reel.video}`;
                      return (
                        <div className="profile-reel-card" key={reel.id || idx}>
                          <div className="profile-reel-video-wrap">
                            <video
                              src={videoSrc}
                              controls
                              className="profile-reel-video-element"
                              poster={reel.thumbnail_url || reel.thumbnail}
                              preload="metadata"
                            />
                            <button
                              type="button"
                              className="profile-reel-overlay-delete"
                              onClick={() => {
                                setReelToDelete(reel);
                                setIsDeleteReelModalOpen(true);
                              }}
                              title="Delete Reel"
                            >
                              <FiTrash2 size={15} />
                            </button>
                            <div className="profile-reel-views-tag">
                              👁️ {reel.views_count || 0}
                            </div>
                          </div>

                          <div className="profile-reel-content">
                            <h4 className="profile-reel-name" title={reel.title || 'Untitled Reel'}>
                              {reel.title || 'Untitled Reel'}
                            </h4>
                            {reel.description && (
                              <p className="profile-reel-summary">{reel.description}</p>
                            )}

                            <div className="profile-reel-meta-row">
                              <span className="profile-reel-stat-item">
                                ❤️ {reel.likes_count || 0}
                              </span>
                              <span className="profile-reel-stat-item">
                                💬 {reel.comments_count || 0}
                              </span>
                              <span className="profile-reel-stat-item">
                                ↗️ {reel.share_count || 0}
                              </span>
                              <span className="profile-reel-stat-item">
                                👁️ {reel.views_count || 0}
                              </span>
                            </div>

                            <div className="profile-reel-actions-bar">
                              <button
                                type="button"
                                className="profile-reel-view-btn"
                                onClick={() => {
                                  setIsMyReelsModalOpen(false);
                                  navigate('/reels');
                                }}
                              >
                                Watch in Feed
                              </button>
                              <button
                                type="button"
                                className="profile-reel-delete-btn"
                                onClick={() => {
                                  setReelToDelete(reel);
                                  setIsDeleteReelModalOpen(true);
                                }}
                                title="Delete Reel"
                              >
                                <FiTrash2 size={14} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Reel Confirmation Modal */}
      <AnimatePresence>
        {isDeleteReelModalOpen && reelToDelete && (
          <motion.div
            className="modal-overlay"
            style={{ zIndex: 10005 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { if (!isDeletingReel) setIsDeleteReelModalOpen(false); }}
          >
            <motion.div
              className="delete-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="delete-modal-content">
                <div className="delete-icon-wrapper">
                  <FiTrash2 className="delete-warning-icon" />
                </div>
                <h3 className="delete-modal-title">Delete Reel?</h3>
                <p className="delete-modal-message">
                  Are you sure you want to delete <strong>"{reelToDelete.title || 'this reel'}"</strong>?
                </p>
                <p className="delete-modal-warning">
                  This action cannot be undone and will permanently remove this reel.
                </p>
                <div className="delete-modal-actions">
                  <button
                    type="button"
                    className="delete-cancel-btn"
                    onClick={() => setIsDeleteReelModalOpen(false)}
                    disabled={isDeletingReel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="delete-confirm-btn"
                    onClick={handleConfirmDeleteReel}
                    disabled={isDeletingReel}
                  >
                    {isDeletingReel ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Popup */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className={`message-popup ${messageContent.type === 'success' ? 'message-success' : messageContent.type === 'error' ? 'message-error' : 'message-info'}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <span className="message-icon">
              {messageContent.type === 'success' ? '✓' : messageContent.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span className="message-text">{messageContent.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Profile