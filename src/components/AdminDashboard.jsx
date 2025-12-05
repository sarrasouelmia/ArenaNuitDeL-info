import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, ListGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [globalMessage, setGlobalMessage] = useState('');
  const [quickActions] = useState([
    { icon: '➕', title: 'Nouvelle équipe', desc: 'Ajouter une équipe', link: '/admin/teams', color: 'primary' },
    { icon: '🎯', title: 'Ajouter des points', desc: 'Attribuer des scores', link: '/admin/scores', color: 'success' },
    { icon: '🏅', title: 'Attribuer un badge', desc: 'Récompenser une équipe', link: '/admin/badges', color: 'warning' },
    { icon: '📊', title: 'Exporter les données', desc: 'Télécharger le classement', link: '/admin/export', color: 'info' },
  ]);

  const [recentActivity] = useState([
    { time: '18:45', action: 'Team Phoenix +50 points', user: 'Admin', type: 'score' },
    { time: '18:40', action: 'Nouvelle équipe créée', user: 'Admin', type: 'team' },
    { time: '18:35', action: 'Message global envoyé', user: 'Jury', type: 'message' },
    { time: '18:30', action: 'Badge "Code Propre" attribué', user: 'Admin', type: 'badge' },
    { time: '18:25', action: 'Score modifié pour Dev Ninjas', user: 'Admin', type: 'score' },
  ]);

  const [stats] = useState({
    totalTeams: 5,
    totalPoints: 4450,
    totalEvents: 24,
    activeUsers: 19,
    averageScore: 890,
    challengesCompleted: 12
  });

  useEffect(() => {
    // Vérifier si l'admin est connecté
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/admin/login');
  };

  const handleSendMessage = () => {
    if (globalMessage.trim()) {
      alert(`📢 Message envoyé à toutes les équipes : "${globalMessage}"`);
      setGlobalMessage('');
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'score': return '⚡';
      case 'team': return '👥';
      case 'message': return '📢';
      case 'badge': return '🏅';
      default: return '📝';
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header Admin */}
      <div className="admin-header">
        <Container>
          <Row className="align-items-center py-3">
            <Col>
              <div className="d-flex align-items-center">
                <div className="admin-logo me-3">
                  ⚙️
                </div>
                <div>
                  <h1 className="admin-title mb-1">Panel Administrateur</h1>
                  <p className="admin-subtitle mb-0">Gestion complète de la compétition</p>
                </div>
              </div>
            </Col>
            <Col md="auto">
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={() => navigate('/leaderboard')}
                >
                  👁️ Voir le leaderboard
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={handleLogout}
                >
                  🔓 Déconnexion
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        {/* Statistiques rapides */}
        <Row className="mb-4 g-3">
          <Col md={2} sm={4} xs={6}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <div className="stat-icon">👥</div>
                <h3 className="stat-value">{stats.totalTeams}</h3>
                <p className="stat-label">Équipes</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} sm={4} xs={6}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <div className="stat-icon">🏆</div>
                <h3 className="stat-value">{stats.totalPoints}</h3>
                <p className="stat-label">Points</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} sm={4} xs={6}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <div className="stat-icon">📊</div>
                <h3 className="stat-value">{stats.totalEvents}</h3>
                <p className="stat-label">Événements</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} sm={4} xs={6}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <div className="stat-icon">👤</div>
                <h3 className="stat-value">{stats.activeUsers}</h3>
                <p className="stat-label">Participants</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} sm={4} xs={6}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <div className="stat-icon">📈</div>
                <h3 className="stat-value">{stats.averageScore}</h3>
                <p className="stat-label">Moyenne</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={2} sm={4} xs={6}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <div className="stat-icon">✅</div>
                <h3 className="stat-value">{stats.challengesCompleted}</h3>
                <p className="stat-label">Défis</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          {/* Colonne principale */}
          <Col lg={8}>
            {/* Message global */}
            <Card className="mb-4">
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">📢 Message Global</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Message à toutes les équipes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={globalMessage}
                    onChange={(e) => setGlobalMessage(e.target.value)}
                    placeholder="Ex: La soumission du défi UX ferme dans 15 minutes !"
                  />
                  <Form.Text className="text-muted">
                    Ce message apparaîtra sur le leaderboard public
                  </Form.Text>
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button 
                    variant="warning" 
                    onClick={handleSendMessage}
                    disabled={!globalMessage.trim()}
                  >
                    Envoyer maintenant
                  </Button>
                  <Button variant="outline-secondary">
                    Programmer
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Actions rapides */}
            <Card className="mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">⚡ Actions Rapides</h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  {quickActions.map((action, index) => (
                    <Col key={index} md={6}>
                      <Button
                        variant={`outline-${action.color}`}
                        className="w-100 quick-action-btn"
                        onClick={() => navigate(action.link)}
                      >
                        <div className="d-flex align-items-center">
                          <span className="action-icon me-3">{action.icon}</span>
                          <div className="text-start">
                            <div className="action-title">{action.title}</div>
                            <small className="action-desc">{action.desc}</small>
                          </div>
                        </div>
                      </Button>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            {/* Dernières équipes */}
            <Card>
              <Card.Header className="bg-success text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">👥 Équipes Récentes</h5>
                <Link to="/admin/teams" className="btn btn-sm btn-light">
                  Voir tout
                </Link>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {[
                    { name: 'Team Phoenix', score: 1250, members: 4, status: 'actif' },
                    { name: 'Dev Ninjas', score: 980, members: 3, status: 'actif' },
                    { name: 'Code Masters', score: 850, members: 5, status: 'actif' },
                    { name: 'UI/UX Wizards', score: 720, members: 3, status: 'actif' },
                    { name: 'Backend Titans', score: 650, members: 4, status: 'actif' },
                  ].map((team, index) => (
                    <ListGroup.Item key={index} className="team-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <div className="team-avatar me-3">
                            {team.name.charAt(0)}
                          </div>
                          <div>
                            <div className="team-name">{team.name}</div>
                            <small className="text-muted">
                              {team.members} membres • {team.score} points
                            </small>
                          </div>
                        </div>
                        <Badge bg={team.status === 'actif' ? 'success' : 'secondary'}>
                          {team.status}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Menu Admin */}
            <Card className="mb-4">
              <Card.Header className="bg-dark text-white">
                <h5 className="mb-0">📋 Menu Admin</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  <ListGroup.Item action className="menu-item" onClick={() => navigate('/admin/dashboard')}>
                    <div className="d-flex align-items-center">
                      <span className="menu-icon">📊</span>
                      <div className="ms-3">
                        <div className="menu-title">Dashboard</div>
                        <small className="menu-desc">Vue d'ensemble</small>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item action className="menu-item" onClick={() => navigate('/admin/teams')}>
                    <div className="d-flex align-items-center">
                      <span className="menu-icon">👥</span>
                      <div className="ms-3">
                        <div className="menu-title">Gestion des équipes</div>
                        <small className="menu-desc">Ajouter/modifier/supprimer</small>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item action className="menu-item" onClick={() => navigate('/admin/scores')}>
                    <div className="d-flex align-items-center">
                      <span className="menu-icon">🎯</span>
                      <div className="ms-3">
                        <div className="menu-title">Gestion des scores</div>
                        <small className="menu-desc">Attribuer des points</small>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item action className="menu-item" onClick={() => navigate('/admin/history')}>
                    <div className="d-flex align-items-center">
                      <span className="menu-icon">📜</span>
                      <div className="ms-3">
                        <div className="menu-title">Historique</div>
                        <small className="menu-desc">Tous les événements</small>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item action className="menu-item" onClick={() => navigate('/admin/settings')}>
                    <div className="d-flex align-items-center">
                      <span className="menu-icon">⚙️</span>
                      <div className="ms-3">
                        <div className="menu-title">Paramètres</div>
                        <small className="menu-desc">Configuration</small>
                      </div>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

            {/* Activité récente */}
            <Card>
              <Card.Header className="bg-secondary text-white">
                <h5 className="mb-0">🕒 Activité Récente</h5>
              </Card.Header>
              <Card.Body>
                <div className="activity-feed">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item mb-3">
                      <div className="d-flex">
                        <div className="activity-icon me-3">
                          {getTypeIcon(activity.type)}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <div className="activity-action">{activity.action}</div>
                            <div className="activity-time">{activity.time}</div>
                          </div>
                          <small className="text-muted">Par {activity.user}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline-secondary" 
                  className="w-100 mt-2"
                  onClick={() => navigate('/admin/history')}
                >
                  Voir tout l'historique
                </Button>
              </Card.Body>
            </Card>

            {/* Système */}
            <Card className="mt-4">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">💡 Système</h5>
              </Card.Header>
              <Card.Body>
                <div className="system-info">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Statut API:</span>
                    <Badge bg="success">En ligne</Badge>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Temps réel:</span>
                    <Badge bg="success">Actif</Badge>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Base de données:</span>
                    <Badge bg="success">Connectée</Badge>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Dernière sauvegarde:</span>
                    <span className="text-muted">18:30</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Avertissement */}
        <Alert variant="warning" className="mt-4">
          <div className="d-flex align-items-center">
            <span className="alert-icon me-2">⚠️</span>
            <div>
              <strong>Panel réservé aux administrateurs et membres du jury</strong>
              <div className="small">Toutes les actions sont enregistrées dans l'historique.</div>
            </div>
          </div>
        </Alert>
      </Container>
    </div>
  );
};

export default AdminDashboard;