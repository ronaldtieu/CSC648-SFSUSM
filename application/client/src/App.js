import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './components/Home/Home';
import MessagesPage from './components/MessagePage/MessagePage';
import Settings from './components/Settings/Setting';
import Profile from './components/Profile/Profile'; // Profile component
import EditProfile from './components/Profile/EditProfile'; // Import EditProfile component
import NotificationsPage from './components/NotificationsPage/NotificationsPage';
import TutoringMentorshipPage from './pages/TutoringMentorship/TutoringMentorship';
import Marketplace from './pages/Marketplace/Marketplace';
import DiscountsDeals from './pages/DiscountDeals/DiscountDeals';
import LandingPage from './pages/LandingPage/LandingPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('accessToken'));

  useEffect(() => {
    fetch('/api/users/check-session', {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      if (data.loggedIn) {
        setIsLoggedIn(true);
        console.log('User is logged in:', data.user);
      } else {
        setIsLoggedIn(false);
        console.log('User is not logged in');
      }
    })
    .catch(error => {
      console.error('Error checking session:', error);
      setIsLoggedIn(false);
    });
  }, []);

  return (
    <Router>
      {isLoggedIn && <Header />}  {/* Header will appear at the top if logged in */}
      <Switch>
        <Route path="/" exact>
          {isLoggedIn ? <Redirect to="/home" /> : <LandingPage />}
        </Route>

        {/* Authenticated routes with Header and Footer */}
        <ProtectedRoute path="/home" component={Home} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/profile" component={Profile} isLoggedIn={isLoggedIn} />  {/* Profile Route */}
        <ProtectedRoute path="/edit-profile" component={EditProfile} isLoggedIn={isLoggedIn} /> {/* Edit Profile Route */}
        <ProtectedRoute path="/messages" component={MessagesPage} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/settings" component={Settings} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/notifications" component={NotificationsPage} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/tutoring-mentorship" component={TutoringMentorshipPage} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/marketplace" component={Marketplace} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/discounts-deals" component={DiscountsDeals} isLoggedIn={isLoggedIn} />

        {/* Redirect any unknown routes to home if logged in, otherwise to the landing page */}
        <Redirect to={isLoggedIn ? "/home" : "/"} />
      </Switch>
      {isLoggedIn && <Footer />}  {/* Footer will appear at the bottom if logged in */}
    </Router>
  );
};

export default App;