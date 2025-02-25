import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './UserProfile.css';

const ConfirmationPopup = ({ onConfirm, onCancel }) => {
  return (
    <div className="confirmation-popup">
      <div className="confirmation-content">
        <FaExclamationTriangle style={{ fontSize: '2rem', color: '#ff8c42', marginBottom: '1rem' }} />
        <h3 className="confirmation-title">Save Changes?</h3>
        <p className="confirmation-message">
          Are you sure you want to save these changes to your profile? This action cannot be undone.
        </p>
        <div className="confirmation-buttons">
          <button className="confirm-btn" onClick={onConfirm}>
            Yes, Save Changes
          </button>
          <button className="cancel-popup-btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup; 