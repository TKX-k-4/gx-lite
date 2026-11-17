(() => {
  const $ = (s) => document.querySelector(s);
  const gx = window.gx;
  let timer = null;
  const host = (u) => { try { return new URL(u).hostname; } catch { return u; } };
  function dayLabel(t) {
    const d = new Date(t), now = new Date(), y = new Date(Date.now() - 86400000);
    const same = (a, b) => a.toDateString() === b.toDateString();
    if (same(d, now)) return 'Today';
    if (same(d, y)) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
  }
  async function load() {
    const items = await gx.histList($('#q').value, 800);
    const list = $('#list');
    list.textContent = '';
    if (!items.length) { const d = document.createElement('div'); d.className = 'empty'; d.textContent = $('#q').value ? 'No matches' : 'No history yet.'; list.append(d); return; }
    let last = '';
    for (const h of items) {
      const lab = dayLabel(h.t);
      if (lab !== last) { last = lab; const g = document.createElement('div'); g.className = 'day'; g.textContent = lab; list.append(g); }
      const row = document.createElement('div'); row.className = 'item hist';
      const time = document.createElement('span'); time.className = 'time'; time.textContent = new Date(h.t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const main = document.createElement('div'); main.className = 'main'; main.title = h.url;
      const title = document.createElement('div'); title.className = 'site'; title.textContent = h.title || h.url;
      const sub = document.createElement('div'); sub.className = 'user'; sub.textContent = host(h.url);
      main.append(title, sub);
      const del = document.createElement('button'); del.className = 'btn small'; del.textContent = 'Remove'; del.title = 'Remove from history';
      del.onclick = async (e) => { e.stopPropagation(); await gx.histDelete([h.url]); load(); };
      row.onclick = () => gx.openTab(h.url);
      row.append(time, main, del);
      list.append(row);
    }
  }
  $('#q').oninput = () => { clearTimeout(timer); timer = setTimeout(load, 150); };
  $('#clear').onclick = async () => {
    const label = $('#range').selectedOptions[0].text.toLowerCase();
    if (!confirm(`Clear history from: ${label}?`)) return;
    const n = await gx.histClear($('#range').value);
    $('#msg').textContent = `Removed ${n} item${n === 1 ? '' : 's'}.`;
    setTimeout(() => { $('#msg').textContent = ''; }, 3500);
    load();
  };
  window.addEventListener('focus', load);
  load();
})();
