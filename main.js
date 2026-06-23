const API_URL = 'https://6a29e629f59cb8f65f1dbc02.mockapi.io/api/V1/materiais';

function tick() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleDateString('pt-BR') + ' · ' +
    now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
tick();
setInterval(tick, 10000);

let todosOsMateriais = [];

async function carregarMateriais() {
  const tbody = document.getElementById('lista-materiais');
  tbody.innerHTML = '<tr><td colspan="8"><div class="spinner"></div></td></tr>';
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error();
    todosOsMateriais = await res.json();
    renderizarTabela(todosOsMateriais);
    atualizarStats(todosOsMateriais);
  } catch {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state">
        <div class="icon-lg">⚠️</div>
        <p>Não foi possível conectar à API.<br>Verifique a URL da MockAPI no código.</p>
      </div></td></tr>`;
  }
}

function getStatus(qtd) {
  const q = Number(qtd);
  if (q === 0)  return { cls: 'zero',  label: 'Zerado' };
  if (q <= 10)  return { cls: 'baixo', label: 'Baixo'  };
  return              { cls: 'ok',    label: 'OK'     };
}

function getBarWidth(qtd) {
  const q = Number(qtd);
  if (q === 0) return 0;
  return Math.min(100, (q / 100) * 100);
}

function getValidadeStatus(validade) {
  if (!validade) return { cls: 'sem-val', label: '—' };
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(validade + 'T00:00:00');
  const diffDias = Math.floor((venc - hoje) / (1000 * 60 * 60 * 24));

  if (diffDias < 0)   return { cls: 'vencido', label: 'Vencido' };
  if (diffDias <= 30) return { cls: 'proximo',  label: `${diffDias}d` };
  return                     { cls: 'valido',   label: formatarData(validade) };
}

function formatarData(iso) {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function renderizarTabela(lista) {
  const tbody = document.getElementById('lista-materiais');
  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="8">
      <div class="empty-state">
        <div class="icon-lg">📭</div>
        <p>Nenhum material cadastrado ainda.<br>Use o formulário ao lado para começar.</p>
      </div></td></tr>`;
    return;
  }
  tbody.innerHTML = lista.map(m => {
    const st  = getStatus(m.quantidade);
    const bw  = getBarWidth(m.quantidade);
    const val = getValidadeStatus(m.validade);
    const rowClass = val.cls === 'vencido' ? ' class="row-vencido"' : '';

    return `
    <tr${rowClass}>
      <td><span class="item-name">${escHtml(m.nome)}</span></td>
      <td><span style="font-size:.8rem;color:var(--muted)">${escHtml(m.categoria || '—')}</span></td>
      <td><span class="fornecedor-text" title="${escHtml(m.fornecedor || '')}">${escHtml(m.fornecedor || '—')}</span></td>
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
        <span class="pill ${val.cls}" title="${m.validade ? formatarData(m.validade) : ''}">${val.label}</span>
      </td>
      <td>
        <div class="retirada-wrap">
          <input
            type="number"
            class="input-retirada"
            placeholder="Qtd"
            min="1"
            max="${m.quantidade}"
            data-id="${m.id}"
          />
          <button
            class="btn-baixar"
            data-id="${m.id}"
            data-estoque="${m.quantidade}"
            title="Confirmar retirada"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Baixar
          </button>
        </div>
      </td>
      <td>
        <button class="btn-excluir" data-id="${m.id}" title="Excluir material">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.btn-baixar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id       = btn.dataset.id;
      const estoque  = Number(btn.dataset.estoque);
      const input    = btn.closest('tr').querySelector('.input-retirada');
      const retirada = Number(input.value);
      confirmarBaixa(id, estoque, retirada, input);
    });
  });

  tbody.querySelectorAll('.btn-excluir').forEach(btn => {
    btn.addEventListener('click', () => excluirMaterial(btn.dataset.id));
  });
}

function atualizarStats(lista) {
  document.getElementById('stat-total').textContent = lista.length;
  document.getElementById('stat-baixo').textContent =
    lista.filter(m => Number(m.quantidade) > 0 && Number(m.quantidade) <= 10).length;
  document.getElementById('stat-zero').textContent =
    lista.filter(m => Number(m.quantidade) === 0).length;
  document.getElementById('stat-vencido').textContent =
    lista.filter(m => {
      if (!m.validade) return false;
      const hoje = new Date(); hoje.setHours(0,0,0,0);
      return new Date(m.validade + 'T00:00:00') < hoje;
    }).length;
}

function validarRetirada(estoqueAtual, quantidadeRetirada) {
  if (!Number.isFinite(quantidadeRetirada) || quantidadeRetirada <= 0) return false;
  if (quantidadeRetirada > estoqueAtual) return false;
  return true;
}

async function confirmarBaixa(id, estoqueAtual, retirada, inputEl) {
  if (!validarRetirada(estoqueAtual, retirada)) {
    inputEl.style.borderColor = 'var(--red)';
    inputEl.focus();
    setTimeout(() => (inputEl.style.borderColor = ''), 1500);
    alert(
      retirada <= 0
        ? 'Informe uma quantidade maior que zero.'
        : `Quantidade inválida! Estoque atual: ${estoqueAtual}.`
    );
    return;
  }

  const novaQtd = estoqueAtual - retirada;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade: novaQtd })
    });
    if (!res.ok) throw new Error();
    inputEl.value = '';
    carregarMateriais();
  } catch {
    alert('Erro ao atualizar o estoque. Verifique a API.');
  }
}

async function excluirMaterial(id) {
  if (!confirm('Tem certeza que deseja excluir este material permanentemente?')) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    carregarMateriais();
  } catch {
    alert('Erro ao excluir o material.');
  }
}

function exportarCSV() {
  if (!todosOsMateriais.length) {
    alert('Nenhum material para exportar.');
    return;
  }

  const cabecalho = ['Nome', 'Categoria', 'Fornecedor', 'Quantidade', 'Status', 'Validade'];
  const linhas = todosOsMateriais.map(m => {
    const st  = getStatus(m.quantidade);
    const val = m.validade ? formatarData(m.validade) : '—';
    return [
      `"${(m.nome       || '').replace(/"/g, '""')}"`,
      `"${(m.categoria  || '').replace(/"/g, '""')}"`,
      `"${(m.fornecedor || '').replace(/"/g, '""')}"`,
      m.quantidade,
      st.label,
      val
    ].join(',');
  });

  const csv = [cabecalho.join(','), ...linhas].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  const hoje = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  a.download = `estoque_almoxarifado_${hoje}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.getElementById('btn-cadastrar').addEventListener('click', async () => {
  const nome       = document.getElementById('input-nome').value.trim();
  const quantidade = document.getElementById('input-quantidade').value;
  const categoria  = document.getElementById('input-categoria').value;
  const fornecedor = document.getElementById('input-fornecedor').value.trim();
  const validade   = document.getElementById('input-validade').value;
  const msg        = document.getElementById('msg');
  const btn        = document.getElementById('btn-cadastrar');

  msg.className   = 'msg';
  msg.textContent = '';

  if (!nome || quantidade === '') {
    msg.textContent = 'Preencha o nome e a quantidade.';
    msg.className   = 'msg error';
    return;
  }

  btn.classList.add('loading');
  btn.textContent = 'Salvando…';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        quantidade: Number(quantidade),
        categoria,
        fornecedor,
        validade
      })
    });
    if (!res.ok) throw new Error();
    document.getElementById('input-nome').value       = '';
    document.getElementById('input-quantidade').value  = '';
    document.getElementById('input-fornecedor').value  = '';
    document.getElementById('input-validade').value    = '';
    msg.textContent = '✓ Material cadastrado com sucesso!';
    msg.className   = 'msg success';
    carregarMateriais();
  } catch {
    msg.textContent = 'Erro ao salvar. Verifique a API.';
    msg.className   = 'msg error';
  } finally {
    btn.classList.remove('loading');
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Cadastrar`;
  }
});

document.getElementById('search-input').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  const filtrado = todosOsMateriais.filter(m =>
    m.nome.toLowerCase().includes(q) ||
    (m.fornecedor || '').toLowerCase().includes(q)
  );
  renderizarTabela(filtrado);
});

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

carregarMateriais();
