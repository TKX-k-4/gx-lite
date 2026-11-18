(() => {
  const list = document.getElementById('list');
  const mb = (n) => (n >= 1073741824 ? (n / 1073741824).toFixed(2) + ' GB' : n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : n >= 1024 ? Math.round(n / 1024) + ' KB' : n + ' B');
  const act = (a, id) => (e) => { e.preventDefault(); e.stopPropagation(); window.gxd.act(a, id); };
  const btn = (label, a, id) => { const b = document.createElement('button'); b.className = 'opt'; b.textContent = label; b.onmousedown = act(a, id); return b; };

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
      else { sub.textContent = mb(d.received || d.total || 0); nm.classList.add('link'); nm.onmousedown = act('open', d.id); acts.append(btn('Show', 'show', d.id)); }
      acts.append(btn('✕', 'remove', d.id));
    } else {
      sub.textContent = d.state === 'cancelled' ? 'Canceled' : 'Failed'; sub.classList.add('bad');
      if (d.state === 'interrupted') acts.append(btn('Retry', 'retry', d.id));
      acts.append(btn('✕', 'remove', d.id));
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
