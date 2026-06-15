const content = document.getElementById('content');
let currentTab = 'config';

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    loadTab(currentTab);
  });
});

loadTab('config');

async function loadTab(tab) {
  switch(tab) {
    case 'config': await renderConfig(); break;
    case 'commands': await renderCommands(); break;
    case 'autoreplies': await renderAutoreplies(); break;
    case 'menu': await renderMenu(); break;
    case 'broadcast': await renderBroadcast(); break;
    case 'stats': await renderStats(); break;
  }
}

// ---------- CONFIG ----------
async function renderConfig() {
  const config = await fetchJSON('/api/config');
  content.innerHTML = `
    <h2>⚙️ Konfigurasi Bot</h2>
    <form id="configForm">
      <div class="form-group">
        <label>Bot Token</label>
        <input name="botToken" value="${config.botToken || ''}" placeholder="Masukkan token dari @BotFather">
      </div>
      <div class="form-group">
        <label>Pesan Welcome (/start)</label>
        <textarea name="welcomeMessage" rows="3">${config.welcomeMessage || ''}</textarea>
      </div>
      <div class="form-group">
        <label>AI Provider</label>
        <select name="aiProvider">
          <option value="openai" ${config.aiProvider === 'openai' ? 'selected' : ''}>OpenAI</option>
          <option value="gemini" ${config.aiProvider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
          <option value="anthropic" ${config.aiProvider === 'anthropic' ? 'selected' : ''}>Anthropic</option>
        </select>
      </div>
      <div class="form-group">
        <label>AI API Key</label>
        <input name="aiApiKey" value="${config.aiApiKey || ''}" placeholder="sk-...">
      </div>
      <div class="form-group">
        <label>AI Model (opsional)</label>
        <input name="aiModel" value="${config.aiModel || ''}" placeholder="gpt-3.5-turbo">
      </div>
      <div class="form-group">
        <label><input type="checkbox" name="aiFallback" ${config.aiFallback ? 'checked' : ''}> Gunakan AI untuk pertanyaan tak dikenal</label>
      </div>
      <button type="submit">💾 Simpan & Restart Bot</button>
    </form>
    <div id="configMsg"></div>
  `;

  document.getElementById('configForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.aiFallback = formData.get('aiFallback') === 'on';
    await fetchJSON('/api/config', 'POST', data);
    showMsg('configMsg', 'Konfigurasi disimpan, bot direstart.', 'success');
  });
}

// ---------- COMMANDS ----------
async function renderCommands() {
  const commands = await fetchJSON('/api/commands');
  content.innerHTML = `
    <h2>💬 Perintah Manual</h2>
    <div id="cmdList"></div>
    <form id="addCmdForm" class="form-group">
      <input name="command" placeholder="/perintah" required>
      <input name="response" placeholder="Balasan" required>
      <button type="submit">+ Tambah</button>
    </form>
  `;
  renderCmdList(commands);

  document.getElementById('addCmdForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const newList = await fetchJSON('/api/commands', 'POST', data);
    renderCmdList(newList);
    e.target.reset();
  });
}

function renderCmdList(commands) {
  const container = document.getElementById('cmdList');
  container.innerHTML = commands.map(cmd => `
    <div class="list-item">
      <div class="info"><strong>${cmd.command}</strong> → ${cmd.response}</div>
      <div class="actions">
        <button class="danger" onclick="deleteCommand(${cmd.id})">Hapus</button>
      </div>
    </div>
  `).join('');
}

window.deleteCommand = async (id) => {
  const newList = await fetchJSON(`/api/commands/${id}`, 'DELETE');
  renderCmdList(newList);
};

// ---------- AUTOREPLIES ----------
async function renderAutoreplies() {
  const ars = await fetchJSON('/api/autoreplies');
  content.innerHTML = `
    <h2>🔄 Auto Reply</h2>
    <div id="arList"></div>
    <form id="addArForm" class="form-group">
      <input name="keyword" placeholder="Kata kunci" required>
      <input name="response" placeholder="Balasan" required>
      <button type="submit">+ Tambah</button>
    </form>
  `;
  renderArList(ars);

  document.getElementById('addArForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const newList = await fetchJSON('/api/autoreplies', 'POST', data);
    renderArList(newList);
    e.target.reset();
  });
}

function renderArList(ars) {
  document.getElementById('arList').innerHTML = ars.map(ar => `
    <div class="list-item">
      <div class="info"><strong>${ar.keyword}</strong> → ${ar.response}</div>
      <div class="actions">
        <button class="danger" onclick="deleteAr(${ar.id})">Hapus</button>
      </div>
    </div>
  `).join('');
}

window.deleteAr = async (id) => {
  const newList = await fetchJSON(`/api/autoreplies/${id}`, 'DELETE');
  renderArList(newList);
};

