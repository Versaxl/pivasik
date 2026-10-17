const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const PLAYERS_FILE = path.join(__dirname, '..', 'data', 'players.json');

function readPlayers() {
  return JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf-8'));
}
function writePlayers(data) {
  fs.writeFileSync(PLAYERS_FILE, JSON.stringify(data, null, 2));
}

// Регистрация/обновление игрока (вызывается с фронта при заходе)
router.post('/ping', (req, res) => {
  const { nickname, server } = req.body || {};
  if (!nickname) return res.status(400).json({ error: 'nickname required' });

  const data = readPlayers();
  let player = data.players.find(p => p.nickname === nickname);

  if (!player) {
    player = {
      id: 'p' + Date.now(),
      nickname,
      discordId: null,
      lastSeen: new Date().toISOString(),
      server: server || null,
      banned: false
    };
    data.players.push(player);
  } else {
    player.lastSeen = new Date().toISOString();
    if (server) player.server = server;
  }

  writePlayers(data);
  res.json({ ok: true, player });
});

module.exports = router;