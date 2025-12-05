import express from "express";
import { db } from "../db.js";
import { requireFields } from "../utils/validate.js";

const router = express.Router();

// Liste des équipes
router.get("/", async (req, res, next) => {
  try {
    const teams = await db.all("SELECT * FROM teams ORDER BY id DESC");
    res.json(teams);
  } catch (err) {
    next(err);
  }
});

// Ajouter une équipe
router.post("/", async (req, res, next) => {
  try {
    const { name, logoUrl } = req.body;

    requireFields(req.body, ["name"]);

    const result = await db.run(
      "INSERT INTO teams (name, logoUrl) VALUES (?, ?)",
      [name, logoUrl]
    );

    const newTeam = { id: result.lastID, name, logoUrl };

    // Log dans la table events
    await db.run(
      "INSERT INTO events (type, payload) VALUES (?, ?)",
      ["TEAM_CREATED", JSON.stringify(newTeam)]
    );

    res.status(201).json(newTeam);
  } catch (err) {
    // Erreur d'unicité (nom déjà utilisé)
    if (err.message && err.message.includes("UNIQUE")) {
      err.status = 400;
      err.message = "Team name already exists";
    }
    next(err);
  }
});

export default router;
