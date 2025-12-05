import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Leaderboard from './components/Leaderboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import TeamManagement from './components/TeamManagement';
import ScoreManagement from './components/ScoreManagement';
import History from './components/History';
import BadgeManagement from "./components/BadgeManagment";

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/teams" element={<TeamManagement />} />
          <Route path="/admin/scores" element={<ScoreManagement />} />
          <Route path="/admin/history" element={<History />} />
          <Route path="/admin/badges" element={<BadgeManagement />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;