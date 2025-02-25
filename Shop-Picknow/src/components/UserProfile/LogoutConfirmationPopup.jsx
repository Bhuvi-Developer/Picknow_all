import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import './UserProfile.css';

const LogoutConfirmationPopup = ({ onConfirm, onCancel }) => {
  return (
    <div className="confirmation-popup">
      <div className="confirmation-content">
        <FaSignOutAlt style={{ fontSize: '2rem', color: '#ff8c42', marginBottom: '1rem' }} />
        <h3 className="confirmation-title">Logout?</h3>
        <p className="confirmation-message">
          Are you sure you want to logout from your account?
        </p>
        <div className="confirmation-buttons">
          <button className="confirm-btn" onClick={onConfirm}>
            Yes, Logout
          </button>
          <button className="cancel-popup-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationPopup; 