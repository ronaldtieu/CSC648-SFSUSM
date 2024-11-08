import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FaBars, FaComment, FaBell, FaSearch } from 'react-icons/fa';
import './Header.css';
import profilePic from '../../assets/gator_default_pic.png';
import Messages from '../Messages/Messages'; 
import Notification from '../Notification/Notification'; 
import { logoutUser } from '../../service/profileService'; // Import the logout function

const Header = ({ notifications, messages }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const sidebarRef = useRef(null);
  const messagesRef = useRef(null);
  const notificationsRef = useRef(null);
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState(''); // New state for search term

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
    event.preventDefault(); 
    await logoutUser(); 
    history.push('/'); 
  };

  const handleSearch = () => {
    if (searchTerm) {
      history.push(`/search?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div>
      <header className="header">
        <div className="logo">SFSU Social Media Platform</div>
        
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button" title="Search">
            <FaSearch />
          </button>
        </div>

        <nav>
          <ul>
            {/* Home Button */}
            <li>
              <Link to="/home" className="home-icon" title="Home">
                <svg viewBox="0 0 64 64" width="32" height="32" fill="currentColor">
                  <path d="M32 2 L2 32 L12 32 L12 58 L26 58 L26 34 L38 34 L38 58 L52 58 L52 32 L62 32 Z" />
                </svg>
              </Link>
            </li>

            {/* Messages Dropdown */}
            <li className="messages-container" ref={messagesRef}>
              <button onClick={() => toggleDropdown('messages')} className="messages-button" title="Messages">
                <FaComment className="messages-icon" />
              </button>
              {dropdownOpen === 'messages' && (
                <Messages messages={messages} closeDropdown={closeDropdown} />
              )}
            </li>

            {/* Notifications Dropdown */}
            <li className="notification-container" ref={notificationsRef}>
              <button onClick={() => toggleDropdown('notifications')} className="notification-button" title="Notifications">
                <FaBell className="notifications-icon" />
              </button>
              {dropdownOpen === 'notifications' && (
                <Notification notifications={notifications} closeDropdown={closeDropdown} />
              )}
            </li>

            {/* Profile Button */}
            <li>
              <Link to="/profile">
                <img src={profilePic} alt="Profile" className="profile-pic" title="Profile" />
              </Link>
            </li>

            {/* Sidebar / Menu Button */}
            <li className="navbar-container">
              <button onClick={toggleSidebar} className="navbar-button" title="Menu">
                <FaBars />
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Sidebar */}
      <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/tutoring-mentorship" onClick={closeSidebar}>Peer Tutoring & Mentorship</Link></li>
          <li><Link to="/marketplace" onClick={closeSidebar}>Marketplace</Link></li>
          <li><Link to="/housing-roommate" onClick={closeSidebar}>Housing & Roommate Finder</Link></li>
          <li><Link to="/discounts-deals" onClick={closeSidebar}>Student Discounts & Deals</Link></li>
          <li><Link to="/club-announcements" onClick={closeSidebar}>Club Announcements</Link></li>
          <li><Link to="/settings" onClick={closeSidebar}>Settings</Link></li>
          <li><a href="/" onClick={handleLogout}>Logout</a></li>
        </ul>
      </div>

      <div className={`main-content ${sidebarOpen ? 'shift' : ''}`}>
        {/* Main content goes here */}
      </div>
    </div>
  );
};

export default Header;