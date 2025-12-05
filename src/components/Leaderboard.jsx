// src/components/Leaderboard.jsx
import { useEffect, useState } from "react";
import { fetchLeaderboard, fetchAnnouncements } from "../api";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Table,
  Alert,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./Leaderboard.css";

const Leaderboard = () => {
  const navigate = useNavigate();

  // Équipes construites à partir du backend
  const [teams, setTeams] = useState([]);

  // Pour l’instant on laisse quelques events fake (on pourra plus tard les brancher sur /events)
  const [liveEvents] = useState([
    { id: 1, team: "Team Phoenix", points: 50, challenge: "SFEIR", time: "2 min" },
    { id: 2, team: "Dev Ninjas", action: "badge", badge: "Code Propre", time: "5 min" },
    { id: 3, team: "Code Masters", action: "submission", challenge: "Principal", time: "10 min" },
  ]);

  const [globalMessage, setGlobalMessage] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chargement réel du leaderboard + annonces depuis le backend
 useEffect(() => {
  async function loadLeaderboard() {
    try {
      setLoading(true);

      // 👉 appel backend
      const lb = await fetchLeaderboard();

      // Adaptation pour ton design
      const mappedTeams = lb.map((t) => {
        const score = t.totalPoints ?? 0;

        return {
          id: t.id,
          name: t.name,
          score,
          trend: 0,
          level: score >= 1000 ? 3 : score >= 700 ? 2 : 1,
          members: 0,
          lastActivity: new Date(),
          challenges: [],
          logoUrl: t.logoUrl || null,
        };
      });

      // Tri par score
      mappedTeams.sort((a, b) => b.score - a.score);

      setTeams(mappedTeams);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Erreur leaderboard :", err);
      setError("Impossible de communiquer avec le serveur.");
    } finally {
      setLoading(false);
    }
  }

  loadLeaderboard();

  // Refresh auto si tu veux
  const interval = setInterval(loadLeaderboard, 15000);
  return () => clearInterval(interval);
}, []);

  // Message global simulé (tu peux plus tard le lier aux annonces)
  useEffect(() => {
    const messages = [
      "⚠️ La soumission du défi UX ferme dans 15 minutes !",
      "🏆 Nouveau badge disponible : 'Multi-Challenge'",
      "🚀 Défi bonus : +20 points pour la première équipe qui termine",
      "📢 Rappel : Les screenshots doivent être inclus dans la soumission",
    ];

    const messageTimer = setTimeout(() => {
      setGlobalMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 15000);

    return () => clearTimeout(messageTimer);
  }, []);

  // ------- Rendus ---------

 const renderPodium = () => {
  const top3 = teams.slice(0, 3);

  // ordre : 2ème - 1er - 3ème
  const podiumConfig = [
    { index: 1, rank: 2, medal: "🥈" },
    { index: 0, rank: 1, medal: "🥇" },
    { index: 2, rank: 3, medal: "🥉" },
  ];

  return (
    <Row className="justify-content-center align-items-end mb-5 podium-row">
      {podiumConfig.map((cfg) => {
        const team = top3[cfg.index];
        if (!team) return null;

        return (
          <Col key={team.id} xs={12} md={4} className="podium-col">
            <div className={`podium-card podium-rank-${cfg.rank}`}>
              <div className="podium-content">
                <div className="medal">{cfg.medal}</div>
                <div className="position-label">#{cfg.rank}</div>

                <div className="team-avatar">
                  <div className="avatar-circle">
                    {team.name.charAt(0)}
                  </div>
                </div>

                {/* 👉 nom + score DANS la carte */}
                <h5 className="team-name-podium mt-3">{team.name}</h5>
                <div className="team-score-podium">{team.score} pts</div>
              </div>
            </div>
          </Col>
        );
      })}
    </Row>
  );
};

  const renderStats = () => {
    if (!teams.length) return null;

    const totalPoints = teams.reduce((sum, team) => sum + team.score, 0);
    const totalMembers = teams.reduce((sum, team) => sum + (team.members || 0), 0);
    const averageScore = Math.round(totalPoints / teams.length);

    return (
      <Row className="mb-4 g-3">
        <Col md={3} sm={6}>
          <Card className="stat-card bg-primary text-white">
            <Card.Body className="text-center">
              <div className="stat-icon">👥</div>
              <h2 className="stat-value">{teams.length}</h2>
              <p className="stat-label">Équipes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card bg-success text-white">
            <Card.Body className="text-center">
              <div className="stat-icon">🏆</div>
              <h2 className="stat-value">{totalPoints}</h2>
              <p className="stat-label">Points totaux</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card bg-warning text-white">
            <Card.Body className="text-center">
              <div className="stat-icon">📈</div>
              <h2 className="stat-value">{averageScore}</h2>
              <p className="stat-label">Moyenne/équipe</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card bg-info text-white">
            <Card.Body className="text-center">
              <div className="stat-icon">🚀</div>
              <h2 className="stat-value">{totalMembers}</h2>
              <p className="stat-label">Participants</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderTeamTable = () => (
    <Card className="mb-4">
      <Card.Header className="table-header bg-dark text-white d-flex justify-content-between align-items-center">
        <h4 className="mb-0">
          <span className="me-2">📊</span>
          Classement Complet
        </h4>
        <Badge bg="light" text="dark">
          {teams.length} équipes
        </Badge>
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive hover className="mb-0">
          <thead className="table-dark">
            <tr>
              <th width="80">Rang</th>
              <th>Équipe</th>
              <th width="120">Score</th>
              <th width="120">Tendance</th>
              <th width="100">Niveau</th>
              <th width="120">Défis</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr key={team.id} className={index < 3 ? "table-warning" : ""}>
                <td>
                  <div className={`rank-badge rank-${index + 1}`}>
                    #{index + 1}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="team-avatar-small me-3">
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <strong>{team.name}</strong>
                      <div className="text-muted small">
                        {team.members || 0} membres
                      </div>
                    </div>
                  </div>
                </td>
                <td className="fw-bold text-primary fs-5">
                  {team.score}
                </td>
                <td>
                  <div className={`trend ${team.trend > 0 ? "up" : "down"}`}>
                    {team.trend > 0 ? "📈" : "📉"}
                    <span className="ms-1">{Math.abs(team.trend)}</span>
                  </div>
                </td>
                <td>
                  <div className="level-container">
                    <div className="level-bar">
                      <div
                        className="level-fill"
                        style={{ width: `${team.level * 20}%` }}
                      ></div>
                    </div>
                    <small className="text-muted">Niv. {team.level}</small>
                  </div>
                </td>
                <td>
                  <div className="challenges">
                    {(team.challenges || []).slice(0, 2).map((challenge, idx) => (
                      <Badge key={idx} bg="secondary" className="me-1">
                        {challenge}
                      </Badge>
                    ))}
                    {team.challenges && team.challenges.length > 2 && (
                      <Badge bg="light" text="dark">
                        +{team.challenges.length - 2}
                      </Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  const renderLiveFeed = () => (
    <Card className="mb-4">
      <Card.Header className="live-header bg-danger text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <span className="live-icon">🔥</span>
          Événements en Direct
        </h5>
        <Badge bg="warning" className="pulse-animation">
          EN DIRECT
        </Badge>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="live-feed-container">
          {liveEvents.map((event, index) => (
            <div
              key={event.id}
              className={`live-event ${index === 0 ? "latest" : ""}`}
            >
              <div className="event-icon">
                {event.points ? "⚡" : "🏅"}
              </div>
              <div className="event-content">
                <div className="event-title">
                  <strong>{event.team}</strong>
                  {event.points && (
                    <span className="points-added text-success">
                      +{event.points} points
                    </span>
                  )}
                  {event.badge && (
                    <span className="badge-earned text-warning">
                      Badge "{event.badge}"
                    </span>
                  )}
                </div>
                <div className="event-details">
                  {event.challenge && `Défi ${event.challenge}`}
                  <span className="event-time">• {event.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );

  // --------- Rendu principal ---------

  if (loading) {
    return (
      <div className="leaderboard-page">
        <Container className="py-5 text-center text-light">
          Chargement du classement...
        </Container>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      {/* Message d’erreur */}
      {error && (
        <Alert variant="danger" className="m-3">
          {error}
        </Alert>
      )}

      {/* Message global */}
      {globalMessage && (
        <Alert
          variant="warning"
          className="global-message animate__animated animate__fadeInDown"
          dismissible
          onClose={() => setGlobalMessage("")}
        >
          <div className="d-flex align-items-center">
            <span className="alert-icon me-2">📢</span>
            <div>
              <strong>Annonce :</strong> {globalMessage}
            </div>
          </div>
        </Alert>
      )}

      {/* Header */}
<div className="leaderboard-header">
  <Container>
    <div className="d-flex justify-content-between align-items-center py-3">
      <div>
        <h1 className="page-title">
          <span className="trophy-icon">🏆</span>
          ARENA 
        </h1>
        <p className="page-subtitle">Leaderboard en temps réel</p>
      </div>

      <div className="header-info">
        <Badge bg="danger" className="live-badge pulse-animation me-3">
          🔴 LIVE
        </Badge>
        <small className="text-muted">
          Dernière mise à jour : …
        </small>
      </div>
        {/* Bouton Admin */}
  <button
    className="admin-btn"
    onClick={() => navigate("/admin/login")}
  >
    Admin
  </button>
    </div>
  </Container>
</div>


      <Container className="py-4">
        {renderPodium()}
        {renderStats()}
        {renderTeamTable()}
        {renderLiveFeed()}

       

        <footer className="text-center mt-5 pt-4 border-top">
          <p className="text-muted mb-2">
            🚀 Nuit Arena - Plateforme de gamification
          </p>
          <small className="text-muted">
            ♿ Accessibilité WCAG 2.1 • ⚡ Mise à jour automatique • 📱 100%
            Responsive
          </small>
        </footer>
      </Container>
    </div>
  );
};

export default Leaderboard;
