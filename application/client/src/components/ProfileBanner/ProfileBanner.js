import React from 'react';
import './ProfileBanner.css'; // create styles as needed

const ProfileBanner = ({ user, onClose }) => {
  if (!user) return null;
  
  return (
    <div className="profile-banner-overlay" onClick={onClose}>
      <div className="profile-banner" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>X</button>
        <h2>{user.FirstName} {user.LastName}</h2>
        <p>Email: {user.Email}</p>
      </div>
    </div>
  );
};

export default ProfileBanner;