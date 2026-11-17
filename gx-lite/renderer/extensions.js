(() => {
  const $ = (s) => document.querySelector(s);
  const gx = window.gx;
  const say = (t, ms = 6000) => { $('#msg').textContent = t; if (ms) setTimeout(() => { if ($('#msg').textContent === t) $('#msg').textContent = ''; }, ms); };
  function btn(label, fn) { const b = document.createElement('button'); b.className = 'btn small'; b.textContent = label; b.onclick = fn; return b; }

  async function load() {
    const d = await gx.extList();
    $('#warn').hidden = !!(d && d.available);
    const list = $('#list');
    list.textContent = '';
    const items = (d && d.items) || [];
    if (!items.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'No extensions installed yet.'; list.append(e); return; }
    for (const x of items) {
      const row = document.createElement('div'); row.className = 'item';
      const ico = document.createElement(x.icon ? 'img' : 'div'); ico.className = 'xicon';
      if (x.icon) ico.src = x.icon; else ico.textContent = (x.name || '?')[0].toUpperCase();
      const main = document.createElement('div'); main.className = 'main';
      const name = document.createElement('div'); name.className = 'site'; name.textContent = `${x.name}  ${x.version}`;
      const desc = document.createElement('div'); desc.className = 'user'; desc.textContent = x.description || x.id;
      main.append(name, desc);
      const acts = document.createElement('div'); acts.className = 'acts';
      if (x.popup) acts.append(btn('Popup', () => gx.extOpen(x.id, 'popup')));
      if (x.options) acts.append(btn('Options', () => gx.extOpen(x.id, 'options')));
      acts.append(btn('Remove', async () => { if (confirm(`Remove ${x.name}?`)) { await gx.extRemove(x.id); load(); } }));
      row.append(ico, main, acts);
      list.append(row);
    }
  }
  $('#store').onclick = () => gx.extStore();
  $('#install').onclick = async () => {
    say('Installing…', 0);
    const r = await gx.extInstall($('#id').value);
    if (r && r.ok) { say('Installed.'); $('#id').value = ''; load(); } else say((r && r.error) || 'Could not install it.');
  };
  window.addEventListener('focus', load);
  load();
})();
