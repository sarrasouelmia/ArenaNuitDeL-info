// URL de ton backend Node
export const API_URL = "http://localhost:3001";

// ---- Leaderboard ----
export async function fetchLeaderboard() {
  const res = await fetch(`${API_URL}/leaderboard`);
  if (!res.ok) throw new Error("Erreur leaderboard");
  return res.json();
}

// ---- Équipes ----
export async function fetchTeams() {
  const res = await fetch(`${API_URL}/teams`);
  if (!res.ok) throw new Error("Erreur teams");
  return res.json();
}

export async function createTeam(data, adminToken) {
  const res = await fetch(`${API_URL}/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(adminToken ? { "x-admin-token": adminToken } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur création équipe");
  return res.json();
}

// ---- Scores ----
export async function addScore(data, adminToken) {
  const res = await fetch(`${API_URL}/scores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(adminToken ? { "x-admin-token": adminToken } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur ajout score");
  return res.json();
}

// ---- Annonces ----
export async function fetchAnnouncements() {
  const res = await fetch(`${API_URL}/announcements`);
  if (!res.ok) throw new Error("Erreur annonces");
  return res.json();
}

export async function createAnnouncement(data, adminToken) {
  const res = await fetch(`${API_URL}/announcements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(adminToken ? { "x-admin-token": adminToken } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur création annonce");
  return res.json();
}

// ---- Événements ----
export async function fetchEvents() {
  const res = await fetch(`${API_URL}/events`);
  if (!res.ok) throw new Error("Erreur events");
  return res.json();
}
