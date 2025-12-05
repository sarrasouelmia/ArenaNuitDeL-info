import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/leaderboard');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen">
      {/* Particules animées */}
      <div className="particles">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Contenu principal */}
      <div className="splash-content">
        <div className="logo-container">
          <div className="logo-circle animate__animated animate__pulse">
            <span className="logo-star">🌟</span>
          </div>
          <h1 className="splash-title animate__animated animate__fadeInDown">
            NUIT ARENA
          </h1>
          <p className="splash-subtitle animate__animated animate__fadeInUp animate__delay-1s">
            Real-Time Competition Dashboard
          </p>
        </div>

        {/* Animation de chargement */}
        <div className="loading-container">
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
          <p className="loading-text">Chargement du leaderboard...</p>
        </div>

        {/* Footer */}
        <div className="splash-footer">
          <small>Nuit de l'Info 2025 • Défi Gamification</small>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;