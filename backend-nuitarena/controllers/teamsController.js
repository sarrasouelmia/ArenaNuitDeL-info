// backend-nuitarena/controllers/teamsController.js
import { getDb } from "../db.js";

export const getTeams = async (req, res, next) => {
  try {
    const db = getDb();
    const teams = await db.all(`
      SELECT id, name, members, score, createdAt
      FROM teams
      ORDER BY score DESC, createdAt ASC
    `);
    res.json(teams);
  } catch (err) {
    next(err);
  }
};

export const createTeam = async (req, res, next) => {
  try {
    const { name, members = 1, score = 0 } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Le nom de l'équipe est requis" });
    }

    const db = getDb();
    const result = await db.run(
      `INSERT INTO teams (name, members, score) VALUES (?, ?, ?)`,
      [name.trim(), Number(members) || 1, Number(score) || 0]
    );

    const newTeam = await db.get(
      `SELECT id, name, members, score, createdAt FROM teams WHERE id = ?`,
      [result.lastID]
    );

    res.status(201).json(newTeam);
  } catch (err) {
    next(err);
  }
};

export const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, members, score } = req.body;

    const db = getDb();

    const existing = await db.get(`SELECT * FROM teams WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ message: "Équipe introuvable" });
    }

    const newName = name ?? existing.name;
    const newMembers = members ?? existing.members;
    const newScore = score ?? existing.score;

    await db.run(
      `UPDATE teams SET name = ?, members = ?, score = ? WHERE id = ?`,
      [newName, newMembers, newScore, id]
    );

    const updated = await db.get(
      `SELECT id, name, members, score, createdAt FROM teams WHERE id = ?`,
      [id]
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDb();

    await db.run(`DELETE FROM teams WHERE id = ?`, [id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
