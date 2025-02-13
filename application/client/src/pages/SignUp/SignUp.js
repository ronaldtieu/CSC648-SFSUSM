import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import { registerUser, fetchMajors, fetchMinors } from '../../service/profileService';
import './SignUp.css';

const SignUp = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    major: '',
    minor: '',
    pronouns: ''
  });
  const [message, setMessage] = useState('');
  const [majors, setMajors] = useState([]);
  const [minors, setMinors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getMajorsAndMinors = async () => {
      try {
        const fetchedMajors = await fetchMajors();
        setMajors(fetchedMajors);
      } catch (error) {
        console.error('Error fetching majors:', error);
      }
      try {
        const fetchedMinors = await fetchMinors();
        setMinors(fetchedMinors);
      } catch (error) {
        console.error('Error fetching minors:', error);
      }
    };
    getMajorsAndMinors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.major ||
      !formData.minor ||
      !formData.pronouns
    ) {
      setMessage('All fields are required.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { firstName, lastName, email, password, major, minor, pronouns } = formData;
      const submissionData = { firstName, lastName, email, password, major, minor, pronouns };
      const data = await registerUser(submissionData);
      setMessage(data.message);
    } catch (error) {
      console.error('Signup error:', error);
      setMessage('Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    history.push('/');
  };

  return (
    <div className="signup-page">
      {/* {loading && <LoadingScreen />} */}
      <div className="signup-container">
        <h2>Create an Account</h2>
        {message && <p>{message}</p>}
        <form className="signup-form" onSubmit={handleSubmit}>
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          <div>
            <label htmlFor="major">Major:</label>
            <select name="major" id="major" value={formData.major} onChange={handleChange} required>
              <option value="">Select Major</option>
              {majors.map((majorObj, index) => (
                <option key={index} value={majorObj.MajorName}>
                  {majorObj.MajorName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="minor">Minor:</label>
            <select name="minor" id="minor" value={formData.minor} onChange={handleChange} required>
              <option value="">Select Minor</option>
              {minors.map((minorObj, index) => (
                <option key={index} value={minorObj.MinorName}>
                  {minorObj.MinorName}
                </option>
              ))}
            </select>
          </div>
          <input type="text" name="pronouns" placeholder="Pronouns (e.g., she/her, he/him, they/them)" value={formData.pronouns} onChange={handleChange} required />
          <button type="submit">Sign Up</button>
        </form>
        <div>
          <p>Already have an account?</p>
          <button onClick={handleLoginRedirect}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;