import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FaBars, FaComment, FaBell } from 'react-icons/fa'; // Importing the necessary icons
import './Header.css';
import profilePic from '../../assets/gator_default_pic.png';

const Header = ({ notifications, messages }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const sidebarRef = useRef(null);
  const messagesRef = useRef(null);
  const notificationsRef = useRef(null);
  const history = useHistory(); // For redirecting after logout

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleDropdown = (dropdown) => {
    setDropdownOpen((prevDropdown) => (prevDropdown === dropdown ? null : dropdown));
  };

  const closeDropdown = () => {
    setDropdownOpen(null);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      closeSidebar();
    }
    if (messagesRef.current && !messagesRef.current.contains(event.target)) {
      setDropdownOpen((dropdown) => (dropdown === 'messages' ? null : dropdown));
    }
    if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
      setDropdownOpen((dropdown) => (dropdown === 'notifications' ? null : dropdown));
    }
  };

  useEffect(() => {
    if (sidebarOpen || dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, dropdownOpen]);

  const handleLogout = async (event) => {
    event.preventDefault(); // Prevent default link behavior
    try {
        const response = await fetch('http://localhost:4000/api/users/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',  // Ensure cookies are included
        });

        const data = await response.json();

        if (data.success) {
            sessionStorage.clear(); // Clear the session storage
            window.location.href = '/'; // Redirect to the login page by reloading the page
        } else {
            console.error('Logout failed:', data.message);
        }
    } catch (error) {
        console.error('Error logging out:', error);
    }
};

  return (
    <div>
      <header className="header">
        <div className="logo">SFSU Social Media Platform</div>
        <nav>
          <ul>
            <li>
              <Link to="/" className="home-icon" title="Home">
                <svg viewBox="0 0 64 64" width="32" height="32" fill="white">
                  <path d="M32 2 L2 32 L12 32 L12 58 L26 58 L26 34 L38 34 L38 58 L52 58 L52 32 L62 32 Z" />
                </svg>
              </Link>
            </li>
            <li className="messages-container" ref={messagesRef}>
              <div className="messages-icon-container">
                <button onClick={() => toggleDropdown('messages')} className="messages-button" title="Messages">
                  <FaComment className="messages-icon" />
                </button>
              </div>
              {dropdownOpen === 'messages' && (
                <div className="dropdown" ref={messagesRef}>
                  <ul>
                    {messages.map((message, index) => (
                      <li key={index}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
            <li className="notification-container" ref={notificationsRef}>
              <button onClick={() => toggleDropdown('notifications')} className="notification-button" title="Notifications">
                <FaBell className="notifications-icon" />
              </button>
              {dropdownOpen === 'notifications' && (
                <div className="dropdown" ref={notificationsRef}>
                  <ul>
                    {notifications.map((notification, index) => (
                      <li key={index}>{notification}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
            <li>
              <Link to="/profile">
                <img src={profilePic} alt="Profile" className="profile-pic" title="Profile" />
              </Link>
            </li>
            <li className="navbar-container">
              <button onClick={toggleSidebar} className="navbar-button" title="Menu">
                <FaBars />
              </button>
            </li>
          </ul>
        </nav>
      </header>
      <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/tutoring-mentorship" onClick={closeSidebar}>Peer Tutoring & Mentorship</Link></li>
          <li><Link to="/marketplace" onClick={closeSidebar}>Marketplace</Link></li>
          <li><Link to="/housing-roommate" onClick={closeSidebar}>Housing & Roommate Finder</Link></li>
          <li><Link to="/discounts-deals" onClick={closeSidebar}>Student Discounts & Deals</Link></li>
          <li><Link to="/club-announcements" onClick={closeSidebar}>Club Announcements</Link></li>
          <li><Link to="/settings" onClick={closeSidebar}>Settings</Link></li>
          <li><a href="/" onClick={handleLogout}>Logout</a></li> {}
        </ul>
      </div>
      <div className={`main-content ${sidebarOpen ? 'shift' : ''}`}>
        {/* Main content goes here */}
      </div>
    </div>
  );
};

export default Header;