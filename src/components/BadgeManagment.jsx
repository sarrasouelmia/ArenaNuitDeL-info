// src/components/BadgeManagement.jsx
import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

const BadgeManagement = () => {
  const [badgeName, setBadgeName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: ici tu feras l'appel API vers ton backend
    // pour l’instant on simule juste
    setMessage(`🏅 Badge "${badgeName}" attribué à l'équipe #${teamId} (simulation)`);
    setBadgeName("");
    setTeamId("");
  };

  return (
    <div className="admin-dashboard">
      <Container className="py-4">
        <Row className="mb-3">
          <Col>
            <h2>Attribuer un badge</h2>
            <p className="text-muted">
              Récompense une équipe en lui attribuant un badge spécial.
            </p>
          </Col>
        </Row>

        {message && (
          <Row className="mb-3">
            <Col>
              <Alert variant="success" onClose={() => setMessage("")} dismissible>
                {message}
              </Alert>
            </Col>
          </Row>
        )}

        <Row>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Équipe (ID ou nom)</Form.Label>
                    <Form.Control
                      type="text"
                      value={teamId}
                      onChange={(e) => setTeamId(e.target.value)}
                      placeholder="Ex : 1 ou Team Phoenix"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nom du badge</Form.Label>
                    <Form.Control
                      type="text"
                      value={badgeName}
                      onChange={(e) => setBadgeName(e.target.value)}
                      placeholder='Ex : "Code Propre"'
                      required
                    />
                  </Form.Group>

                  <Button type="submit" variant="warning">
                    Attribuer le badge
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BadgeManagement;
