(() => {
  const $ = (s) => document.querySelector(s);
  const gx = window.gx;
  let colors = [], pick = null;
  const say = (t) => { $('#msg').textContent = t; setTimeout(() => { if ($('#msg').textContent === t) $('#msg').textContent = ''; }, 4000); };

  function swatches(box, current, onPick) {
    box.textContent = '';
    for (const c of colors) {
      const s = document.createElement('button'); s.type = 'button'; s.className = 'swatch' + (c === current ? ' on' : ''); s.style.background = c; s.title = c;
      s.onclick = () => { onPick(c); swatches(box, c, onPick); };
      box.append(s);
    }
  }
  function btn(label, fn, cls = '') { const b = document.createElement('button'); b.className = 'btn small ' + cls; b.textContent = label; b.onclick = fn; return b; }

  async function load() {
    const d = await gx.profList();
    if (!d) return;
    colors = d.colors; if (!pick) pick = colors[0];
    $('#google').textContent = d.google.signedIn ? (d.google.emails.length ? 'This profile is signed in to Google as ' + d.google.emails.join(', ') + '.' : 'This profile is signed in to Google.') : 'This profile is not signed in to Google. Use the profile button next to the address bar to sign in.';
    const list = $('#list'); list.textContent = '';
    for (const p of d.profiles) {
      const row = document.createElement('div'); row.className = 'item';
      const av = document.createElement('div'); av.className = 'xicon round'; av.style.background = p.color; av.textContent = (p.name || '?')[0].toUpperCase();
      const main = document.createElement('div'); main.className = 'main';
      const name = document.createElement('input'); name.className = 'txt'; name.value = p.name; name.maxLength = 30; name.spellcheck = false;
      const sw = document.createElement('div'); sw.className = 'swatches';
      let color = p.color;
      swatches(sw, color, (c) => { color = c; av.style.background = c; });
      main.append(name, sw);
      const acts = document.createElement('div'); acts.className = 'acts';
      acts.append(btn('Save', async () => { await gx.profUpdate({ id: p.id, name: name.value, color }); say('Saved.'); load(); }));
      if (p.id !== d.current) acts.append(btn('Open', () => gx.profOpen(p.id)));
      else { const t = document.createElement('span'); t.className = 'msg'; t.textContent = 'This window'; acts.append(t); }
      if (p.id !== 'default' && p.id !== d.current) acts.append(btn('Delete', async () => { if (confirm(`Delete the profile "${p.name}" and everything saved in it? This cannot be undone.`)) { await gx.profDelete(p.id); load(); } }));
      row.append(av, main, acts);
      list.append(row);
    }
    swatches($('#colors'), pick, (c) => { pick = c; });
  }
  $('#add').onclick = async () => {
    const r = await gx.profAdd({ name: $('#name').value, color: pick });
    if (r && r.ok) { $('#name').value = ''; say('Profile added.'); load(); } else say((r && r.error) || 'Could not add it.');
  };
  window.addEventListener('focus', load);
  load();
})();
