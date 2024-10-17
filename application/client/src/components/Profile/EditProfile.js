import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import gatorDefaultPic from '../../assets/gator_default_pic.png';  // Import the default profile picture
import './EditProfile.css';
import { fetchUserProfile, updateUserProfile } from '../../service/profileService';

const EditProfile = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    major: '',
    minor: '',
    pronouns: ''
  });
  const [profilePicture, setProfilePicture] = useState(gatorDefaultPic);  // Use the same default picture as in ViewProfile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await fetchUserProfile();
        setProfileData(userData);
        setProfilePicture(userData.profilePicture || gatorDefaultPic);  // Set the profile picture or default
      } catch (err) {
        console.error('Error loading profile for editing:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile(); // Load user profile when component mounts
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result); // Display the uploaded image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSave = async () => {
    try {
      await updateUserProfile({ ...profileData, profilePicture });  // Save the profile picture and data
      history.push('/profile'); // Redirect after saving changes
    } catch (err) {
      console.error('Error saving profile:', err.message);
      setError('Failed to save profile. Please try again.');
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

      {/* Profile Picture Section */}
      <div className="profile-info">
        <label htmlFor="profile-picture-upload" className="edit-label">
          <img 
            src={profilePicture}  // Display the current or default profile picture
            alt="Profile" 
            className="profile-picture"
          />
          <div className="edit-overlay">Change</div>
        </label>
        <input
          type="file"
          id="profile-picture-upload"
          className="profile-picture-input"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      {/* Other Profile Fields */}
      <div className="edit-profile-form">
        <div>
          <label>First Name:</label>
          <input type="text" name="firstName" value={profileData.firstName} onChange={handleChange} />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" name="lastName" value={profileData.lastName} onChange={handleChange} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={profileData.email} disabled className="readonly-input" />
        </div>
        <div>
          <label>Student ID:</label>
          <input type="text" name="studentId" value={profileData.studentId} disabled className="readonly-input" />
        </div>
        <div>
          <label>Major:</label>
          <input type="text" name="major" value={profileData.major} onChange={handleChange} />
        </div>
        <div>
          <label>Minor:</label>
          <input type="text" name="minor" value={profileData.minor} onChange={handleChange} />
        </div>
        <div>
          <label>Pronouns:</label>
          <input type="text" name="pronouns" value={profileData.pronouns} onChange={handleChange} />
        </div>
        <button onClick={handleSave}>Save Changes</button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default EditProfile;