(() => {
  const list = document.getElementById('list');
  const mb = (n) => (n >= 1073741824 ? (n / 1073741824).toFixed(2) + ' GB' : n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : n >= 1024 ? Math.round(n / 1024) + ' KB' : n + ' B');
  const mac = /Mac/i.test(navigator.platform);
  const FOLDER = '<svg viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/></svg>';
  const NEWTAB = '<svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>';
  const CLOSE = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
  const act = (a, id) => (e) => { e.preventDefault(); e.stopPropagation(); window.gxd.act(a, id); };
  const btn = (label, a, id) => { const b = document.createElement('button'); b.className = 'opt'; b.textContent = label; b.onmousedown = act(a, id); return b; };

  const ibtn = (svg, tip, a, id) => { const b = document.createElement('button'); b.className = 'ib'; b.innerHTML = svg; b.title = tip; b.setAttribute('aria-label', tip); b.onmousedown = act(a, id); return b; };
  function row(d) {
    const r = document.createElement('div'); r.className = 'row';
    const ext = (d.name.includes('.') ? d.name.split('.').pop() : 'file').slice(0, 4);
    const ico = document.createElement('div'); ico.className = 'ico'; ico.textContent = ext;
    const mid = document.createElement('div'); mid.className = 'mid';
    const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = d.name; nm.title = d.name;
    const sub = document.createElement('div'); sub.className = 'sub';
    const acts = document.createElement('div'); acts.className = 'acts';
    mid.append(nm, sub);
    if (d.state === 'progressing') {
      sub.textContent = d.paused ? `Paused, ${mb(d.received)}${d.total > 0 ? ' of ' + mb(d.total) : ''}` : d.total > 0 ? `${mb(d.received)} of ${mb(d.total)}` : `${mb(d.received)} downloaded`;
      const bar = document.createElement('div'); bar.className = 'bar' + (d.total > 0 ? '' : ' ind');
      const fill = document.createElement('i'); if (d.total > 0) fill.style.width = Math.min(100, Math.round((d.received / d.total) * 100)) + '%';
      bar.append(fill); mid.append(bar);
      acts.append(btn(d.paused ? 'Resume' : 'Pause', d.paused ? 'resume' : 'pause', d.id), btn('Cancel', 'cancel', d.id));
    } else if (d.state === 'completed') {
      if (d.missing) { sub.textContent = 'File moved or deleted'; sub.classList.add('bad'); }
      else { sub.textContent = mb(d.received || d.total || 0); nm.classList.add('link'); nm.onmousedown = act('open', d.id); acts.append(ibtn(FOLDER, mac ? 'Show in Finder' : 'Show in folder', 'show', d.id), ibtn(NEWTAB, 'Open in new tab', 'newtab', d.id)); }
      acts.append(ibtn(CLOSE, 'Remove from list', 'remove', d.id));
    } else {
      sub.textContent = d.state === 'cancelled' ? 'Canceled' : 'Failed'; sub.classList.add('bad');
      if (d.state === 'interrupted') acts.append(btn('Retry', 'retry', d.id));
      acts.append(ibtn(CLOSE, 'Remove from list', 'remove', d.id));
    }
    r.append(ico, mid, acts);
    return r;
  }

  window.gxd.onItems((items) => {
    list.textContent = '';
    if (!items.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'No downloads yet. You choose where each file is saved.'; list.append(e); return; }
    for (const d of items) list.append(row(d));
  });
  document.getElementById('folder').onmousedown = (e) => { e.preventDefault(); window.gxd.act('folder-all', 0); };
  document.getElementById('clear').onmousedown = (e) => { e.preventDefault(); window.gxd.act('clear', 0); };
  window.gxd.ready();
})();
