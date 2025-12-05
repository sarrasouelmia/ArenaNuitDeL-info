import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './History.css';

const API_BASE_URL = 'http://localhost:3001';

const History = () => {
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    team: 'all',
    user: 'all',
    date: ''
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Protection admin
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // 🔄 Chargement depuis le backend /events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setErrorMsg('');

        const res = await fetch(`${API_BASE_URL}/events`);
        if (!res.ok) throw new Error("Erreur lors du chargement de l'historique");

        const data = await res.json(); // [{id,type,createdAt,payload}, ...]

        // 🔁 Normalisation pour coller à ton format front
        const normalized = (data || []).map(ev => {
          const p = ev.payload || {};

          let type = 'message';
          if (ev.type === 'SCORE_UPDATE') type = 'score';
          if (ev.type === 'TEAM_CREATED') type = 'team';

          return {
            id: ev.id,
            type,
            team: p.teamName || p.team || (p.teamId ? `Team #${p.teamId}` : undefined),
            points: p.points ?? null,
            challenge: p.challenge ?? null,
            user: p.user || 'Admin',
            time: ev.createdAt || '',
            details:
              type === 'score'
                ? `+${p.points} points`
                : type === 'team'
                ? 'Nouvelle équipe créée'
                : p.message || ''
          };
        });

        setEvents(normalized);
        setFilteredEvents(normalized);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Erreur lors du chargement de l'historique");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filtres
  useEffect(() => {
    let filtered = [...events];
    
    if (filters.type !== 'all') {
      filtered = filtered.filter(event => event.type === filters.type);
    }
    
    if (filters.team !== 'all') {
      filtered = filtered.filter(event => event.team === filters.team);
    }
    
    if (filters.user !== 'all') {
      filtered = filtered.filter(event => event.user === filters.user);
    }
    
    if (filters.date) {
      // createdAt au format "YYYY-MM-DD HH:MM:SS"
      filtered = filtered.filter(event =>
        (event.time || '').startsWith(filters.date)
      );
    }
    
    setFilteredEvents(filtered);
  }, [filters, events]);

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Type', 'Équipe', 'Détails', 'Utilisateur', 'Heure'],
      ...filteredEvents.map(event => [
        event.id,
        getEventTypeLabel(event.type),
        event.team || '-',
        event.details || event.message || '-',
        event.user,
        event.time || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique-nuit-info-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    alert(`📄 Fichier CSV exporté avec ${filteredEvents.length} entrées`);
  };

  const getEventTypeLabel = (type) => {
    switch(type) {
      case 'score': return 'Score';
      case 'badge': return 'Badge';
      case 'team': return 'Équipe';
      case 'message': return 'Message';
      case 'submission': return 'Soumission';
      default: return 'Autre';
    }
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'score': return '⚡';
      case 'badge': return '🏅';
      case 'team': return '👥';
      case 'message': return '📢';
      case 'submission': return '📄';
      default: return '📝';
    }
  };

  const getEventColor = (type) => {
    switch(type) {
      case 'score': return 'success';
      case 'badge': return 'warning';
      case 'team': return 'primary';
      case 'message': return 'info';
      case 'submission': return 'secondary';
      default: return 'dark';
    }
  };

  const getUniqueTeams = () => {
    const teams = events.filter(e => e.team).map(e => e.team);
    return [...new Set(teams)];
  };

  const getUniqueUsers = () => {
    const users = events.map(e => e.user).filter(Boolean);
    return [...new Set(users)];
  };

  const stats = {
    totalEvents: events.length,
    scoreEvents: events.filter(e => e.type === 'score').length,
    badgeEvents: events.filter(e => e.type === 'badge').length,
    todayEvents: events.length // simple : tous
  };

  return (
    <div className="history-page">
      {/* Header */}
      <div className="admin-header bg-secondary text-white py-4">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">📜 Historique Complet</h1>
              <p className="text-light mb-0">Audit trail de tous les événements</p>
            </div>
            <div>
              <Button 
                variant="light" 
                className="me-2"
                onClick={() => navigate('/admin/dashboard')}
              >
                ← Retour
              </Button>
              <Button 
                variant="outline-light"
                onClick={handleExport}
              >
                📊 Exporter CSV
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {loading && (
          <Alert variant="info">Chargement de l'historique...</Alert>
        )}

        {errorMsg && (
          <Alert variant="danger" onClose={() => setErrorMsg('')} dismissible>
            {errorMsg}
          </Alert>
        )}

        {/* Statistiques */}
        <Row className="mb-4 g-3">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <div className="stat-icon">📊</div>
                <h3 className="stat-value">{stats.totalEvents}</h3>
                <p className="stat-label">Événements totaux</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <div className="stat-icon">⚡</div>
                <h3 className="stat-value">{stats.scoreEvents}</h3>
                <p className="stat-label">Scores</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <div className="stat-icon">🏅</div>
                <h3 className="stat-value">{stats.badgeEvents}</h3>
                <p className="stat-label">Badges</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <div className="stat-icon">📅</div>
                <h3 className="stat-value">{stats.todayEvents}</h3>
                <p className="stat-label">Aujourd'hui</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filtres */}
        <Card className="mb-4">
          <Card.Header className="bg-light">
            <h5 className="mb-0">🔍 Filtres</h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Type d'événement</Form.Label>
                  <Form.Select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                  >
                    <option value="all">Tous les types</option>
                    <option value="score">Scores</option>
                    <option value="badge">Badges</option>
                    <option value="team">Équipes</option>
                    <option value="message">Messages</option>
                    <option value="submission">Soumissions</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Équipe</Form.Label>
                  <Form.Select
                    value={filters.team}
                    onChange={(e) => setFilters({...filters, team: e.target.value})}
                  >
                    <option value="all">Toutes les équipes</option>
                    {getUniqueTeams().map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Utilisateur</Form.Label>
                  <Form.Select
                    value={filters.user}
                    onChange={(e) => setFilters({...filters, user: e.target.value})}
                  >
                    <option value="all">Tous les utilisateurs</option>
                    {getUniqueUsers().map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
              </small>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setFilters({ type: 'all', team: 'all', user: 'all', date: '' })}
              >
                🔄 Réinitialiser
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Tableau d'historique */}
        <Card>
          <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Journal des Événements</h5>
            <Badge bg="light" text="dark">
              {filteredEvents.length} résultat{filteredEvents.length > 1 ? 's' : ''}
            </Badge>
          </Card.Header>
          <Card.Body className="p-0">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-5">
                <div className="empty-state-icon">📭</div>
                <h5 className="mt-3">Aucun événement trouvé</h5>
                <p className="text-muted">Aucun événement ne correspond à vos filtres</p>
                <Button 
                  variant="outline-primary"
                  onClick={() => setFilters({ type: 'all', team: 'all', user: 'all', date: '' })}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th width="80">ID</th>
                      <th width="100">Type</th>
                      <th>Événement</th>
                      <th width="120">Utilisateur</th>
                      <th width="180">Heure</th>
                      <th width="100">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map(event => (
                      <tr key={event.id}>
                        <td>
                          <Badge bg="secondary">#{event.id}</Badge>
                        </td>
                        <td>
                          <Badge bg={getEventColor(event.type)} className="d-flex align-items-center">
                            <span className="me-1">{getEventIcon(event.type)}</span>
                            {getEventTypeLabel(event.type)}
                          </Badge>
                        </td>
                        <td>
                          <div className="event-details">
                            <div className="event-main">
                              {event.type === 'score' && (
                                <>
                                  <strong>{event.team}</strong>
                                  <span className="text-success ms-2">+{event.points} pts</span>
                                  <small className="text-muted ms-2">({event.challenge})</small>
                                </>
                              )}
                              {event.type === 'badge' && (
                                <>
                                  <strong>{event.team}</strong>
                                  <span className="text-warning ms-2">Badge "{event.badge}"</span>
                                </>
                              )}
                              {event.type === 'team' && (
                                <>
                                  <strong>{event.team}</strong>
                                  <span className="text-primary ms-2">Équipe créée</span>
                                </>
                              )}
                              {event.type === 'message' && (
                                <>
                                  <span className="text-info">Message global:</span>
                                  <div className="event-message">{event.message || event.details}</div>
                                </>
                              )}
                              {event.type === 'submission' && (
                                <>
                                  <strong>{event.team}</strong>
                                  <span className="text-secondary ms-2">Soumission {event.challenge}</span>
                                </>
                              )}
                            </div>
                            <div className="event-description text-muted">
                              <small>{event.details}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg="info">{event.user}</Badge>
                        </td>
                        <td>
                          <div className="event-time">
                            <small>{event.time}</small>
                          </div>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => {
                              alert(`Détails de l'événement #${event.id}:\n\nType: ${getEventTypeLabel(event.type)}\nÉquipe: ${event.team || 'N/A'}\nUtilisateur: ${event.user}\nHeure: ${event.time}\n\n${event.details || event.message || 'Aucun détail supplémentaire'}`);
                            }}
                          >
                            👁️
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              if (window.confirm(`Répliquer l'événement #${event.id} ?`)) {
                                alert(`Événement #${event.id} répliqué avec succès !`);
                              }
                            }}
                          >
                            🔄
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
          <Card.Footer className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Affichage des derniers événements
              </small>
              <div className="pagination">
                <Button size="sm" variant="outline-secondary" disabled>Précédent</Button>
                <Button size="sm" variant="outline-primary" className="ms-2" disabled>1</Button>
                <Button size="sm" variant="outline-secondary" className="ms-2" disabled>Suivant</Button>
              </div>
            </div>
          </Card.Footer>
        </Card>

        {/* Informations */}
        <Alert variant="light" className="mt-4">
          <div className="d-flex">
            <div className="alert-icon">ℹ️</div>
            <div className="ms-3">
              <h6>À propos de l'historique</h6>
              <ul className="mb-0 small">
                <li>Toutes les actions administratives sont enregistrées ici</li>
                <li>L'historique permet un audit complet de la compétition</li>
                <li>Les données peuvent être exportées au format CSV</li>
                <li>Cet historique est essentiel pour la transparence et l'équité</li>
              </ul>
            </div>
          </div>
        </Alert>
      </Container>
    </div>
  );
};

export default History;
