const loginScreen = document.getElementById('loginScreen');
const panelScreen = document.getElementById('panelScreen');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginErr = document.getElementById('loginErr');
const playersList = document.getElementById('playersList');
const logoutBtn = document.getElementById('logoutBtn');

async function checkAuth() {
  const res = await fetch('/api/admin/me');
  const data = await res.json();
  if (data.admin) showPanel();
  else showLogin();
}

function showLogin() {
  loginScreen.style.display = 'block';
  panelScreen.style.display = 'none';
}

function showPanel() {
  loginScreen.style.display = 'none';
  panelScreen.style.display = 'block';
  loadPlayers();
}

loginBtn.onclick = async () => {
  loginErr.textContent = '';
  const password = passwordInput.value;
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (res.ok) {
    passwordInput.value = '';
    showPanel();
  } else {
    loginErr.textContent = 'Неверный пароль';
  }
};

passwordInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') loginBtn.click();
});

logoutBtn.onclick = async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  showLogin();
};

async function loadPlayers() {
  try {
    const res = await fetch('/api/admin/players');
    if (res.status === 401) return showLogin();
    const data = await res.json();

    if (!data.players.length) {
      playersList.innerHTML = '<p style="color:var(--muted)">Игроков пока нет.</p>';
      return;
    }

    playersList.innerHTML = data.players.map(p => `
      <div class="player-card">
        <div class="top">
          <div class="name">${p.nickname}</div>
          <span style="font-size:.8rem;color:var(--muted)">
            <span class="status-dot ${p.online ? 'on' : ''}"></span>
            ${p.online ? 'онлайн' : 'офлайн'}
          </span>
        </div>
        <div class="info">
          Сервер: ${p.server || '—'}<br>
          Активность: ${p.lastSeenMin < 1 ? 'только что' : p.lastSeenMin + ' мин назад'}
          ${p.banned ? '<br><b style="color:#ff8a8a">Забанен</b>' : ''}
        </div>
        <textarea placeholder="Сообщение игроку…" id="msg-${p.id}"></textarea>
        <div class="actions">
          <button class="btn-send" onclick="sendMessage('${p.id}')">Отправить</button>
          <button class="${p.banned ? 'btn-unban' : 'btn-ban'}"
            onclick="toggleBan('${p.id}', ${!p.banned})">
            ${p.banned ? 'Разбанить' : 'Забанить'}
          </button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    playersList.innerHTML = `<p style="color:var(--muted)">Ошибка: ${e.message}</p>`;
  }
}

async function sendMessage(playerId) {
  const textarea = document.getElementById('msg-' + playerId);
  const text = textarea.value.trim();
  if (!text) return;
  const res = await fetch('/api/admin/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, text })
  });
  if (res.ok) {
    textarea.value = '';
    alert('Сообщение отправлено');
  } else {
    alert('Ошибка отправки');
  }
}

async function toggleBan(playerId, banned) {
  const res = await fetch('/api/admin/ban', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, banned })
  });
  if (res.ok) loadPlayers();
}

// Обновление списка каждые 15 секунд
setInterval(() => {
  if (panelScreen.style.display !== 'none') loadPlayers();
}, 15000);

checkAuth();