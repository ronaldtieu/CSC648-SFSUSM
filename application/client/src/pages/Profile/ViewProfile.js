import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import gatorDefaultPic from '../../assets/gator_default_pic.png';
import './ViewProfile.css';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import { fetchUserProfile } from '../../service/profileService'; 

const Profile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    major: '',
    minor: '',
    pronouns: '',
    profilePicture: gatorDefaultPic,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await fetchUserProfile();
        // console.log('Fetched user profile data:', userData);  // Debugging line
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
    return (
      <div className="loading-container">
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return <p>Error loading profile: {error}</p>;
  }

  return (
    <div className="profile-container">
      {profile ? (
        <>
          <div className="profile-info">
            <img 
              src={profile.profilePicture || gatorDefaultPic} 
              alt={`${profile.firstName} ${profile.lastName}`} 
              className="profile-picture"
            />
            <button className="edit-button" onClick={() => history.push('/edit-profile')}>Edit</button>
          </div>
          <div className="profile-details">
            <p><strong>First Name:</strong> {profile.firstName}</p>
            <p><strong>Last Name:</strong> {profile.lastName}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Student ID:</strong> {profile.studentId || 'ID not found'}</p>
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