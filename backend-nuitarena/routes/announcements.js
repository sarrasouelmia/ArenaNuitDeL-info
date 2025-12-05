import express from "express";
import { db } from "../db.js";

const router = express.Router();

// POST /announcements → envoyer un message global immédiatement
router.post("/", async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "")
      return res.status(400).json({ error: "Message obligatoire" });

    const sql = `
      INSERT INTO announcements (message, scheduledAt, createdAt)
      VALUES (?, NULL, datetime('now'))
    `;

    await db.run(sql, [message]);

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /announcements/schedule → programmer un message
router.post("/schedule", async (req, res, next) => {
  try {
    const { message, scheduledAt } = req.body;

    if (!message || !scheduledAt)
      return res.status(400).json({ error: "Champs requis" });

    const sql = `
      INSERT INTO announcements (message, scheduledAt, createdAt)
      VALUES (?, ?, datetime('now'))
    `;

    await db.run(sql, [message, scheduledAt]);

    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
