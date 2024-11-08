import React from 'react';
import './TutoringMentorship.css';

const TutoringMentorshipPage = () => {
  return (
    <div>
      <h1 className="page-header">Peer Tutoring & Mentorship</h1>
      <div className="grid-container">
        <div className="grid-item">
          <h2>Look For Tutor</h2>
          <p>Find a fellow Gators to help you with your studies.</p>
        </div>
        <div className="grid-item">
          <h2>Look For Mentor</h2>
          <p>Find a fellow Gators to guide you in your academic and career path.</p>
        </div>
        <div className="grid-item">
          <h2>Register to be a Tutor</h2>
          <p>Sign up to become a tutor and help your fellow Gators with their studies.</p>
        </div>
        <div className="grid-item">
          <h2>Register to be a Mentor</h2>
          <p>Sign up to become a mentor and guide your fellow Gators in their academic and career path.</p>
        </div>
      </div>
    </div>
  );
};

export default TutoringMentorshipPage;