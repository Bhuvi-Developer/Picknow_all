import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import './UserProfile.css';
import { FaUser, FaEnvelope, FaPhone, FaShoppingBag, FaHeart, FaCog, FaSignOutAlt, FaEdit, FaSave, FaExclamationTriangle } from 'react-icons/fa';
import ConfirmationPopup from './ConfirmationPopup';
import LogoutConfirmationPopup from './LogoutConfirmationPopup';
import { userApi } from '../../api/userApi';

const UserProfile = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: '',
    email: '',
    contact: ''
  });
  const [editForm, setEditForm] = useState({ ...user });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FaUser /> },
    { id: 'orders', label: 'Orders', icon: <FaShoppingBag /> },
    { id: 'wishlist', label: 'Wishlist', icon: <FaHeart /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> }
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userApi.getProfile();
      if (response.user) {
        setUser(response.user);
        setEditForm(response.user);
      }
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to fetch profile', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({ ...user });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!editForm.name?.trim() || !editForm.email?.trim()) {
      enqueueSnackbar('Name and Email are required!', { variant: 'error' });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      enqueueSnackbar('Please enter a valid email address!', { variant: 'error' });
      return false;
    }

    if (editForm.contact && !/^\d{10}$/.test(editForm.contact)) {
      enqueueSnackbar('Please enter a valid 10-digit phone number!', { variant: 'error' });
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSave = async () => {
    try {
      setLoading(true);
      const response = await userApi.updateProfile({
        name: editForm.name,
        email: editForm.email,
        contact: editForm.contact
      });

      setUser(response.user);
      setIsEditing(false);
      setShowConfirmation(false);
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update profile', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({ ...user });
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const renderProfileSection = () => (
    <div className="user-profile-info animate-fade-in">
      <div className="user-profile-header">
        <div className="user-profile-avatar">
          <FaUser className="user-avatar-icon" />
        </div>
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={editForm.name || ''}
            onChange={handleInputChange}
            className="edit-input"
            placeholder="Enter your name"
          />
        ) : (
          <h2>{user.name || 'User Name'}</h2>
        )}
      </div>
      <div className="user-profile-details">
        <div className="user-detail-item">
          <FaEnvelope className="user-detail-icon" />
          <div className="user-detail-content">
            <label>Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editForm.email || ''}
                onChange={handleInputChange}
                className="edit-input"
                placeholder="Enter your email"
              />
            ) : (
              <p>{user.email || 'email@example.com'}</p>
            )}
          </div>
        </div>
        <div className="user-detail-item">
          <FaPhone className="user-detail-icon" />
          <div className="user-detail-content">
            <label>Phone</label>
            {isEditing ? (
              <input
                type="tel"
                name="contact"
                value={editForm.contact || ''}
                onChange={handleInputChange}
                className="edit-input"
                placeholder="Enter your phone number"
              />
            ) : (
              <p>{user.contact || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>
      {isEditing ? (
        <div className="edit-buttons">
          <button className="save-btn" onClick={handleSave} disabled={loading}>
            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button className="cancel-btn" onClick={handleCancel} disabled={loading}>
            Cancel
          </button>
        </div>
      ) : (
        <button className="user-edit-profile-btn" onClick={handleEditClick} disabled={loading}>
          <FaEdit /> Edit Profile
        </button>
      )}
    </div>
  );

  const renderTabContent = () => {
    if (loading && !isEditing) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return renderProfileSection();
      case 'orders':
        return (
          <div className="user-orders-section animate-fade-in">
            <h3>Recent Orders</h3>
            <div className="user-orders-list">
              <div className="user-no-orders">
                <FaShoppingBag className="user-empty-icon" />
                <p>No orders yet</p>
              </div>
            </div>
          </div>
        );
      case 'wishlist':
        return (
          <div className="user-wishlist-section animate-fade-in">
            <h3>My Wishlist</h3>
            <div className="user-wishlist-list">
              <div className="user-no-wishlist">
                <FaHeart className="user-empty-icon" />
                <p>Your wishlist is empty</p>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="user-settings-section animate-fade-in">
            <h3>Account Settings</h3>
            <div className="user-settings-list">
              <div className="user-setting-item">
                <label>Notifications</label>
                <label className="user-switch">
                  <input type="checkbox" />
                  <span className="user-slider"></span>
                </label>
              </div>
              <div className="user-setting-item">
                <label>Dark Mode</label>
                <label className="user-switch">
                  <input type="checkbox" />
                  <span className="user-slider"></span>
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        <div className="user-sidebar">
          <div className="user-sidebar-header">
            <div className="user-avatar">
              <FaUser />
            </div>
            <h3>{user.name || 'User Name'}</h3>
          </div>
          <nav className="user-sidebar-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`user-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          <button className="user-logout-button" onClick={handleLogoutClick}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
        <div className="user-content">
          {renderTabContent()}
        </div>
      </div>

      {showConfirmation && (
        <ConfirmationPopup
          onConfirm={handleConfirmSave}
          onCancel={handleCancelConfirmation}
        />
      )}

      {showLogoutConfirmation && (
        <LogoutConfirmationPopup
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      )}
    </div>
  );
};

export default UserProfile;