// ---------- MENU ----------
async function renderMenu() {
  const menu = await fetchJSON('/api/menu');
  const buttons = menu.buttons || [];
  content.innerHTML = `
    <h2>📋 Menu Tombol</h2>
    <p>Atur tombol keyboard (reply) yang muncul saat pengguna mengetik /start. Setiap tombol mengirim perintah yang telah didefinisikan di Commands.</p>
    <div id="menuEditor">
      <div id="rowsContainer"></div>
      <button id="addRowBtn">+ Tambah Baris</button>
      <button id="saveMenuBtn" class="success">💾 Simpan Menu</button>
    </div>
  `;

  const rowsContainer = document.getElementById('rowsContainer');
  function renderRows(buttons) {
    rowsContainer.innerHTML = buttons.map((row, rIdx) => `
      <div class="menu-row" data-row="${rIdx}" style="margin-bottom:10px; border:1px solid var(--border); padding:10px; border-radius:8px;">
        <strong>Baris ${rIdx+1}</strong>
        <div class="row-buttons">
          ${row.map((btn, bIdx) => `
            <div class="form-group" style="display:flex; gap:10px; align-items:center;">
              <input placeholder="Label tombol" value="${btn.text || ''}" data-row="${rIdx}" data-idx="${bIdx}" class="btn-text" style="flex:2">
              <input placeholder="/command" value="${btn.command || ''}" data-row="${rIdx}" data-idx="${bIdx}" class="btn-command" style="flex:2">
              <button class="danger remove-btn" data-row="${rIdx}" data-idx="${bIdx}">X</button>
            </div>
          `).join('')}
        </div>
        <button class="add-btn-in-row" data-row="${rIdx}">+ Tombol di baris ini</button>
      </div>
    `).join('');
  }

  renderRows(buttons);

  document.getElementById('addRowBtn').addEventListener('click', () => {
    buttons.push([{ text: '', command: '' }]);
    renderRows(buttons);
    attachEvents();
  });

  function attachEvents() {
    document.querySelectorAll('.btn-text, .btn-command').forEach(input => {
      input.addEventListener('input', (e) => {
        const r = parseInt(e.target.dataset.row);
        const i = parseInt(e.target.dataset.idx);
        const field = e.target.classList.contains('btn-text') ? 'text' : 'command';
        buttons[r][i][field] = e.target.value;
      });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const r = parseInt(e.target.dataset.row);
        const i = parseInt(e.target.dataset.idx);
        buttons[r].splice(i, 1);
        if (buttons[r].length === 0) buttons.splice(r, 1);
        renderRows(buttons);
        attachEvents();
      });
    });

    document.querySelectorAll('.add-btn-in-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const r = parseInt(e.target.dataset.row);
        buttons[r].push({ text: '', command: '' });
        renderRows(buttons);
        attachEvents();
      });
    });
  }
  attachEvents();

  document.getElementById('saveMenuBtn').addEventListener('click', async () => {
    await fetchJSON('/api/menu', 'POST', { buttons });
    showMsg('menuEditor', 'Menu disimpan!', 'success');
  });
}

// ---------- BROADCAST ----------
async function renderBroadcast() {
  content.innerHTML = `
    <h2>📢 Broadcast ke Semua Pengguna</h2>
    <div class="form-group">
      <textarea id="broadcastMsg" rows="4" placeholder="Tulis pesan..."></textarea>
    </div>
    <button id="sendBroadcastBtn">Kirim Broadcast</button>
    <div id="broadcastResult"></div>
  `;
  document.getElementById('sendBroadcastBtn').addEventListener('click', async () => {
    const msg = document.getElementById('broadcastMsg').value;
    if (!msg) return;
    const res = await fetchJSON('/api/broadcast', 'POST', { message: msg });
    document.getElementById('broadcastResult').innerHTML = `
      <div class="alert alert-success">Berhasil: ${res.success}, Gagal: ${res.fail}</div>
    `;
  });
}

// ---------- STATS ----------
async function renderStats() {
  const stats = await fetchJSON('/api/stats');
  content.innerHTML = `
    <h2>📊 Statistik Bot</h2>
    <div class="stats-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:1rem;">
      <div class="stat-card"><h3>${stats.users}</h3><p>Pengguna</p></div>
      <div class="stat-card"><h3>${stats.commands}</h3><p>Commands</p></div>
      <div class="stat-card"><h3>${stats.autoreplies}</h3><p>Auto Replies</p></div>
      <div class="stat-card"><h3>${stats.totalMessages}</h3><p>Pesan Masuk</p></div>
    </div>
  `;
}

// ===== HELPERS =====
async function fetchJSON(url, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}

function showMsg(elementId, msg, type) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  }
