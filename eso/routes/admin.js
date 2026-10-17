const express = require('express');
const fs = require('fs');
const path = require('path');
const { requireAdmin, ADMIN_PASSWORD } = require('../middleware/auth');

const router = express.Router();
const PLAYERS_FILE = path.join(__dirname, '..', 'data', 'players.json');
const MESSAGES_FILE = path.join(__dirname, '..', 'data', 'messages.json');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Логин
router.post('/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    res.cookie('admin_token', ADMIN_PASSWORD, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 12 // 12 часов
    });
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Неверный пароль' });
});

// Логаут
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ ok: true });
});

// Проверка сессии
router.get('/me', (req, res) => {
  const ok = req.cookies && req.cookies.admin_token === ADMIN_PASSWORD;
  res.json({ admin: ok });
});

// Список игроков (только для админа)
router.get('/players', requireAdmin, (req, res) => {
  const data = readJSON(PLAYERS_FILE);
  const now = Date.now();
  const enriched = data.players.map(p => {
    const diffMin = Math.floor((now - new Date(p.lastSeen).getTime()) / 60000);
    return {
      ...p,
      online: diffMin < 10,
      lastSeenMin: diffMin
    };
  });
  res.json({ players: enriched });
});

// Отправить сообщение игроку
router.post('/message', requireAdmin, (req, res) => {
  const { playerId, text } = req.body || {};
  if (!playerId || !text) {
    return res.status(400).json({ error: 'playerId и text обязательны' });
  }
  const data = readJSON(MESSAGES_FILE);
  data.messages.push({
    id: 'm' + Date.now(),
    playerId,
    text,
    createdAt: new Date().toISOString(),
    read: false
  });
  writeJSON(MESSAGES_FILE, data);
  res.json({ ok: true });
});

// Забанить / разбанить
router.post('/ban', requireAdmin, (req, res) => {
  const { playerId, banned } = req.body || {};
  const data = readJSON(PLAYERS_FILE);
  const player = data.players.find(p => p.id === playerId);
  if (!player) return res.status(404).json({ error: 'not found' });
  player.banned = !!banned;
  writeJSON(PLAYERS_FILE, data);
  res.json({ ok: true, player });
});

module.exports = router;