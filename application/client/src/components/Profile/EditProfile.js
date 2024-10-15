import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './EditProfile.css';
import { fetchUserProfile, updateUserProfile, fetchMajors, fetchMinors } from '../../service/profileService'; 

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [majors, setMajors] = useState([]); // State for majors
  const [minors, setMinors] = useState([]); // State for minors
  const history = useHistory();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await fetchUserProfile();
        setProfileData(userData); // Directly set the user data
      } catch (err) {
        console.error('Error loading profile for editing:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const loadMajorsAndMinors = async () => {
      try {
        const majorsList = await fetchMajors();
        setMajors(majorsList);

        const minorsList = await fetchMinors();
        setMinors(minorsList);
      } catch (err) {
        console.error('Error loading majors or minors: ', err);
        setError('Failed to load majors or minors');
      }
    };

    loadUserProfile(); // Load user profile when component mounts
    loadMajorsAndMinors(); // Load majors and minors when component mounts
  }, []); // Run only once after component mounts

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSave = async () => {
    try {
      await updateUserProfile(profileData);
      history.push('/profile'); // Redirect to profile page after saving changes
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
      <div className="edit-profile-form">
        <div>
          <label>
            First Name:
            <input type="text" name="firstName" value={profileData.firstName} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            Last Name:
            <input type="text" name="lastName" value={profileData.lastName} onChange={handleChange} />
          </label>
        </div>
        <div>
          <label>
            Email:
            <input type="email" name="email" value={profileData.email} disabled className="readonly-input" />
          </label>
        </div>
        <div>
          <label>
            Student ID:
            <input type="text" name="studentId" value={profileData.studentId} disabled className="readonly-input" />
          </label>
        </div>
        <div>
          <label>
            Major:
            <select name="major" value={profileData.major} onChange={handleChange}>
              <option value="" disabled>Select Major</option>
              {majors.map((major) => (
                <option key={major.ID} value={major.MajorName}>
                  {major.MajorName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Minor:
            <select name="minor" value={profileData.minor} onChange={handleChange}>
              <option value="" disabled>Select Minor</option>
              {minors.map((minor) => (
                <option key={minor.ID} value={minor.MinorName}>
                  {minor.MinorName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Pronouns:
            <input type="text" name="pronouns" value={profileData.pronouns} onChange={handleChange} />
          </label>
        </div>
        <button onClick={handleSave}>Save Changes</button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default EditProfile;