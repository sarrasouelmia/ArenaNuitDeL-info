import express from "express";
import { db } from "../db.js";
import { requireFields } from "../utils/validate.js";

const router = express.Router();

// -------------------------------------------
// POST /scores  → ajouter un score
// -------------------------------------------
router.post("/", async (req, res, next) => {
  try {
    const { teamId, points, challenge, comment } = req.body;

    // Vérifier les champs obligatoires
    requireFields(req.body, ["teamId", "points"]);

    const parsedTeamId = parseInt(teamId, 10);
    const parsedPoints = parseInt(points, 10);

    // 1) Insertion dans la table scores
    const insertSql = `
      INSERT INTO scores (teamId, points, challenge, comment)
      VALUES (?, ?, ?, ?)
    `;
    const result = await db.run(insertSql, [
      parsedTeamId,
      parsedPoints,
      challenge || "",
      comment || ""
    ]);

    const insertedId = result.lastID;

    // 2) Récupérer la ligne jointe avec l'équipe
    const selectSql = `
      SELECT 
        s.id,
        s.teamId,
        t.name AS teamName,
        s.points,
        s.challenge,
        s.comment
      FROM scores s
      JOIN teams t ON s.teamId = t.id
      WHERE s.id = ?
    `;
    const row = await db.get(selectSql, [insertedId]);

    // 3) Log dans la table events (pour /events et History.jsx)
    const eventPayload = {
      teamId: row.teamId,
      teamName: row.teamName,
      points: row.points,
      challenge: row.challenge || "",
      comment: row.comment || "",
      user: "Admin"
    };

    await db.run(
      "INSERT INTO events (type, payload) VALUES (?, ?)",
      ["SCORE_UPDATE", JSON.stringify(eventPayload)]
    );
    // createdAt est géré par DEFAULT CURRENT_TIMESTAMP dans la table events

    // 4) Réponse pour le front ScoreManagement
    const response = {
      id: row.id,
      teamId: row.teamId,
      teamName: row.teamName,
      points: row.points,
      challenge: row.challenge,
      comment: row.comment || "",
      user: "Admin",
      time: new Date().toISOString()
    };

    return res.status(201).json(response);

  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// GET /scores/recent → historique rapide dans /admin/scores
// --------------------------------------------------
router.get("/recent", async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        s.id,
        s.teamId,
        t.name AS teamName,
        s.points,
        s.challenge,
        s.comment
      FROM scores s
      JOIN teams t ON t.id = s.teamId
      ORDER BY s.id DESC
      LIMIT 50
    `;

    const rows = await db.all(sql);

    const history = rows.map((row) => ({
      id: row.id,
      teamId: row.teamId,
      teamName: row.teamName,
      points: row.points,
      challenge: row.challenge,
      comment: row.comment || "",
      user: "Admin",
      time: null
    }));

    res.json(history);

  } catch (err) {
    next(err);
  }
});

export default router;
