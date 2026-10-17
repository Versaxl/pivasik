const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.dataset.theme = savedTheme;
document.getElementById('themeBtn').onclick = () => {
  const cur = document.documentElement.dataset.theme;
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
};

// === Регистрация / пинг игрока ===
const nickModal = document.getElementById('nickModal');
const nickInput = document.getElementById('nickInput');
const nickSave = document.getElementById('nickSave');

function getNickname() {
  return localStorage.getItem('nickname');
}

async function pingPlayer(server) {
  const nickname = getNickname();
  if (!nickname) return;
  try {
    await fetch('/api/players/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, server })
    });
  } catch (e) { /* молча */ }
}

nickSave.onclick = () => {
  const nick = nickInput.value.trim();
  if (!nick) return;
  localStorage.setItem('nickname', nick);
  nickModal.style.display = 'none';
  pingPlayer(null);
};

// Первый заход — попросить ник
if (!getNickname()) {
  nickModal.style.display = 'flex';
}

// === Загрузка серверов ===
async function loadServers() {
  const grid = document.getElementById('grid');
  try {
    const res = await fetch('/api/servers');
    const data = await res.json();

    document.getElementById('totalOnline').textContent = data.total;

    grid.innerHTML = data.servers.map(s => `
      <a class="card" href="${s.url}" target="_blank" rel="noopener noreferrer"
         onclick="pingPlayer('${s.id}')">
        <h2>${s.name}${s.badge ? `<span class="badge">${s.badge}</span>` : ''}</h2>
        <p>${s.desc}</p>
        <div class="status">
          <span class="dot ${s.online > 0 ? 'on' : ''}"></span>
          <span>Онлайн: <b>${s.online}</b></span>
        </div>
      </a>`).join('');
  } catch (e) {
    grid.innerHTML = `<p style="color:var(--muted)">Не удалось загрузить серверы: ${e.message}</p>`;
  }
}

loadServers();
setInterval(loadServers, 30000);
setInterval(() => pingPlayer(null), 60000); // пинг раз в минуту
