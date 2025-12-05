import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Modal,
  Alert,
  Badge,
  InputGroup
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchTeams, createTeam } from '../api';   // 👈 connexion au backend
import './TeamManagement.css';

const TeamManagement = () => {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    members: '',
    challenges: '',
    logoUrl: ''
  });

  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Vérif admin
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Chargement des équipes depuis le backend
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setApiError('');
        const raw = await fetchTeams(); // GET /teams

        // On enrichit les données du back avec des champs front
        const enriched = raw.map(t => ({
          id: t.id,
          name: t.name,
          logoUrl: t.logoUrl,
          createdAt: t.createdAt
            ? t.createdAt.toString().split(' ')[0]
            : new Date().toISOString().split('T')[0],
          members: [],         // pas stocké en base → uniquement dans le front
          challenges: [],
          score: 0,
          level: 1,
          status: 'active'
        }));

        setTeams(enriched);
        setFilteredTeams(enriched);
      } catch (err) {
        console.error(err);
        setApiError("Impossible de charger les équipes depuis le serveur.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.members.some(member =>
          member.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredTeams(filtered);
    }
  }, [searchTerm, teams]);

  const resetForm = () => {
    setFormData({
      name: '',
      members: '',
      challenges: '',
      logoUrl: ''
    });
    setEditingTeam(null);
    setApiError('');
    setApiSuccess('');
  };

  // Création d’équipe → envoie au backend
  const handleAddTeam = async () => {
    if (!formData.name.trim()) {
      alert("Veuillez entrer un nom pour l'équipe");
      return;
    }

    try {
      setApiError('');
      setApiSuccess('');

      const adminToken = localStorage.getItem('adminToken') || undefined;

      // ce qui part dans la base
      const payload = {
        name: formData.name.trim(),
        logoUrl: formData.logoUrl || null
      };

      // POST /teams → { id, name, logoUrl }
      const created = await createTeam(payload, adminToken);

      const newTeam = {
        id: created.id,
        name: created.name,
        logoUrl: created.logoUrl,
        createdAt: new Date().toISOString().split('T')[0],
        members: formData.members
          .split(',')
          .map(m => m.trim())
          .filter(m => m),
        challenges: formData.challenges
          .split(',')
          .map(c => c.trim())
          .filter(c => c),
        score: 0,
        level: 1,
        status: 'active'
      };

      const updatedTeams = [...teams, newTeam];
      setTeams(updatedTeams);
      setFilteredTeams(updatedTeams);
      setApiSuccess("Équipe créée et enregistrée en base ✅");

      resetForm();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setApiError(
        err.message === 'Erreur création équipe'
          ? "Nom d'équipe déjà utilisé ou erreur serveur."
          : err.message || "Erreur lors de la création de l'équipe."
      );
    }
  };

  // Pour l’instant, edit/delete restent côté front (pas de PUT/DELETE dans l’API)
  const handleEditTeam = team => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      members: team.members.join(', '),
      challenges: team.challenges.join(', '),
      logoUrl: team.logoUrl || ''
    });
    setShowModal(true);
  };

  const handleUpdateTeam = () => {
    if (!formData.name.trim()) {
      alert("Veuillez entrer un nom pour l'équipe");
      return;
    }

    const updatedTeams = teams.map(team =>
      team.id === editingTeam.id
        ? {
            ...team,
            name: formData.name.trim(),
            members: formData.members
              .split(',')
              .map(m => m.trim())
              .filter(m => m),
            challenges: formData.challenges
              .split(',')
              .map(c => c.trim())
              .filter(c => c),
            logoUrl: formData.logoUrl || null
          }
        : team
    );

    setTeams(updatedTeams);
    setFilteredTeams(updatedTeams);
    setShowModal(false);
    setEditingTeam(null);
    setApiSuccess("Équipe mise à jour (front uniquement).");
  };

  const handleDeleteTeam = id => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette équipe ? (suppression côté front uniquement pour l'instant)"
      )
    ) {
      const updated = teams.filter(team => team.id !== id);
      setTeams(updated);
      setFilteredTeams(updated);
    }
  };

  const handleViewDetails = team => {
    navigate(`/admin/teams/${team.id}`, { state: { team } });
  };

  const stats = {
    totalTeams: teams.length,
    totalMembers: teams.reduce((sum, team) => sum + team.members.length, 0),
    averageScore:
      teams.length > 0
        ? Math.round(teams.reduce((sum, team) => sum + team.score, 0) / teams.length)
        : 0,
    activeTeams: teams.filter(t => t.status === 'active').length
  };

  return (
    <div className="team-management">
      {/* Header */}
      <div className="admin-header bg-primary text-white py-4">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">👥 Gestion des Équipes</h1>
              <p className="text-light mb-0">
                Ajouter, modifier ou supprimer des équipes
              </p>
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
                variant="success"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                ➕ Nouvelle équipe
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {/* Messages backend */}
        {loading && <Alert variant="info">Chargement des équipes...</Alert>}
        {apiError && <Alert variant="danger">{apiError}</Alert>}
        {apiSuccess && <Alert variant="success">{apiSuccess}</Alert>}

        {/* Statistiques */}
        <Row className="mb-4 g-3">
          <Col md={3}>
            <Card className="text-center stat-card">
              <Card.Body>
                <div className="stat-icon">👥</div>
                <h3 className="stat-value">{stats.totalTeams}</h3>
                <p className="stat-label">Équipes totales</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center stat-card">
              <Card.Body>
                <div className="stat-icon">👤</div>
                <h3 className="stat-value">{stats.totalMembers}</h3>
                <p className="stat-label">Participants</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center stat-card">
              <Card.Body>
                <div className="stat-icon">🏆</div>
                <h3 className="stat-value">{stats.averageScore}</h3>
                <p className="stat-label">Score moyen</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center stat-card">
              <Card.Body>
                <div className="stat-icon">✅</div>
                <h3 className="stat-value">{stats.activeTeams}</h3>
                <p className="stat-label">Équipes actives</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Barre de recherche et filtres */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={8}>
                <InputGroup>
                  <InputGroup.Text>🔍</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher une équipe ou un membre..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <div className="d-flex gap-2">
                  <Form.Select>
                    <option>Tous les statuts</option>
                    <option>Actif</option>
                    <option>Inactif</option>
                  </Form.Select>
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    🔄
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Tableau des équipes – inchangé */}
        <Card>
          <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Liste des Équipes</h5>
            <Badge bg="light" text="dark">
              {filteredTeams.length} équipe
              {filteredTeams.length > 1 ? 's' : ''}
            </Badge>
          </Card.Header>
          <Card.Body className="p-0">
            {filteredTeams.length === 0 ? (
              <div className="text-center py-5">
                <div className="empty-state-icon">👥</div>
                <h5 className="mt-3">Aucune équipe trouvée</h5>
                <p className="text-muted">
                  {searchTerm
                    ? 'Aucun résultat pour votre recherche'
                    : 'Commencez par créer votre première équipe'}
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                >
                  ➕ Créer une équipe
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th width="50">ID</th>
                      <th>Équipe</th>
                      <th width="120">Membres</th>
                      <th width="100">Score</th>
                      <th width="100">Niveau</th>
                      <th width="120">Statut</th>
                      <th width="150">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map(team => (
                      <tr key={team.id}>
                        <td>
                          <Badge bg="secondary">#{team.id}</Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="team-avatar me-3">
                              {team.name.charAt(0)}
                            </div>
                            <div>
                              <div className="team-name">{team.name}</div>
                              <small className="text-muted">
                                Créée le {team.createdAt}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="members-list">
                            {team.members.slice(0, 2).map((member, idx) => (
                              <Badge key={idx} bg="info" className="me-1 mb-1">
                                {member}
                              </Badge>
                            ))}
                            {team.members.length > 2 && (
                              <Badge bg="secondary">
                                +{team.members.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="score-display">
                            <span className="score-value">{team.score}</span>
                            <small className="text-muted"> pts</small>
                          </div>
                        </td>
                        <td>
                          <div className="level-display">
                            <div className="level-badge">Lvl {team.level}</div>
                            <div className="level-bar">
                              <div
                                className="level-progress"
                                style={{ width: `${team.level * 20}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge
                            bg={
                              team.status === 'active'
                                ? 'success'
                                : 'secondary'
                            }
                          >
                            {team.status}
                          </Badge>
                        </td>
                        <td>
                          <div className="actions">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEditTeam(team)}
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="me-1"
                              onClick={() => handleDeleteTeam(team.id)}
                            >
                              🗑️
                            </Button>
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleViewDetails(team)}
                            >
                              👁️
                            </Button>
                          </div>
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
                Affichage de {filteredTeams.length} équipe
                {filteredTeams.length > 1 ? 's' : ''}
              </small>
              <div className="pagination">
                <Button size="sm" variant="outline-secondary" disabled>
                  Précédent
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="ms-2"
                  disabled
                >
                  Suivant
                </Button>
              </div>
            </div>
          </Card.Footer>
        </Card>

        {/* Conseils */}
        <Alert variant="info" className="mt-4">
          <div className="d-flex">
            <div className="alert-icon">💡</div>
            <div className="ms-3">
              <h5>Conseils de gestion</h5>
              <ul className="mb-0">
                <li>Assurez-vous que chaque équipe a entre 2 et 5 membres</li>
                <li>Les noms d'équipe doivent être uniques et descriptifs</li>
                <li>
                  Vous pouvez attribuer des scores depuis la page de gestion des
                  scores
                </li>
                <li>Les badges peuvent être attribués depuis le dashboard</li>
              </ul>
            </div>
          </div>
        </Alert>
      </Container>

      {/* Modal pour créer/modifier une équipe */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          resetForm();
        }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTeam ? "✏️ Modifier l'équipe" : '➕ Nouvelle Équipe'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom de l'équipe *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Team Phoenix"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Membres (séparés par des virgules) *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Alice, Bob, Charlie, Diana"
                value={formData.members}
                onChange={e =>
                  setFormData({ ...formData, members: e.target.value })
                }
                required
              />
              <Form.Text className="text-muted">
                Séparez les noms des membres par des virgules
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Défis concernés (optionnel)</Form.Label>
              <Form.Control
                type="text"
                placeholder="SFEIR, UX, MIAGE, Main"
                value={formData.challenges}
                onChange={e =>
                  setFormData({ ...formData, challenges: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Logo de l'équipe (URL)</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={e =>
                  setFormData({ ...formData, logoUrl: e.target.value })
                }
              />
              <Form.Text className="text-muted">
                Laissez vide pour utiliser l'initiale du nom
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            Annuler
          </Button>
          <Button
            variant={editingTeam ? 'primary' : 'success'}
            onClick={editingTeam ? handleUpdateTeam : handleAddTeam}
            disabled={!formData.name.trim() || !formData.members.trim()}
          >
            {editingTeam ? "Mettre à jour" : "Créer l'équipe"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TeamManagement;
