(() => {
  const out = document.getElementById('out');
  const RANK = { info: 0, debug: 0, warn: 1, error: 2 };
  let lines = [], filter = 'all', stick = true;

  const pass = (l) => filter === 'all' || (filter === 'warn' ? RANK[l.level] >= 1 : RANK[l.level] >= 2);
  const time = (t) => new Date(t).toLocaleTimeString([], { hour12: false });

  function row(l) {
    const el = document.createElement('div');
    el.className = 'ln ' + l.level;
    const t = document.createElement('span'); t.className = 't'; t.textContent = time(l.t);
    const s = document.createElement('span'); s.className = 's'; s.textContent = l.src;
    const m = document.createElement('span'); m.className = 'm'; m.textContent = l.text;
    el.append(t, s, m);
    return el;
  }
  function renderAll() {
    out.textContent = '';
    const shown = lines.filter(pass);
    if (!shown.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'No messages'; out.append(e); return; }
    const frag = document.createDocumentFragment();
    shown.forEach((l) => frag.append(row(l)));
    out.append(frag);
    if (stick) out.scrollTop = out.scrollHeight;
  }
  function add(batch) {
    lines.push(...batch);
    if (lines.length > 1000) lines = lines.slice(-1000);
    if (out.querySelector('.empty')) out.textContent = '';
    const frag = document.createDocumentFragment();
    batch.filter(pass).forEach((l) => frag.append(row(l)));
    out.append(frag);
    while (out.children.length > 1000) out.firstChild.remove();
    if (stick) out.scrollTop = out.scrollHeight;
  }

  out.addEventListener('scroll', () => { stick = out.scrollTop + out.clientHeight >= out.scrollHeight - 24; });
  document.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.f;
    document.querySelectorAll('[data-f]').forEach((x) => x.classList.toggle('on', x === b));
    stick = true; renderAll();
  }));
  document.getElementById('clear').onclick = async () => { await window.gx.clearLogs(); lines = []; renderAll(); };
  document.getElementById('copy').onclick = () => navigator.clipboard.writeText(lines.filter(pass).map((l) => `${time(l.t)} [${l.src}] ${l.text}`).join('\n')).catch(() => {});

  window.gx.getLogs().then((ls) => { lines = ls || []; renderAll(); });
  window.gx.onLogs(add);
})();
