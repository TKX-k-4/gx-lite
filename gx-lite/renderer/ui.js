(() => {
  const gx = window.gx;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ICON = {
    back: '<path d="M15 18l-6-6 6-6"/>',
    fwd: '<path d="M9 18l6-6-6-6"/>',
    reload: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    terminal: '<path d="M4 17l6-6-6-6M12 19h8"/>'
  };
  const svg = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;
  const APPS = [
    { id: 'discord', label: 'Discord', glyph: 'D', color: '#5865f2' },
    { id: 'youtube', label: 'YouTube', glyph: '▶', color: '#e5283f' },
    { id: 'wikipedia', label: 'Wikipedia', glyph: 'W', color: '#d9d9de', dark: true },
    { id: 'claude', label: 'Claude', glyph: '✺', color: '#c8683f' },
    { id: 'perplexity', label: 'Perplexity', glyph: 'P', color: '#1fa6b8' },
    { id: 'github', label: 'GitHub', glyph: 'G', color: '#2b3137', light: true }
  ];

  let S = null, mode = null, renaming = false, dragging = false, drag = null, suppressClick = false, lastChip = { gid: null, t: 0 }, lastTabId = null, tsIndex = 0, rzDrag = null;
  document.body.classList.add('plat-' + gx.platform);

  const addr = $('#addr');
  const ws = () => S.workspaces[S.activeWs];
  const cur = () => ws().tabs.find((t) => t.id === ws().activeTabId);

  // static icons
  const setIcon = (sel, n) => { $(sel).innerHTML = svg(n); };
  setIcon('#btn-newtab', 'plus'); setIcon('#btn-tabsearch', 'chevron');
  setIcon('#btn-back', 'back'); setIcon('#btn-fwd', 'fwd'); setIcon('#btn-star', 'star');
  setIcon('#btn-sbsettings', 'sliders'); setIcon('#btn-console', 'terminal'); setIcon('#btn-shield', 'shield'); setIcon('#btn-settings', 'gear');
  setIcon('#find-prev', 'back'); setIcon('#find-next', 'fwd'); setIcon('#find-close', 'x');
  $('#find-prev').firstChild.style.transform = 'rotate(90deg)';
  $('#find-next').firstChild.style.transform = 'rotate(90deg)';

  // ---------- render ----------
  function render() {
    if (!S) return;
    document.documentElement.style.setProperty('--accent', S.settings.accent);
    if (!renaming && !dragging) renderTabs();
    renderWs(); renderApps(); renderToolbar(); renderBookmarks();
    $('#btn-console').classList.toggle('active', S.activePanel === 'console');
    renderUpdate();
  }

  function renderUpdate() {
    const b = $('#btn-update'), u = S.update;
    b.hidden = !u;
    if (!u) return;
    const label = { checking: 'Checking…', none: 'Up to date', error: 'Update check failed', downloading: `Updating ${u.percent || 0}%`, ready: 'Restart to update', manual: `Update ${u.version}` };
    b.textContent = label[u.state] || '';
    b.disabled = u.state === 'downloading' || u.state === 'checking';
    b.className = ['ready', 'manual', 'downloading'].includes(u.state) ? 'hot' : '';
    b.title = u.state === 'ready' ? `Version ${u.version} is downloaded. Click to restart and install` : u.state === 'manual' ? 'Open the download page' : '';
  }
  $('#btn-update').onclick = () => { const u = S && S.update; if (u?.state === 'ready') gx.installUpdate(); else if (u?.state === 'manual') gx.openUpdate(); };

  function textOn(hex) {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 150 ? '#111' : '#fff';
  }

  function renderTabs() {
    const w = ws();
    let html = '', lastG = null;
    for (const t of w.tabs) {
      const g = t.groupId != null ? w.groups.find((x) => x.id === t.groupId) : null;
      if (t.groupId !== lastG) {
        lastG = t.groupId;
        if (g) { const n = w.tabs.filter((x) => x.groupId === g.id).length; html += `<div class="group-chip${g.collapsed ? ' collapsed' : ''}" data-g="${g.id}" style="--gc:${esc(g.color)};--gt:${textOn(g.color)}" title="Click to ${g.collapsed ? 'expand' : 'collapse'}, double-click to rename">${esc(g.name)}${g.collapsed ? `<span class="gc-n">${n}</span>` : ''}</div>`; }
      }
      if (g?.collapsed && t.id !== w.activeTabId) continue;
      const fav = t.loading ? '<span class="fav spin"></span>' : t.favicon ? `<img class="fav" src="${esc(t.favicon)}" alt="">` : '<span class="fav ph"></span>';
      html += `<div class="tab${t.id === w.activeTabId ? ' active' : ''}${t.discarded ? ' discarded' : ''}" data-id="${t.id}" data-gid="${t.groupId ?? ''}"${g ? ` style="--gc:${esc(g.color)}"` : ''} title="${esc(t.title)}">${fav}<span class="tab-title">${esc(t.title)}</span><button class="tab-close" data-close="${t.id}" title="Close tab">${svg('x')}</button></div>`;
    }
    $('#tabs').innerHTML = html;
  }

  function renderWs() {
    $('#ws').innerHTML = S.workspaces.map((w, i) =>
      `<button class="sb-btn ws-btn${i === S.activeWs ? ' active' : ''}${w.tabs.length ? ' has' : ''}" data-ws="${i}" title="${esc(w.name)}">${i + 1}</button>`).join('');
  }

  function renderApps() {
    $('#apps').innerHTML = APPS.filter((a) => S.settings.sidebarApps[a.id]).map((a) =>
      `<button class="sb-btn${S.activePanel === a.id ? ' active' : ''}" data-app="${a.id}" title="${a.label}">${S.appIcons && S.appIcons[a.id] ? `<img class="app-icon${a.light ? ' light' : ''}" src="${S.appIcons[a.id]}" alt="">` : `<span class="glyph" style="background:${a.color};${a.dark ? 'color:#222' : ''}">${a.glyph}</span>`}</button>`).join('');
  }

  function renderToolbar() {
    const t = cur();
    $('#btn-back').disabled = !t?.canGoBack;
    $('#btn-fwd').disabled = !t?.canGoForward;
    $('#btn-reload').innerHTML = svg(t?.loading ? 'x' : 'reload');
    $('#btn-reload').title = t?.loading ? 'Stop' : 'Reload';
    const switched = t?.id !== lastTabId;
    lastTabId = t?.id;
    if (switched) { setMode(null); closeFind(); }
    if (switched || document.activeElement !== addr) addr.value = t ? t.display : '';
    const blockOn = !!S.settings.adBlock, n = t?.blocked || 0;
    $('#btn-shield').classList.toggle('on', blockOn);
    $('#btn-shield').title = blockOn ? `Ad blocker on${n ? ` (${n} blocked on this page)` : ''}. Click to turn off` : 'Ad blocker off. Click to turn on';
    $('#btn-shield').innerHTML = svg('shield') + (blockOn && n ? `<i class="badge">${n > 99 ? '99+' : n}</i>` : '');
    $('#btn-star').classList.toggle('on', !!t && S.bookmarks.some((b) => b.url === t.url));
  }

  function renderBookmarks() {
    const el = $('#bookmarks');
    el.hidden = !S.settings.showBookmarksBar;
    if (el.hidden) return;
    el.innerHTML = S.bookmarks.length ? S.bookmarks.map((b) =>
      `<div class="bm" data-id="${esc(b.id)}" title="${esc(b.url)}">${b.favicon ? `<img class="fav${/github\.com/.test(b.url) ? ' light' : ''}" src="${esc(b.favicon)}" alt="">` : '<span class="fav ph"></span>'}<span>${esc(b.title)}</span></div>`).join('')
      : '<span class="bm-empty">Star a page to add it here</span>';
  }

  // ---------- tabs ----------
  $('#tabs').addEventListener('click', (e) => {
    if (suppressClick || renaming) return;
    const chip = e.target.closest('.group-chip');
    if (chip) {
      const gid = +chip.dataset.g, now = Date.now();
      gx.toggleGroup(gid);
      if (lastChip.gid === gid && now - lastChip.t < 350) {   // double-click: undo the toggle and rename
        lastChip = { gid: null, t: 0 };
        setTimeout(() => { const c2 = document.querySelector(`.group-chip[data-g="${gid}"]`); if (c2) startRename(c2); }, 120);
      } else lastChip = { gid, t: now };
      return;
    }
    const c = e.target.closest('[data-close]');
    if (c) { gx.closeTab(+c.dataset.close); return; }
    const t = e.target.closest('.tab');
    if (t) gx.activate(+t.dataset.id);
  });
  $('#tabs').addEventListener('auxclick', (e) => { if (e.button === 1) { const t = e.target.closest('.tab'); if (t) gx.closeTab(+t.dataset.id); } });
  $('#tabs').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const t = e.target.closest('.tab'), g = e.target.closest('.group-chip');
    if (t) gx.tabMenu(+t.dataset.id); else if (g) gx.groupMenu(+g.dataset.g);
  });
  $('#btn-newtab').onclick = () => gx.newTab();

  function startRename(chip) {
    const gid = +chip.dataset.g;
    const g = ws().groups.find((x) => x.id === gid);
    if (!g || renaming) return;
    renaming = true;
    chip.innerHTML = `<input value="${esc(g.name)}" maxlength="24" spellcheck="false">`;
    const inp = chip.firstChild;
    inp.focus(); inp.select();
    const done = (save) => { if (!renaming) return; renaming = false; if (save) gx.renameGroup(gid, inp.value); render(); };
    inp.onkeydown = (e) => { if (e.key === 'Enter') done(true); else if (e.key === 'Escape') done(false); e.stopPropagation(); };
    // attach blur late so the focus change from closing a native menu can't cancel the edit
    setTimeout(() => { if (renaming) inp.onblur = () => done(true); }, 200);
  }

  // ---------- drag tabs: reorder, join a group, leave a group ----------
  const GAP = 2;
  const grpOf = (el) => (!el ? null : el.dataset.g ? +el.dataset.g : el.dataset.gid ? +el.dataset.gid : null);

  $('#tabs').addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || renaming) return;
    const el = e.target.closest('.tab');
    if (!el || e.target.closest('[data-close]')) return;
    drag = { el, id: +el.dataset.id, startX: e.clientX, active: false, target: null, key: '', raf: 0, dx: 0 };
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    if (!drag.active) { if (Math.abs(dx) < 5) return; beginDrag(); }
    drag.dx = dx;
    drag.el.style.transform = `translate3d(${dx}px,0,0)`;           // follows the pointer instantly
    if (!drag.raf) drag.raf = requestAnimationFrame(() => { if (!drag) return; drag.raf = 0; layoutDrag(drag.dx); }); // heavier work once per frame
  });
  window.addEventListener('pointerup', () => endDrag(false));
  window.addEventListener('pointercancel', () => endDrag(true));
  window.addEventListener('blur', () => endDrag(true));

  function beginDrag() {
    drag.active = true; dragging = true;
    const box = $('#tabs');
    box.classList.add('drag');
    drag.els = [...box.children];
    drag.rects = drag.els.map((el) => {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      return { left: r.left, width: r.width, ml: parseFloat(cs.marginLeft) || 0, mr: parseFloat(cs.marginRight) || 0 };
    });
    drag.idx = drag.els.indexOf(drag.el);
    drag.el.classList.add('dragging');
  }

  function layoutDrag(dx) {
    const { el, els, rects, idx } = drag;
    const r = rects[idx];
    const center = r.left + dx + r.width / 2;
    const others = els.map((_, i) => i).filter((i) => i !== idx);
    const insertAt = others.filter((i) => rects[i].left + rects[i].width / 2 < center).length;
    const prevEl = els[others[insertAt - 1]], nextEl = els[others[insertAt]];

    const overI = others.find((i) => center >= rects[i].left && center < rects[i].left + rects[i].width);
    let gid;
    if (overI !== undefined) gid = els[overI].classList.contains('group-chip') ? +els[overI].dataset.g : grpOf(els[overI]);
    else { const p = grpOf(prevEl), n = grpOf(nextEl); gid = p != null && p === n ? p : null; }

    const key = insertAt + '|' + gid;
    if (key === drag.key) return;                                    // nothing changed: skip all DOM work
    drag.key = key;

    let before = null;
    for (let k = insertAt; k < others.length; k++) { const c = els[others[k]]; if (c.classList.contains('tab')) { before = +c.dataset.id; break; } }
    drag.target = { beforeId: before, gid };

    const order = others.slice(); order.splice(insertAt, 0, idx);
    let x = rects[0].left - rects[0].ml;
    for (const i of order) {
      const q = rects[i], left = x + q.ml;
      if (i !== idx) els[i].style.transform = `translate3d(${left - q.left}px,0,0)`;
      else drag.slotDx = left - q.left;
      x = left + q.width + q.mr + GAP;
    }
    const chip = gid != null ? document.querySelector(`.group-chip[data-g="${gid}"]`) : null;
    el.style.setProperty('--gc', chip ? chip.style.getPropertyValue('--gc') : 'transparent');
  }

  function endDrag(cancel) {
    if (!drag) return;
    const d = drag;
    if (d.raf) { cancelAnimationFrame(d.raf); d.raf = 0; }
    if (!d.active) { drag = null; return; }
    if (!cancel) layoutDrag(d.dx);
    drag = null;
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
    dragging = false;
    if (cancel || !d.target) { $('#tabs').classList.remove('drag'); render(); return; }
    d.el.classList.remove('dragging');
    d.el.style.transform = `translate3d(${d.slotDx || 0}px,0,0)`;   // glide into the slot; new state redraws the strip
    gx.moveTab(d.id, d.target.beforeId, d.target.gid);
    setTimeout(() => $('#tabs').classList.remove('drag'), 250);
  }

  // ---------- sidebar ----------
  $('#ws').addEventListener('click', (e) => { const b = e.target.closest('[data-ws]'); if (b) gx.switchWs(+b.dataset.ws); });
  $('#apps').addEventListener('click', (e) => { const b = e.target.closest('[data-app]'); if (b) gx.togglePanel(b.dataset.app); });
  $('#btn-settings').onclick = () => gx.openSettings('');
  $('#btn-console').onclick = () => gx.togglePanel('console');
  $('#btn-shield').onclick = () => gx.toggleAdBlock();
  $('#btn-sbsettings').onclick = () => gx.openSettings('sidebar');

  // ---------- address bar ----------
  function setMode(m) { mode = m; $('#chip').hidden = !m; addr.placeholder = m ? 'Ask Gemini…' : 'Search Google or type a URL'; }
  addr.addEventListener('focus', () => addr.select());
  addr.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      if (!mode) { if (addr.value === (cur()?.display ?? '')) addr.value = ''; setMode('gemini'); }
    } else if (e.key === 'Enter') {
      gx.go(addr.value, mode); setMode(null); addr.blur();
    } else if (e.key === 'Escape') {
      if (mode) setMode(null); else { addr.value = cur()?.display ?? ''; addr.blur(); }
    } else if (e.key === 'Backspace' && mode && addr.value === '') setMode(null);
  });
  $('#btn-back').onclick = () => gx.nav('back');
  $('#btn-fwd').onclick = () => gx.nav('forward');
  $('#btn-reload').onclick = () => gx.nav(cur()?.loading ? 'stop' : 'reload');
  $('#btn-star').onclick = () => gx.toggleBookmark();

  // ---------- bookmarks bar ----------
  $('#bookmarks').addEventListener('click', (e) => { const b = e.target.closest('.bm'); if (b) gx.openBookmark(b.dataset.id, e.metaKey || e.ctrlKey); });
  $('#bookmarks').addEventListener('auxclick', (e) => { if (e.button === 1) { const b = e.target.closest('.bm'); if (b) gx.openBookmark(b.dataset.id, true); } });
  $('#bookmarks').addEventListener('contextmenu', (e) => { e.preventDefault(); const b = e.target.closest('.bm'); if (b) gx.bookmarkMenu(b.dataset.id); });

  // ---------- find in page ----------
  const fi = $('#find-input');
  function openFind() { $('#findbar').hidden = false; fi.focus(); fi.select(); }
  function closeFind() { if ($('#findbar').hidden) return; $('#findbar').hidden = true; $('#find-count').textContent = ''; gx.findStop(); }
  fi.addEventListener('input', () => { if (!fi.value) $('#find-count').textContent = ''; gx.find({ text: fi.value, forward: true, findNext: false }); });
  fi.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') gx.find({ text: fi.value, forward: !e.shiftKey, findNext: true });
    else if (e.key === 'Escape') closeFind();
  });
  $('#find-next').onclick = () => gx.find({ text: fi.value, forward: true, findNext: true });
  $('#find-prev').onclick = () => gx.find({ text: fi.value, forward: false, findNext: true });
  $('#find-close').onclick = closeFind;
  gx.onFind((r) => { $('#find-count').textContent = fi.value ? `${r.active}/${r.total}` : ''; });

  // ---------- tab search ----------
  const tsInput = $('#ts-input');
  function tsMatches() {
    const terms = tsInput.value.toLowerCase().split(/\s+/).filter(Boolean);
    const all = S.workspaces.flatMap((w) => w.tabs.map((t) => ({ ...t, wsName: w.name })));
    return terms.length ? all.filter((t) => terms.every((q) => (t.title + ' ' + t.url).toLowerCase().includes(q))) : all;
  }
  function renderTS() {
    const m = tsMatches();
    tsIndex = Math.max(0, Math.min(tsIndex, m.length - 1));
    $('#ts-list').innerHTML = m.length ? m.map((t, i) =>
      `<div class="ts-item${i === tsIndex ? ' sel' : ''}" data-id="${t.id}">${t.favicon ? `<img class="fav" src="${esc(t.favicon)}" alt="">` : '<span class="fav ph"></span>'}<div class="ts-main"><div class="ts-title">${esc(t.title)}</div><div class="ts-url">${esc(t.display || t.url)}</div></div><span class="ts-ws">${esc(t.wsName)}</span></div>`).join('')
      : '<div class="ts-empty">No tabs match</div>';
    const sel = $('.ts-item.sel'); if (sel) sel.scrollIntoView({ block: 'nearest' });
  }
  function openTS() { $('#tabsearch').hidden = false; gx.overlay(true); tsInput.value = ''; tsIndex = 0; renderTS(); tsInput.focus(); }
  function closeTS() { if ($('#tabsearch').hidden) return; $('#tabsearch').hidden = true; gx.overlay(false); }
  function pickTS(id) { closeTS(); gx.activate(id); }
  tsInput.addEventListener('input', () => { tsIndex = 0; renderTS(); });
  tsInput.addEventListener('keydown', (e) => {
    const m = tsMatches();
    if (e.key === 'ArrowDown') { e.preventDefault(); tsIndex = Math.min(tsIndex + 1, m.length - 1); renderTS(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); tsIndex = Math.max(tsIndex - 1, 0); renderTS(); }
    else if (e.key === 'Enter' && m[tsIndex]) pickTS(m[tsIndex].id);
    else if (e.key === 'Escape') closeTS();
  });
  $('#ts-list').addEventListener('click', (e) => { const i = e.target.closest('.ts-item'); if (i) pickTS(+i.dataset.id); });
  $('#tabsearch').addEventListener('mousedown', (e) => { if (e.target.id === 'tabsearch') closeTS(); });
  $('#btn-tabsearch').onclick = openTS;

  // ---------- commands from the native menu ----------
  gx.onCmd((c, a) => {
    if (c === 'find') openFind();
    else if (c === 'tabsearch') openTS();
    else if (c === 'focus-address') { addr.focus(); addr.select(); }
    else if (c === 'rename-group') setTimeout(() => { const chip = document.querySelector(`.group-chip[data-g="${a}"]`); if (chip) startRename(chip); }, 80);
  });

  // mouse 4/5 over the browser chrome (macOS; Windows uses app-command)
  if (gx.platform === 'darwin') window.addEventListener('mouseup', (e) => { if (e.button === 3) gx.nav('back'); else if (e.button === 4) gx.nav('forward'); });

  // ---------- content area placeholder -> native view bounds ----------
  new ResizeObserver(() => {
    const r = $('#content').getBoundingClientRect();
    gx.layout({ x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) });
  }).observe($('#content'));

  gx.onState((s) => { S = s; render(); if (!$('#tabsearch').hidden) renderTS(); });
})();
