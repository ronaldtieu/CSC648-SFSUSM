// Profile.js
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import gatorDefaultPic from '../../assets/gator_default_pic.png'; // Path to the default profile picture
import './Profile.css';
import DominoLoader from '../DominoLoader/DominoLoader';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory(); 

  useEffect(() => {
    const mockProfileData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      studentId: '12345678',
      major: 'Computer Science',
      minor: 'Mathematics',
      pronouns: 'She/Her',
      profilePicture: gatorDefaultPic,
    };

    setTimeout(() => {
      setProfile(mockProfileData);
      setLoading(false);
    }, 1000); // Simulate network delay
  }, []);

  if (loading) {
    return <DominoLoader />; // Use the new DominoLoader component
  }

  const handleEditClick = () => {
    history.push('/edit-profile'); // Navigate to the Edit Profile page
  };

  return (
    <div className="profile-container">
      <h1>{profile.firstName} {profile.lastName}</h1>
      <div className="profile-info">
        <img 
          src={profile.profilePicture} 
          alt={`${profile.firstName} ${profile.lastName}`} 
          className="profile-picture"
        />
        <button className="edit-button" onClick={handleEditClick}>Edit</button>
      </div>
      <div className="profile-details">
        <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Student ID:</strong> {profile.studentId}</p>
        <p><strong>Major:</strong> {profile.major}</p>
        <p><strong>Minor:</strong> {profile.minor}</p>
        <p><strong>Pronouns:</strong> {profile.pronouns}</p>
      </div>
    </div>
  );
};

export default Profile;