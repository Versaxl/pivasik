const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.dataset.theme = savedTheme;
document.getElementById('themeBtn').onclick = () => {
  const cur = document.documentElement.dataset.theme;
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
};

const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.dataset.theme = savedTheme;
document.getElementById('themeBtn').onclick = () => {
  const cur = document.documentElement.dataset.theme;
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
};

// === Загрузка серверов ===
async function loadServers() {
  const grid = document.getElementById('grid');
  try {
    const res = await fetch('/api/servers');
    const data = await res.json();

    document.getElementById('totalOnline').textContent = data.total;

    grid.innerHTML = data.servers.map(s => `
      <a class="card" href="${s.url}" target="_blank" rel="noopener noreferrer">
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
