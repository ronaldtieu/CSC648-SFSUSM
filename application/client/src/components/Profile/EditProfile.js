import React, { useState, useEffect } from 'react';
import './EditProfile.css';
import gatorDefaultPic from '../../assets/gator_default_pic.png';
import { fetchUserProfile, updateUserProfile } from '../../service/profileService';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',  // Added studentId to state
    major: '',
    minor: '',
    pronouns: '',
    profilePicture: gatorDefaultPic,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        console.log('Loading user profile for editing...');
        const userData = await fetchUserProfile();
        setFormData({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          studentId: userData.studentId || '',  // Set the studentId
          major: userData.major,
          minor: userData.minor,
          pronouns: userData.pronouns,
          profilePicture: userData.profilePicture || gatorDefaultPic,
        });
        console.log('User profile loaded:', userData);
      } catch (err) {
        console.error('Error loading profile:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profilePicture: URL.createObjectURL(file),
      });
    }
  };

  const handleSave = async () => {
    try {
      console.log('Saving profile changes...');
      await updateUserProfile(formData);
      alert('Profile updated successfully!');
      window.location.href = '/profile';
    } catch (error) {
      console.error('Failed to update profile:', error.message);
      alert('Failed to update profile: ' + error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="edit-profile-container">
      <h1>Edit Profile</h1>
      <div className="profile-info">
        <img 
          src={formData.profilePicture} 
          alt={`${formData.firstName} ${formData.lastName}`} 
          className="profile-picture"
        />
        <div className="edit-overlay">
          <label htmlFor="profilePictureInput" className="edit-label">Change</label>
          <input 
            type="file" 
            accept="image/*" 
            id="profilePictureInput"
            className="profile-picture-input"
            onChange={handlePictureChange}
          />
        </div>
      </div>
      <form className="edit-profile-form">
        <div>
          <label>First Name:</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} readOnly className="readonly-input" />
        </div>
        <div>
          <label>Student ID:</label>
          <input type="text" name="studentId" value={formData.studentId} readOnly className="readonly-input" />  {/* Display Student ID */}
        </div>
        <div>
          <label>Major:</label>
          <input type="text" name="major" value={formData.major} onChange={handleChange} />
        </div>
        <div>
          <label>Minor:</label>
          <input type="text" name="minor" value={formData.minor} onChange={handleChange} />
        </div>
        <div>
          <label>Pronouns:</label>
          <input type="text" name="pronouns" value={formData.pronouns} onChange={handleChange} />
        </div>
        <button type="button" onClick={handleSave}>Save</button>
      </form>
    </div>
  );
};

export default EditProfile;