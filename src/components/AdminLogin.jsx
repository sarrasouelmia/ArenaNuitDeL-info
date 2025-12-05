import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulation d'authentification
    setTimeout(() => {
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        // Stocker l'état de connexion (pour la démo)
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminUsername', credentials.username);
        
        if (credentials.rememberMe) {
          localStorage.setItem('rememberAdmin', 'true');
        }
        
        navigate('/admin/dashboard');
      } else {
        setError('Identifiants incorrects. Essayez avec admin/admin pour la démo.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = () => {
    setCredentials({
      username: 'admin',
      password: 'admin',
      rememberMe: false
    });
    
    setTimeout(() => {
      localStorage.setItem('isAdminLoggedIn', 'true');
      navigate('/admin/dashboard');
    }, 500);
  };

  return (
    <div className="login-page">
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <Card className="login-card">
          <Card.Body className="p-4 p-md-5">
            {/* Logo */}
            <div className="text-center mb-4">
              <div className="login-logo">
                <span className="logo-icon">🔐</span>
              </div>
              <h2 className="login-title">Connexion Admin</h2>
              <p className="login-subtitle">Nuit Arena - Panel de gestion</p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <Alert variant="danger" className="text-center">
                {error}
              </Alert>
            )}

            {/* Formulaire */}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Identifiant</Form.Label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <Form.Control
                    type="text"
                    placeholder="Nom d'utilisateur"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mot de passe</Form.Label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  label="Se souvenir de moi"
                  checked={credentials.rememberMe}
                  onChange={(e) => setCredentials({...credentials, rememberMe: e.target.checked})}
                  disabled={isLoading}
                />
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100 login-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>

              {/* Bouton démo */}
              <Button
                type="button"
                variant="outline-secondary"
                className="w-100 mt-3"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                🎯 Utiliser les identifiants de démo (admin/admin)
              </Button>
            </Form>

            <div className="separator my-4">
              <span className="separator-text">OU</span>
            </div>

            {/* Actions supplémentaires */}
            <div className="text-center">
              <Button
                variant="link"
                className="text-decoration-none"
                onClick={() => navigate('/leaderboard')}
              >
                ← Retour au leaderboard public
              </Button>
              
              <div className="login-info mt-4">
                <small className="text-muted">
                  ⚠️ Pour la démonstration, utilisez :<br/>
                  <strong>Identifiant : admin</strong><br/>
                  <strong>Mot de passe : admin</strong>
                </small>
              </div>

              <div className="support-info mt-3">
                <small className="text-muted d-block">
                  📞 Problème de connexion ? Contactez l'organisateur
                </small>
              </div>
            </div>
          </Card.Body>
          
          {/* Footer */}
          <Card.Footer className="text-center py-3">
            <small className="text-muted">
              Nuit de l'Info 2024 • Panel réservé aux administrateurs
            </small>
          </Card.Footer>
        </Card>
      </Container>
    </div>
  );
};

export default AdminLogin;