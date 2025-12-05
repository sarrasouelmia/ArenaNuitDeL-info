export default function socketHandler(io, socket) {
  console.log("Socket connecté :", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket déconnecté");
  });

  socket.on("newScore", (data) => {
    io.emit("leaderboardUpdate", data);
  });

  socket.on("newTeam", (team) => {
    io.emit("teamCreated", team);
  });
}
