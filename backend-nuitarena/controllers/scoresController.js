// controllers/scoresController.js
const db = require('../db');

// 🔹 Récupérer l'historique récent des scores
exports.getRecentScores = (req, res, next) => {
  const sql = `
    SELECT 
      s.id,
      s.team_id AS teamId,
      t.name AS teamName,
      s.points,
      s.challenge,
      s.comment,
      s.user AS user,
      s.created_at AS time
    FROM scores s
    JOIN teams t ON t.id = s.team_id
    ORDER BY s.created_at DESC
    LIMIT 50;
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return next(err);
    }
    res.json(rows);
  });
};

// 🔹 Ajouter un nouveau score pour une équipe
exports.addScore = (req, res, next) => {
  const { teamId, points, challenge, comment } = req.body;

  if (!teamId || !points || !challenge) {
    return next(
      new Error('Missing required field(s): teamId, points, challenge')
    );
  }

  const user = 'Admin'; // plus tard tu pourras mettre l’admin connecté

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // 1) Insert dans la table scores
    const insertSql = `
      INSERT INTO scores (team_id, points, challenge, comment, user, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `;

    db.run(
      insertSql,
      [teamId, points, challenge, comment || '', user],
      function (err) {
        if (err) {
          db.run('ROLLBACK');
          return next(err);
        }

        const insertedId = this.lastID;

        // 2) Mise à jour du score total de l’équipe
        const updateSql = `
          UPDATE teams 
          SET currentScore = currentScore + ?
          WHERE id = ?
        `;

        db.run(updateSql, [points, teamId], function (err2) {
          if (err2) {
            db.run('ROLLBACK');
            return next(err2);
          }

          // 3) Renvoyer la ligne complète jointe avec l’équipe
          const selectSql = `
            SELECT 
              s.id,
              s.team_id AS teamId,
              t.name AS teamName,
              s.points,
              s.challenge,
              s.comment,
              s.user AS user,
              s.created_at AS time
            FROM scores s
            JOIN teams t ON t.id = s.team_id
            WHERE s.id = ?
          `;

          db.get(selectSql, [insertedId], (err3, row) => {
            if (err3) {
              db.run('ROLLBACK');
              return next(err3);
            }

            db.run('COMMIT');
            res.status(201).json(row);
          });
        });
      }
    );
  });
};
