const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const adminRoutes = require('./routes/admin');
const playerRoutes = require('./routes/players');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'servers.json');

app.use(express.json());
app.use(cookieParser());

const onlineCache = new Map();
const CACHE_TTL = 60 * 1000;

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

async function fetchDiscordOnline(guildId) {
  if (!guildId) return null;
  const cached = onlineCache.get(guildId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.value;
  try {
    const res = await fetch(
      `https://discord.com/api/guilds/${guildId}/widget.json`,
      { headers: { 'User-Agent': 'SummerServers/1.0' } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const online = data.presence_count ?? 0;
    onlineCache.set(guildId, { ts: Date.now(), value: online });
    return online;
  } catch (err) {
    console.warn(`Discord widget failed for ${guildId}:`, err.message);
    return null;
  }
}

app.get('/api/servers', async (req, res) => {
  const data = readData();
  const result = await Promise.all(
    data.servers.map(async (s) => {
      const discordOnline = await fetchDiscordOnline(s.discordGuildId);
      const online = discordOnline !== null ? discordOnline : (s.baseOnline || 0);
      return { ...s, online, source: discordOnline !== null ? 'discord' : 'base' };
    })
  );
  res.json({ servers: result, total: result.reduce((a, s) => a + s.online, 0) });
});

app.get('/api/news', (req, res) => res.json(readData().news));
app.get('/api/rules', (req, res) => res.json(readData().rules));

app.use('/api/players', playerRoutes);
app.use('/api/admin', adminRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'admin.html'))
);
app.get('/rules', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'rules.html'))
);
app.get('/news', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'news.html'))
);

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});