import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import gatorDefaultPic from '../../assets/gator_default_pic.png';
import './Profile.css';
import DominoLoader from '../DominoLoader/DominoLoader';
import { fetchUserProfile } from '../../service/profileService'; 

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory(); 

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await fetchUserProfile();
        setProfile(userData);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  if (loading) {
    return <DominoLoader />;  // Show loader while data is loading
  }

  if (error) {
    return <p>Error loading profile: {error}</p>;  // Display an error message if there's any
  }

  const handleEditClick = () => {
    history.push('/edit-profile');
  };

  return (
    <div className="profile-container">
      {profile ? (
        <>
          <h1>{profile.firstName} {profile.lastName}</h1>
          <div className="profile-info">
            <img 
              src={profile.profilePicture || gatorDefaultPic} 
              alt={`${profile.firstName} {profile.lastName}`} 
              className="profile-picture"
            />
            <button className="edit-button" onClick={handleEditClick}>Edit</button>
          </div>
          <div className="profile-details">
            <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Major:</strong> {profile.major}</p>
            <p><strong>Minor:</strong> {profile.minor}</p>
            <p><strong>Pronouns:</strong> {profile.pronouns}</p>
          </div>
        </>
      ) : (
        <p>User data could not be loaded.</p>
      )}
    </div>
  );
};

export default Profile;