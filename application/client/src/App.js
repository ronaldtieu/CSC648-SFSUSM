import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import MessagesPage from './pages/MessagePage/MessagePage';
import Settings from './components/Settings/Setting';
import Profile from './pages/Profile/Profile'; 
import EditProfile from './pages/Profile/EditProfile';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';
import TutoringMentorshipPage from './pages/TutoringMentorship/TutoringMentorship';
import Marketplace from './pages/Marketplace/Marketplace';
import DiscountsDeals from './pages/DiscountDeals/DiscountDeals';
import LandingPage from './pages/LandingPage/LandingPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { checkSession, fetchUserPosts } from './service/profileService'; 
import ViewProfile from './pages/Profile/ViewProfile'

import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('accessToken'));

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const sessionData = await checkSession();  // Use checkSession from profileService

        if (sessionData.success) {
          setIsLoggedIn(true);
          console.log('User is logged in:', sessionData.user);
        } else {
          setIsLoggedIn(false);
          console.log('User is not logged in:', sessionData.message);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoggedIn(false);
      }
    };

    checkUserSession();
  }, []);

  return (
    <Router>
      {isLoggedIn && <Header notifications={[]} messages={[]} />}
      <Switch>
        <Route path="/" exact>
          {isLoggedIn ? <Redirect to="/home" /> : <LandingPage />}
        </Route>


        <ProtectedRoute path="/home" component={Home} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/profile" component={Profile} isLoggedIn={isLoggedIn} /> 
        <ProtectedRoute path="/view-profile" component={ViewProfile} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/edit-profile" component={EditProfile} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/messages" component={MessagesPage} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/settings" component={Settings} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/notifications" component={NotificationsPage} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/tutoring-mentorship" component={TutoringMentorshipPage} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/marketplace" component={Marketplace} isLoggedIn={isLoggedIn} />
        <ProtectedRoute path="/discounts-deals" component={DiscountsDeals} isLoggedIn={isLoggedIn} />

 
        <Redirect to={isLoggedIn ? "/home" : "/"} />
      </Switch>
      {isLoggedIn && <Footer />}  
    </Router>
  );
};

export default App;