function tick() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleDateString('pt-BR') + ' · ' +
    now.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
}
tick(); setInterval(tick, 10000);

let todosOsMateriais = [];

async function carregarMateriais() {
  const tbody = document.getElementById('lista-materiais');
  tbody.innerHTML = '<tr><td colspan="5"><div class="spinner"></div></td></tr>';
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error();
    todosOsMateriais = await res.json();
    renderizarTabela(todosOsMateriais);
    atualizarStats(todosOsMateriais);
  } catch {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty-state">
        <div class="icon-lg">⚠️</div>
        <p>Não foi possível conectar à API.<br>Verifique a URL da MockAPI no código.</p>
      </div></td></tr>`;
  }
}

function getStatus(qtd) {
  const q = Number(qtd);
  if (q === 0) return { cls: 'zero',  label: 'Zerado' };
  if (q <= 5)  return { cls: 'baixo', label: 'Baixo' };
  return             { cls: 'ok',    label: 'OK' };
}

function getBarWidth(qtd) {
  const q = Number(qtd);
  if (q === 0) return 0;
  return Math.min(100, (q / 100) * 100);
}

function renderizarTabela(lista) {
  const tbody = document.getElementById('lista-materiais');
  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty-state">
        <div class="icon-lg">📭</div>
        <p>Nenhum material cadastrado ainda.<br>Use o formulário ao lado para começar.</p>
      </div></td></tr>`;
    return;
  }
  tbody.innerHTML = lista.map(m => {
    const st = getStatus(m.quantidade);
    const bw = getBarWidth(m.quantidade);
    return `
    <tr>
      <td><span class="item-name">${escHtml(m.nome)}</span></td>
      <td><span style="font-size:.8rem;color:var(--muted)">${escHtml(m.categoria || '—')}</span></td>
      <td>
        <div class="qty-bar-wrap">
          <span class="qty-num">${m.quantidade}</span>
          <div class="qty-bar">
            <div class="qty-bar-fill ${st.cls}" style="width:${bw}%"></div>
          </div>
        </div>
      </td>
      <td><span class="pill ${st.cls}">${st.label}</span></td>
      <td>
        <button class="btn-del" title="Remover" onclick="deletarMaterial('${m.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

function atualizarStats(lista) {
  document.getElementById('stat-total').textContent = lista.length;
  document.getElementById('stat-baixo').textContent = lista.filter(m => Number(m.quantidade) > 0 && Number(m.quantidade) <= 5).length;
  document.getElementById('stat-zero').textContent  = lista.filter(m => Number(m.quantidade) === 0).length;
}

document.getElementById('btn-cadastrar').addEventListener('click', async () => {
  const nome       = document.getElementById('input-nome').value.trim();
  const quantidade = document.getElementById('input-quantidade').value;
  const categoria  = document.getElementById('input-categoria').value;
  const msg        = document.getElementById('msg');
  const btn        = document.getElementById('btn-cadastrar');

  msg.className = 'msg';
  msg.textContent = '';

  if (!nome || quantidade === '') {
    msg.textContent = 'Preencha o nome e a quantidade.';
    msg.className = 'msg error';
    return;
  }

  btn.classList.add('loading');
  btn.textContent = 'Salvando…';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, quantidade: Number(quantidade), categoria })
    });
    if (!res.ok) throw new Error();
    document.getElementById('input-nome').value = '';
    document.getElementById('input-quantidade').value = '';
    msg.textContent = '✓ Material cadastrado com sucesso!';
    msg.className = 'msg success';
    carregarMateriais();
  } catch {
    msg.textContent = 'Erro ao salvar. Verifique a API.';
    msg.className = 'msg error';
  } finally {
    btn.classList.remove('loading');
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Cadastrar`;
  }
});

async function deletarMaterial(id) {
  if (!confirm('Remover este material do estoque?')) return;
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    carregarMateriais();
  } catch {
    alert('Erro ao remover.');
  }
}

document.getElementById('search-input').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  const filtrado = todosOsMateriais.filter(m => m.nome.toLowerCase().includes(q));
  renderizarTabela(filtrado);
});

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

carregarMateriais();
