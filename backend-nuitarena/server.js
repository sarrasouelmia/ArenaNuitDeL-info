import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import "./db.js";

import teamsRoutes from "./routes/teams.js";
import scoresRoutes from "./routes/scores.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import eventsRoutes from "./routes/events.js";
import announcementsRoutes from "./routes/announcements.js";


import socketHandler from "./sockets/socketHandler.js";

const app = express();
const server = http.createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
  cors: { origin: "*" }
});

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Routes API
app.use("/teams", teamsRoutes);
app.use("/scores", scoresRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/events", eventsRoutes);
app.use("/announcements", announcementsRoutes);


// Gestion des websockets
io.on("connection", (socket) => {
  console.log("Un client est connecté :", socket.id);
  socketHandler(io, socket);
});

// Middleware d'erreur (pour centraliser les erreurs)
app.use((err, req, res, next) => {
  console.error("Erreur backend:", err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error"
  });
});

// Lancer le serveur
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🔥 Backend running on http://localhost:${PORT}`);
});
