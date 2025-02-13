import React, { useState, useEffect } from 'react';
import { fetchUserById } from '../../service/profileService';
import defaultPic from '../../assets/gator_default_pic.png';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import './ProfileBanner.css';

const ProfileBanner = ({ user: initialUser, userId, onClose }) => {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    if (!user && userId) {
      fetchUserById(userId)
        .then((fetchedUser) => {
          setUser(fetchedUser);
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
        });
    }
  }, [user, userId]);

  if (!user) {
    return (
      <div className="profile-banner-overlay" onClick={onClose}>
        <div className="profile-banner loading-banner" onClick={(e) => e.stopPropagation()}>
          <div className="loading-wrapper">
            <LoadingScreen />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-banner-overlay" onClick={onClose}>
      <div className="profile-banner" onClick={(e) => e.stopPropagation()}>
        <button className="profile-banner-close" onClick={onClose}>
          &times;
        </button>
        <div className="profile-banner-content">
          <img
            src={user.profilePic || defaultPic}
            alt={`${user.FirstName || user.firstName} ${user.LastName || user.lastName}`}
            className="profile-banner-image"
          />
          <div className="profile-banner-info">
            <h2>
              {user.FirstName || user.firstName} {user.LastName || user.lastName}
            </h2>
            <p>Email: {user.Email || user.email}</p>
            <p>Major: {user.Major || user.major}</p>
            <p>Minor: {user.Minor || user.minor}</p>
            <p>Pronouns: {user.Pronouns || user.pronouns}</p>
            {(user.Description || user.description) && (
              <p>Description: {user.Description || user.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBanner;