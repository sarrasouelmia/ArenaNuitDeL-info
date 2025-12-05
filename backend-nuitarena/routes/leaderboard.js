import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const leaderboard = await db.all(`
    SELECT t.id, t.name, t.logoUrl,
           COALESCE(SUM(s.points), 0) as totalPoints
    FROM teams t
    LEFT JOIN scores s ON t.id = s.teamId
    GROUP BY t.id
    ORDER BY totalPoints DESC
  `);

  res.json(leaderboard);
});

export default router;
