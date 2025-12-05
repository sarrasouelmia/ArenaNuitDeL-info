import express from "express";
import { db } from "../db.js";

const router = express.Router();

// Récupérer les derniers événements
router.get("/", async (req, res, next) => {
  try {
    // Optionnel : ?limit=20
    const limit = parseInt(req.query.limit || "30", 10);

    const events = await db.all(
      `SELECT id, type, payload, createdAt
       FROM events
       ORDER BY createdAt DESC
       LIMIT ?`,
      [limit]
    );

    // On parse le payload JSON pour renvoyer un objet propre
    const normalized = events.map((e) => ({
      id: e.id,
      type: e.type,
      createdAt: e.createdAt,
      payload: e.payload ? JSON.parse(e.payload) : null
    }));

    res.json(normalized);
  } catch (err) {
    next(err);
  }
});

export default router;
