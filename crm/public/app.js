/* app.js — интерфейс админки. Без фреймворка и без сборки: экранов пять,
   состояние одно, перерисовка целиком. React здесь дал бы сборку, зависимости
   и ещё один шаг деплоя ради трёх таблиц. */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const el = (h) => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstElementChild; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const root = $('#root');

const S = {
  stats: null, facets: null, me: null, rows: [], total: 0, page: 1,
  filter: { q: '', status: '', verdict: '', need: '', cat: '', city: '', checked: '', contact: '' },
  sort: 'priority', open: null, check: null, busy: false,
};

function toast(msg) {
  const t = el(`<div class="toast">${esc(msg)}</div>`);
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

async function api(path, opts = {}) {
  const r = await fetch(path, { headers: { 'content-type': 'application/json' }, ...opts });
  if (r.status === 401) { renderLogin(); throw new Error('нужен вход'); }
  const ct = r.headers.get('content-type') || '';
  const data = ct.includes('json') ? await r.json() : await r.text();
  if (!r.ok) throw new Error(data.error || 'ошибка запроса');
  return data;
}

const qs = () => new URLSearchParams(
  Object.entries(S.filter).filter(([, v]) => v).concat([['sort', S.sort]])).toString();

/* ─────────────────────────── вход ─────────────────────────── */

async function renderLogin(err) {
  let m = { password: true, yandex: false };
  try { m = await (await fetch('/api/auth-methods')).json(); } catch { /* сервер не ответил */ }

  root.innerHTML = `<div class="login">
    <h1>База компаний</h1>
    <p>Сессия живёт 30 дней.</p>
    ${m.yandex ? `<a class="btn btn-accent ya" href="/auth/yandex">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#fc3f1d"/>
      <path d="M13.3 18.6h2.1V5.4h-3c-3 0-4.6 1.6-4.6 3.9 0 1.9.9 3 2.5 4.1l-2.8 5.2h2.3l3.1-5.8-1.1-.7c-1.3-.9-1.9-1.6-1.9-3 0-1.2.8-2 2.4-2h1v11.5z" fill="#fff"/></svg>
      Войти через Яндекс</a>` : ''}
    ${m.yandex && m.password ? '<div class="or">или</div>' : ''}
    ${m.password ? `<input id="pw" type="password" placeholder="пароль" autofocus>
      <button class="btn" id="go" style="width:100%;margin-top:10px">Войти по паролю</button>` : ''}
    ${err ? `<div class="err">${esc(err)}</div>` : ''}
  </div>`;

  if (!m.password) return;
  const go = async () => {
    try {
      await api('/api/login', { method: 'POST', body: JSON.stringify({ password: $('#pw').value }) });
      boot();
    } catch (e) { renderLogin(e.message); }
  };
  $('#go').onclick = go;
  $('#pw').onkeydown = (e) => { if (e.key === 'Enter') go(); };
}

/* ─────────────────────────── данные ─────────────────────────── */

async function load() {
  const [stats, data] = await Promise.all([
    api('/api/stats'),
    api('/api/companies?' + qs() + '&page=' + S.page + '&limit=50'),
  ]);
  S.stats = stats; S.rows = data.rows; S.total = data.total;
  render();
}

async function boot() {
  S.me = await api('/api/me').catch(() => null);
  S.facets = await api('/api/facets');
  await load();
  pollCheck();
}

async function pollCheck() {
  try {
    const st = await api('/api/check');
    const was = S.check?.running;
    S.check = st;
    if (st.running) { renderProgress(); setTimeout(pollCheck, 1500); }
    else if (was) { closeModal(); toast('Проверка завершена'); load(); }
  } catch { /* не вошли — опрос не нужен */ }
}

/* ─────────────────────────── экран ─────────────────────────── */

function render() {
  const st = S.stats;
  const opt = (v, label, cur) => `<option value="${esc(v)}"${cur === v ? ' selected' : ''}>${esc(label)}</option>`;
  const f = S.filter;

  root.innerHTML = `
  <div class="top">
    <h1>База компаний</h1>
    <span class="stat">всего <b>${st.total}</b> · проверено <b>${st.checked}</b></span>
    <span class="spacer"></span>
    ${S.me ? `<span class="stat" title="вы вошли как">${esc(S.me.email)}</span>` : ''}
    <button class="btn" id="imp">Импорт</button>
    <button class="btn" id="chk">Проверить</button>
    <a class="btn" href="/api/export.csv?${qs()}">Экспорт CSV</a>
    <button class="btn btn-sm" id="out">Выйти</button>
  </div>
  <div class="wrap">
    <div class="panel side">
      <h3>Поиск</h3>
      <input id="q" placeholder="название, домен, телефон" value="${esc(f.q)}">
      <h3>Статус работы</h3>
      <select id="status">${opt('', 'любой', f.status)}
        ${Object.entries(st.labels.status).map(([k, v]) => opt(k, `${v} (${st.byStatus[k] || 0})`, f.status)).join('')}</select>
      <h3>Состояние сайта</h3>
      <select id="verdict">${opt('', 'любое', f.verdict)}
        ${Object.entries(st.labels.verdict).map(([k, v]) => opt(k, `${v} (${st.byVerdict[k] || 0})`, f.verdict)).join('')}</select>
      <h3>Что предлагать</h3>
      <select id="need">${opt('', 'любое', f.need)}
        ${Object.entries(st.labels.service).map(([k, v]) => opt(k, `${v.name} (${st.byNeed[k] || 0})`, f.need)).join('')}</select>
      <h3>Ниша</h3>
      <select id="cat">${opt('', 'любая', f.cat)}
        ${S.facets.categories.map((c) => opt(c.k, `${c.k} (${c.n})`, f.cat)).join('')}</select>
      <h3>Город</h3>
      <select id="city">${opt('', 'любой', f.city)}
        ${S.facets.cities.map((c) => opt(c.k, `${c.k} (${c.n})`, f.city)).join('')}</select>
      <h3>Проверка</h3>
      <select id="checked">${opt('', 'все', f.checked)}${opt('yes', 'проверенные', f.checked)}${opt('no', 'не проверенные', f.checked)}</select>
      <h3>Контакты</h3>
      <select id="contact">${opt('', 'не важно', f.contact)}${opt('any', 'есть хоть какой-то', f.contact)}
        ${opt('mobile', 'есть мобильный', f.contact)}${opt('email', 'есть почта', f.contact)}</select>
      <button class="btn btn-sm" id="reset" style="width:100%;margin-top:14px">Сбросить фильтры</button>
    </div>

    <div class="panel">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <b>${S.total}</b> <span class="muted">компаний по фильтру</span>
        <span class="spacer"></span>
        <span class="muted">сортировка:</span>
        <select id="sort" style="width:auto">
          ${opt('priority', 'по приоритету', S.sort)}${opt('name', 'по названию', S.sort)}${opt('checked', 'по дате проверки', S.sort)}
        </select>
      </div>
      ${S.rows.length ? `<table><thead><tr>
        <th style="width:52px">Балл</th><th>Компания</th><th>Сайт</th><th>Повод для разговора</th><th style="width:110px">Статус</th>
      </tr></thead><tbody>${S.rows.map(rowHtml).join('')}</tbody></table>` : '<p class="muted">Ничего не найдено. Снимите часть фильтров или импортируйте файл.</p>'}
      <div class="pager">
        <button class="btn btn-sm" id="prev" ${S.page <= 1 ? 'disabled' : ''}>← назад</button>
        <span>стр. ${S.page} из ${Math.max(1, Math.ceil(S.total / 50))}</span>
        <button class="btn btn-sm" id="next" ${S.page * 50 >= S.total ? 'disabled' : ''}>вперёд →</button>
      </div>
    </div>
  </div>`;

  for (const k of Object.keys(S.filter)) {
    const node = $('#' + k);
    if (!node) continue;
    const ev = node.tagName === 'SELECT' ? 'change' : 'input';
    let timer;
    node.addEventListener(ev, () => {
      clearTimeout(timer);
      timer = setTimeout(() => { S.filter[k] = node.value; S.page = 1; load(); }, ev === 'input' ? 350 : 0);
    });
  }
  $('#sort').onchange = (e) => { S.sort = e.target.value; load(); };
  $('#reset').onclick = () => { S.filter = { q: '', status: '', verdict: '', need: '', cat: '', city: '', checked: '', contact: '' }; S.page = 1; load(); };
  $('#prev').onclick = () => { S.page--; load(); };
  $('#next').onclick = () => { S.page++; load(); };
  $('#imp').onclick = renderImport;
  $('#chk').onclick = startCheck;
  $('#out').onclick = async () => { await api('/api/logout', { method: 'POST' }); renderLogin(); };
  root.querySelectorAll('tr.row').forEach((tr) => { tr.onclick = () => openCard(tr.dataset.id); });
  if (S.filter.q) { const i = $('#q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
}

function rowHtml(c) {
  const vl = S.stats.labels.verdict;
  const bad = ['dns_dead', 'http_dead', 'parked', 'http_error', 'no_site'];
  const vt = c.verdict
    ? `<span class="tag ${bad.includes(c.verdict) ? 'bad' : 'ok'}">${esc(vl[c.verdict])}</span>`
    : '<span class="tag">не проверен</span>';
  return `<tr class="row" data-id="${c.id}">
    <td class="pri">${c.priority || ''}</td>
    <td><div class="nm">${esc(c.name)}</div><div class="sub">${esc((c.categories || [])[0] || '')}</div></td>
    <td>${c.site ? `<a href="https://${esc(c.site)}" target="_blank" rel="noopener">${esc(c.site)}</a>` : '<span class="muted">—</span>'}<div>${vt}</div></td>
    <td class="hook">${esc(c.hook)}<div>${(c.needs || []).map((n) => `<span class="tag ok">${esc(S.stats.labels.service[n].name)}</span>`).join('')}</div></td>
    <td><span class="tag">${esc(S.stats.labels.status[c.status])}</span></td>
  </tr>`;
}

/* ─────────────────────────── карточка ─────────────────────────── */

async function openCard(id) {
  const c = await api('/api/company/' + id);
  const vl = S.stats.labels.verdict, sl = S.stats.labels.status;
  const t = c.check?.tech || {};
  const yesno = (v) => v ? '<span class="tag ok">есть</span>' : '<span class="tag bad">нет</span>';
  const ovl = el(`<div class="ovl"><div class="card">
    <div style="display:flex;gap:10px;align-items:flex-start">
      <div><h2>${esc(c.name)}</h2><div class="muted">${esc(c.city)}${c.address ? ' · ' + esc(c.address) : ''}</div></div>
      <span class="spacer"></span><button class="btn btn-sm" id="x">Закрыть</button>
    </div>

    <dl class="kv">
      <dt>Телефоны</dt><dd>${(c.phones || []).map((p) => `<a href="tel:+${p}">+${p}</a>`).join(', ') || '—'}</dd>
      <dt>Мобильные</dt><dd>${(c.mobiles || []).map((p) => `<a href="tel:+${p}">+${p}</a>`).join(', ') || '—'}</dd>
      <dt>Почта</dt><dd>${(c.emails || []).map((e) => `<a href="mailto:${esc(e)}">${esc(e)}</a>`).join(', ') || '—'}</dd>
      <dt>Сайт</dt><dd>${c.site ? `<a href="https://${esc(c.site)}" target="_blank" rel="noopener">${esc(c.site)}</a>` : '—'}</dd>
      <dt>Ниша</dt><dd>${esc((c.categories || []).join(', ')) || '—'}</dd>
      <dt>Источник</dt><dd>${esc((c.sources || [c.source]).join(', '))}</dd>
    </dl>

    ${c.check ? `<div class="panel" style="margin:14px 0">
      <b>Проверка ${new Date(c.check.at).toLocaleDateString('ru')}</b>
      <div style="margin:8px 0">${esc(vl[c.check.verdict])}${c.check.new_domain ? ' → <b>' + esc(c.check.new_domain) + '</b>' : ''}</div>
      ${c.check.title ? `<div class="muted">«${esc(c.check.title)}»</div>` : ''}
      ${c.check.verdict === 'live' || c.check.verdict === 'moved' ? `<dl class="kv">
        <dt>Яндекс.Метрика</dt><dd>${yesno(t.metrika)}</dd>
        <dt>Google Analytics</dt><dd>${yesno(t.ga)}</dd>
        <dt>Движок</dt><dd>${esc(t.cms) || '<span class="muted">не определён</span>'}</dd>
        <dt>Адаптив</dt><dd>${yesno(t.viewport)}</dd>
        <dt>Форма заявки</dt><dd>${yesno(t.form)}</dd>
        <dt>Онлайн-чат</dt><dd>${yesno(t.chat)}</dd>
        ${t.year ? `<dt>Копирайт</dt><dd>${t.year}</dd>` : ''}
      </dl>` : ''}
    </div>` : '<p class="muted">Не проверена. Запустите проверку — появится повод для разговора.</p>'}

    ${c.score?.reasons?.length ? `<div class="fld"><label>Что нашли</label>
      <ul style="margin:0;padding-left:18px">${c.score.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>` : ''}

    <div class="fld"><label>Статус</label>
      <select id="st">${Object.entries(sl).map(([k, v]) => `<option value="${k}"${c.status === k ? ' selected' : ''}>${esc(v)}</option>`).join('')}</select></div>
    <div class="fld"><label>Заметка</label><textarea id="note">${esc(c.note)}</textarea></div>
    <button class="btn btn-accent" id="save">Сохранить</button>

    <div class="fld" style="margin-top:22px"><label>Добавить касание</label>
      <input id="tx" placeholder="позвонил, не берёт трубку / отправил КП">
      <button class="btn btn-sm" id="addt" style="margin-top:8px">Записать</button></div>
    ${(c.touches || []).map((t2) => `<div class="touch">${esc(t2.text)}<i>${new Date(t2.at).toLocaleString('ru')}</i></div>`).join('')}
  </div></div>`);
  document.body.appendChild(ovl);
  const close = () => ovl.remove();
  $('#x', ovl).onclick = close;
  ovl.onclick = (e) => { if (e.target === ovl) close(); };
  $('#save', ovl).onclick = async () => {
    await api('/api/company/' + id, { method: 'PATCH', body: JSON.stringify({ status: $('#st', ovl).value, note: $('#note', ovl).value }) });
    close(); toast('Сохранено'); load();
  };
  $('#addt', ovl).onclick = async () => {
    const text = $('#tx', ovl).value.trim();
    if (!text) return;
    await api('/api/company/' + id + '/touch', { method: 'POST', body: JSON.stringify({ text }) });
    close(); openCard(id);
  };
}

/* ─────────────────────────── импорт ─────────────────────────── */

function closeModal() { document.querySelector('.modal')?.remove(); }

function renderImport() {
  const m = el(`<div class="modal"><div class="box">
    <h2 style="margin:0 0 6px;font-size:18px">Импорт базы</h2>
    <p class="muted">CSV или XLSX. Старый .xls — пересохраните в Excel как .xlsx.
      Колонки распознаются по шапке, дубли сливаются с тем, что уже есть.</p>
    <input type="file" id="file" accept=".csv,.xlsx,.txt" style="margin:12px 0">
    <div class="fld"><label>Название источника (попадёт в карточку)</label>
      <input id="src" placeholder="справочник Твери 2018"></div>
    <div id="prev"></div>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn btn-accent" id="go">Загрузить</button>
      <button class="btn" id="cancel">Отмена</button>
    </div></div></div>`);
  document.body.appendChild(m);
  $('#cancel', m).onclick = closeModal;

  $('#file', m).onchange = async () => {
    const f = $('#file', m).files[0];
    if (!f) return;
    if (!$('#src', m).value) $('#src', m).value = f.name.replace(/\.[^.]+$/, '');
    try {
      const r = await api(`/api/import?dry=1&name=${encodeURIComponent(f.name)}`, { method: 'POST', body: await f.arrayBuffer() });
      $('#prev', m).innerHTML = `<div class="panel"><b>${r.rowsTotal} строк</b>
        <div class="muted" style="margin-top:6px">Распознаны колонки: ${Object.keys(r.map).join(', ') || '—'}</div>
        <div class="muted">Шапка: ${esc((r.header || []).join(' · '))}</div></div>`;
    } catch (e) { $('#prev', m).innerHTML = `<div class="err">${esc(e.message)}</div>`; }
  };

  $('#go', m).onclick = async () => {
    const f = $('#file', m).files[0];
    if (!f) return toast('Выберите файл');
    $('#go', m).disabled = true;
    $('#go', m).textContent = 'Загружаю…';
    try {
      const r = await api(`/api/import?name=${encodeURIComponent(f.name)}&source=${encodeURIComponent($('#src', m).value || f.name)}`,
        { method: 'POST', body: await f.arrayBuffer() });
      closeModal();
      toast(`Добавлено ${r.added}, слито ${r.merged}, пропущено ${r.skipped}`);
      load();
    } catch (e) {
      $('#prev', m).innerHTML = `<div class="err">${esc(e.message)}</div>`;
      $('#go', m).disabled = false;
      $('#go', m).textContent = 'Загрузить';
    }
  };
}

/* ─────────────────────────── проверка ─────────────────────────── */

async function startCheck() {
  const m = el(`<div class="modal"><div class="box">
    <h2 style="margin:0 0 6px;font-size:18px">Проверка сайтов</h2>
    <p class="muted">Проверим компании, попавшие под текущий фильтр: жив ли домен,
      куда он ведёт и что стоит на сайте. По результату проставим приоритет и повод для разговора.</p>
    <div class="fld"><label>Сколько проверить за раз</label>
      <select id="lim"><option value="100">100 — посмотреть, как идёт</option>
        <option value="500">500</option><option value="2000">2000</option><option value="">все по фильтру</option></select></div>
    <label style="display:flex;gap:8px;align-items:center;margin:10px 0">
      <input type="checkbox" id="onlynew" checked style="width:auto"> только те, что ещё не проверяли</label>
    <p class="muted">Идёт примерно 4–6 компаний в секунду. Можно закрыть окно — проверка не прервётся.</p>
    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn btn-accent" id="go">Запустить</button>
      <button class="btn" id="cancel">Отмена</button></div></div></div>`);
  document.body.appendChild(m);
  $('#cancel', m).onclick = closeModal;
  $('#go', m).onclick = async () => {
    try {
      const r = await api('/api/check', {
        method: 'POST',
        body: JSON.stringify({ filter: qs(), limit: $('#lim', m).value || undefined, onlyNew: $('#onlynew', m).checked }),
      });
      toast(`Проверяем ${r.started}`);
      pollCheck();
    } catch (e) { $('#go', m).insertAdjacentHTML('afterend', `<div class="err">${esc(e.message)}</div>`); }
  };
}

function renderProgress() {
  const st = S.check;
  let m = document.querySelector('.modal');
  if (!m || !m.dataset.progress) { closeModal(); m = el('<div class="modal" data-progress="1"><div class="box"></div></div>'); document.body.appendChild(m); }
  const pct = st.total ? Math.round(st.done / st.total * 100) : 0;
  $('.box', m).innerHTML = `<h2 style="margin:0 0 6px;font-size:18px">Проверка идёт</h2>
    <div class="bar"><i style="width:${pct}%"></i></div>
    <div class="muted">${st.done} из ${st.total}${st.eta != null ? ` · осталось примерно ${Math.ceil(st.eta / 60)} мин` : ''}</div>
    <div class="muted" style="margin-top:6px">сейчас: ${esc(st.current || '')}</div>
    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn" id="hide">Свернуть</button>
      <button class="btn" id="stop">Остановить</button></div>`;
  $('#hide', m).onclick = closeModal;
  $('#stop', m).onclick = async () => { await api('/api/check/stop', { method: 'POST' }); toast('Останавливаю…'); };
}

/* ─────────────────────────── старт ─────────────────────────── */

api('/api/stats').then(boot).catch(() => renderLogin());
