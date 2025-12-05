import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './ScoreManagement.css';

const API_BASE_URL = 'http://localhost:3001'; // 🔁 À adapter à ton back

const ScoreManagement = () => {
  const navigate = useNavigate();
  
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    teamId: '',
    points: '',
    challenge: 'SFEIR',
    comment: ''
  });
  const [scoreHistory, setScoreHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ⛔ Protection route admin
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // 🔄 Chargement des équipes + historique depuis le backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg('');

        const [teamsRes, historyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/teams`),
          fetch(`${API_BASE_URL}/scores/recent`)
        ]);

        if (!teamsRes.ok) throw new Error("Erreur lors du chargement des équipes");
        if (!historyRes.ok) throw new Error("Erreur lors du chargement de l'historique");

        const teamsData = await teamsRes.json();
        const historyData = await historyRes.json();

        setTeams(teamsData || []);

        // On mappe l’historique pour qu’il colle avec le format attendu par le front
        const mappedHistory = (historyData || []).map(s => ({
          id: s.id,
          team: s.teamName || s.team || 'Équipe inconnue',
          points: s.points,
          challenge: s.challenge,
          time: s.time
            ? new Date(s.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '—',
          user: s.user || 'Admin',
          comment: s.comment || ''
        }));

        setScoreHistory(mappedHistory);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 📝 Soumission d’un score via le backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!formData.teamId || !formData.points) {
      alert("Veuillez sélectionner une équipe et entrer des points");
      return;
    }

    try {
      const payload = {
        teamId: parseInt(formData.teamId),
        points: parseInt(formData.points),
        challenge: formData.challenge,
        comment: formData.comment || ''
      };

      const res = await fetch(`${API_BASE_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer ' + localStorage.getItem('token') // si tu utilises JWT
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'enregistrement du score");
      }

      const createdScore = await res.json();

      const selectedTeam = teams.find(t => t.id === payload.teamId);

      // ➕ On ajoute en haut de l’historique (sans recharger toute la page)
      const newScore = {
        id: createdScore.id || Date.now(),
        team: createdScore.teamName || selectedTeam?.name || 'Équipe inconnue',
        points: createdScore.points || payload.points,
        challenge: createdScore.challenge || payload.challenge,
        time: createdScore.time
          ? new Date(createdScore.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: createdScore.user || 'Admin',
        comment: createdScore.comment || payload.comment
      };

      setScoreHistory(prev => [newScore, ...prev]);

      // (optionnel) Mettre à jour le score actuel de l’équipe localement
      if (selectedTeam) {
        setTeams(prev =>
          prev.map(t =>
            t.id === selectedTeam.id
              ? { ...t, currentScore: (t.currentScore || 0) + payload.points }
              : t
          )
        );
      }

      setFormData({
        teamId: "",
        points: "",
        challenge: "SFEIR",
        comment: ""
      });

      setSuccessMsg(`✅ ${payload.points} points ajoutés à ${newScore.team} pour le défi ${payload.challenge}`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'enregistrement du score");
    }
  };

  // ⚡ Points rapides (en passant par le backend aussi)
  const handleQuickPoints = async (teamId, points) => {
    setSuccessMsg('');
    setErrorMsg('');

    const selectedTeam = teams.find(t => t.id === teamId);
    if (!selectedTeam) {
      alert("Équipe introuvable");
      return;
    }

    try {
      const payload = {
        teamId: teamId,
        points: points,
        challenge: "Quick Add",
        comment: "Points rapides"
      };

      const res = await fetch(`${API_BASE_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Erreur lors de l'enregistrement des points rapides");
      }

      const createdScore = await res.json();

      const newScore = {
        id: createdScore.id || Date.now(),
        team: createdScore.teamName || selectedTeam.name,
        points: createdScore.points || points,
        challenge: createdScore.challenge || "Quick Add",
        time: createdScore.time
          ? new Date(createdScore.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: createdScore.user || 'Admin',
        comment: createdScore.comment || "Points rapides"
      };

      setScoreHistory(prev => [newScore, ...prev]);

      setTeams(prev =>
        prev.map(t =>
          t.id === selectedTeam.id
            ? { ...t, currentScore: (t.currentScore || 0) + points }
            : t
        )
      );

      setSuccessMsg(`⚡ ${points} points rapides ajoutés à ${selectedTeam.name}`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Erreur lors de l'attribution des points rapides");
    }
  };

  const getChallengeColor = (challenge) => {
    switch (challenge) {
      case 'SFEIR': return 'primary';
      case 'UX': return 'warning';
      case 'MIAGE': return 'info';
      case 'Main': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="score-management">
      {/* Header */}
      <div className="admin-header bg-success text-white py-4">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">🎯 Attribution des Scores</h1>
              <p className="text-light mb-0">Attribuer des points aux équipes</p>
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
                onClick={() => navigate('/leaderboard')}
              >
                👁️ Voir le classement
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {loading && (
          <Alert variant="info">Chargement des équipes et de l'historique...</Alert>
        )}

        {errorMsg && (
          <Alert variant="danger" onClose={() => setErrorMsg('')} dismissible>
            {errorMsg}
          </Alert>
        )}

        {successMsg && (
          <Alert variant="success" onClose={() => setSuccessMsg('')} dismissible>
            {successMsg}
          </Alert>
        )}

        <Row className="g-4">
          {/* Colonne gauche - Formulaire */}
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">➕ Attribuer des Points</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Équipe *</Form.Label>
                    <Form.Select 
                      value={formData.teamId}
                      onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner une équipe</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} (Actuel: {team.currentScore ?? 0} pts)
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Points *</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="1000"
                      placeholder="Nombre de points"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                      required
                    />
                    <Form.Text className="text-muted">
                      Entre 1 et 1000 points
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Défi</Form.Label>
                    <Form.Select
                      value={formData.challenge}
                      onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                    >
                      <option value="SFEIR">SFEIR Challenge</option>
                      <option value="MIAGE">MIAGE Challenge</option>
                      <option value="UX">UX Challenge</option>
                      <option value="Main">Main Challenge</option>
                      <option value="Bonus">Bonus</option>
                      <option value="Other">Autre</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Commentaire (optionnel)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Raison de l'attribution..."
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    />
                  </Form.Group>

                  <Button 
                    type="button" 
                    variant="success" 
                    className="w-100"
                    disabled={!formData.teamId || !formData.points}
                     onClick={handleSubmit}
                  >
                    🎯 Enregistrer les points
                  </Button>
                </Form>

                <div className="separator my-4">
                  <span className="separator-text">OU</span>
                </div>

                {/* Points rapides */}
                <div className="quick-points">
                  <h6 className="mb-3">⚡ Points Rapides</h6>
                  <div className="row g-2">
                    {[10, 20, 30, 50].map(points => (
                      <div key={points} className="col-6">
                        <Button
                          variant="outline-secondary"
                          className="w-100 mb-2"
                          onClick={() => {
                            if (formData.teamId) {
                              handleQuickPoints(parseInt(formData.teamId), points);
                            } else {
                              alert("Veuillez d'abord sélectionner une équipe");
                            }
                          }}
                          disabled={!formData.teamId}
                        >
                          +{points} pts
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Colonne droite - Historique */}
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">📜 Historique Récent</h5>
                <Badge bg="light" text="dark">
                  {scoreHistory.length} entrées
                </Badge>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="history-container">
                  {scoreHistory.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="empty-icon">📝</div>
                      <h5 className="mt-3">Aucun historique</h5>
                      <p className="text-muted">Commencez par attribuer des points</p>
                    </div>
                  ) : (
                    <div className="history-list">
                      {scoreHistory.map(score => (
                        <div key={score.id} className="history-item">
                          <div className="history-header">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="history-team">
                                <strong>{score.team}</strong>
                                <Badge 
                                  bg={getChallengeColor(score.challenge)} 
                                  className="ms-2"
                                >
                                  {score.challenge}
                                </Badge>
                              </div>
                              <div className="history-points text-success">
                                +{score.points} pts
                              </div>
                            </div>
                          </div>
                          
                          <div className="history-body">
                            <div className="history-details">
                              <small className="text-muted">
                                {score.time} • Par {score.user}
                              </small>
                            </div>
                            {score.comment && score.comment !== "Aucun commentaire" && (
                              <div className="history-comment">
                                <small>{score.comment}</small>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card.Body>
              <Card.Footer className="bg-light">
                <Button 
                  variant="outline-primary" 
                  className="w-100"
                  onClick={() => navigate('/admin/history')}
                >
                  📄 Voir tout l'historique
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        {/* Statistiques des équipes */}
        <Card className="mt-4">
          <Card.Header className="bg-info text-white">
            <h5 className="mb-0">📊 Points par Équipe</h5>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              {teams.map(team => (
                <Col key={team.id} md={4}>
                  <div className="team-points-card">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="team-name">{team.name}</div>
                      <Badge bg="warning">{team.currentScore ?? 0} pts</Badge>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ width: `${((team.currentScore ?? 0) / 1500) * 100}%` }}
                      ></div>
                    </div>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline-success"
                        className="me-2"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            teamId: team.id.toString()
                          });
                        }}
                      >
                        Attribuer des points
                      </Button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        {/* Guide rapide */}
        <Alert variant="light" className="mt-4">
          <div className="d-flex">
            <div className="alert-icon">📋</div>
            <div className="ms-3">
              <h6>Guide d'attribution</h6>
              <ul className="mb-0 small">
                <li><strong>SFEIR Challenge :</strong> 20-50 points selon la qualité</li>
                <li><strong>UX Challenge :</strong> 10-30 points pour l'ergonomie</li>
                <li><strong>MIAGE Challenge :</strong> 15-40 points pour l'innovation</li>
                <li><strong>Main Challenge :</strong> 30-100 points pour la complétude</li>
                <li><strong>Bonus :</strong> Jusqu'à 20 points pour créativité/rapidité</li>
              </ul>
            </div>
          </div>
        </Alert>
      </Container>
    </div>
  );
};

export default ScoreManagement;
