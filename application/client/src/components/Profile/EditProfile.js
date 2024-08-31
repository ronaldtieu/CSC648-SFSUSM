import React, { useState } from 'react';
import './EditProfile.css';
import gatorDefaultPic from '../../assets/gator_default_pic.png';
import { updateUserProfile } from '../../service/profileService'; // Import the update function from the service

const EditProfile = () => {
  const [formData, setFormData] = useState({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    studentId: '12345678', 
    major: 'Computer Science',
    minor: 'Mathematics',
    pronouns: 'She/Her',
    profilePicture: gatorDefaultPic,
  });

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
      const token = sessionStorage.getItem('accessToken'); // Get the JWT token from sessionStorage
      await updateUserProfile(formData, token); // Call the service function to update the user profile
      alert('Profile updated successfully!');
      window.location.href = '/profile'; // Redirect to the profile page
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message); // Display an error message
    }
  };

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
          <input type="text" name="studentId" value={formData.studentId} readOnly className="readonly-input" />
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