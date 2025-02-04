import React, { useState } from 'react';
import './CreateClub.css'; 

const CreateClub = () => {
  const [clubPicture, setClubPicture] = useState(null);
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setClubPicture(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!clubName.trim() || !description.trim()) {
      setError('Please fill in all required fields.');
      setSuccess('');
      return;
    }

    setError('');

    console.log({
      clubPicture, 
      clubName,
      description,
      category,
      meetingTime,
    });
    
    setSuccess('Club created successfully!');
    
    setClubPicture(null);
    setClubName('');
    setDescription('');
    setCategory('');
    setMeetingTime('');
  };

  return (
    <div className="create-club-container">
      <h1>Create Club</h1>
      <form onSubmit={handleSubmit} className="create-club-form">
        <div className="form-group">
          <label htmlFor="clubPicture">Club Picture</label>
          <input
            type="file"
            id="clubPicture"
            accept="image/*"
            onChange={handlePictureChange}
          />
          {clubPicture && (
            <div className="picture-preview">
              <img 
                src={URL.createObjectURL(clubPicture)} 
                alt="Club Preview" 
                width="200"
              />
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="clubName">
            Club Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="clubName"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="Enter club name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">
            Club Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description for the club"
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Academic, Sports, Cultural"
          />
        </div>
        <div className="form-group">
          <label htmlFor="meetingTime">Meeting Time</label>
          <input
            type="text"
            id="meetingTime"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            placeholder="e.g., Mondays at 4pm"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button type="submit" className="submit-button">
          Create Club
        </button>
      </form>
    </div>
  );
};

export default CreateClub;