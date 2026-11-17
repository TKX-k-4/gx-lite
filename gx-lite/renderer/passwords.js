(() => {
  const $ = (s) => document.querySelector(s);
  const gx = window.gx;
  let entries = [], editId = null;
  const host = (o) => { try { return new URL(o).hostname; } catch { return o; } };
  const say = (el, t, ms = 3500) => { el.textContent = t; if (ms) setTimeout(() => { if (el.textContent === t) el.textContent = ''; }, ms); };

  function render() {
    const q = $('#q').value.toLowerCase().trim();
    const rows = entries.filter((e) => !q || (e.origin + ' ' + e.username).toLowerCase().includes(q))
      .sort((a, b) => host(a.origin).localeCompare(host(b.origin)));
    const list = $('#list');
    list.textContent = '';
    if (!rows.length) { const d = document.createElement('div'); d.className = 'empty'; d.textContent = entries.length ? 'No matches' : 'No saved passwords yet. They appear here after you sign in to a site and choose Save.'; list.append(d); return; }
    for (const e of rows) {
      const row = document.createElement('div'); row.className = 'item';
      const main = document.createElement('div'); main.className = 'main';
      const site = document.createElement('div'); site.className = 'site'; site.textContent = host(e.origin);
      const user = document.createElement('div'); user.className = 'user'; user.textContent = e.username || '(no username)';
      const pw = document.createElement('div'); pw.className = 'pw'; pw.textContent = '••••••••••';
      main.append(site, user, pw);
      const acts = document.createElement('div'); acts.className = 'acts';
      const show = btn('Show', async () => {
        if (show.dataset.on) { pw.textContent = '••••••••••'; show.textContent = 'Show'; delete show.dataset.on; return; }
        const v = await gx.pwReveal(e.id);
        if (v == null) return;
        pw.textContent = v; show.textContent = 'Hide'; show.dataset.on = '1';
        setTimeout(() => { if (show.dataset.on) { pw.textContent = '••••••••••'; show.textContent = 'Show'; delete show.dataset.on; } }, 15000);
      });
      const copy = btn('Copy', async () => { if (await gx.pwCopy(e.id)) { copy.textContent = 'Copied'; setTimeout(() => { copy.textContent = 'Copy'; }, 1500); } });
      const edit = btn('Edit', () => openForm(e));
      const del = btn('Delete', async () => { if (confirm(`Delete the saved password for ${host(e.origin)}?`)) { await gx.pwDelete(e.id); load(); } });
      acts.append(show, copy, edit, del);
      row.append(main, acts);
      list.append(row);
    }
  }
  function btn(label, fn) { const b = document.createElement('button'); b.className = 'btn small'; b.textContent = label; b.onclick = fn; return b; }

  function openForm(e) {
    editId = e ? e.id : null;
    $('#form').hidden = false;
    $('#f-url').value = e ? e.origin : '';
    $('#f-user').value = e ? e.username : '';
    $('#f-pass').value = '';
    $('#f-pass').placeholder = e ? 'Leave empty to keep the saved password' : 'Password';
    $('#f-pass').type = 'password'; $('#eye').textContent = 'Show';
    $('#f-url').focus();
  }
  $('#add').onclick = () => openForm(null);
  $('#cancel').onclick = () => { $('#form').hidden = true; };
  $('#eye').onclick = () => { const p = $('#f-pass'); const show = p.type === 'password'; p.type = show ? 'text' : 'password'; $('#eye').textContent = show ? 'Hide' : 'Show'; };
  $('#gen').onclick = async () => { $('#f-pass').value = await gx.pwGenerate(); $('#f-pass').type = 'text'; $('#eye').textContent = 'Hide'; };
  $('#form').onsubmit = async (ev) => {
    ev.preventDefault();
    const r = await gx.pwSave({ id: editId, url: $('#f-url').value.trim(), username: $('#f-user').value, password: $('#f-pass').value });
    if (r && r.ok) { $('#form').hidden = true; load(); } else say($('#form-msg'), (r && r.error) || 'Could not save');
  };

  $('#q').oninput = render;
  $('#import').onclick = () => $('#file').click();
  $('#file').onchange = async (ev) => {
    const f = ev.target.files[0]; if (!f) return;
    const n = await gx.pwImport(await f.text());
    say($('#msg'), n ? `Imported ${n} password${n === 1 ? '' : 's'}.` : 'Nothing imported. Use a CSV with url, username and password columns (the format Chrome exports).');
    ev.target.value = ''; load();
  };
  $('#export').onclick = async () => {
    const csv = await gx.pwExport();
    if (csv == null) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'gx-lite-passwords.csv';
    a.click();
    say($('#msg'), 'Exported. The file is not encrypted, so delete it once you are done.', 8000);
  };

  // addresses and info
  const FIELDS = [['first', 'First name'], ['last', 'Last name'], ['email', 'Email'], ['phone', 'Phone'], ['organization', 'Company'], ['street', 'Street address'], ['street2', 'Apartment, suite'], ['city', 'City'], ['state', 'State or region'], ['zip', 'Postal code'], ['country', 'Country']];
  const grid = $('#profile');
  for (const [k, label] of FIELDS) {
    const w = document.createElement('label'); w.className = 'fld';
    const s = document.createElement('span'); s.textContent = label;
    const i = document.createElement('input'); i.className = 'txt'; i.dataset.k = k; i.autocomplete = 'off'; i.spellcheck = false;
    w.append(s, i); grid.append(w);
  }
  $('#psave').onclick = async () => {
    const p = {}; grid.querySelectorAll('input').forEach((i) => { p[i.dataset.k] = i.value.trim(); });
    say($('#pmsg'), (await gx.profileSet(p)) ? 'Saved.' : 'Could not save.');
  };

  async function loadNever() {
    const list = await gx.pwNeverList();
    const box = $('#never'); box.textContent = '';
    if (!list.length) { const d = document.createElement('div'); d.className = 'empty'; d.textContent = 'None'; box.append(d); return; }
    for (const o of list) {
      const row = document.createElement('div'); row.className = 'item';
      const m = document.createElement('div'); m.className = 'main'; m.textContent = host(o);
      const a = document.createElement('div'); a.className = 'acts'; a.append(btn('Remove', async () => { await gx.pwNeverRemove(o); loadNever(); }));
      row.append(m, a); box.append(row);
    }
  }
  async function load() {
    const st = await gx.pwStatus();
    $('#warn').hidden = !!(st && st.available);
    entries = await gx.pwList(); render(); loadNever();
  }
  gx.profileGet().then((p) => grid.querySelectorAll('input').forEach((i) => { i.value = (p && p[i.dataset.k]) || ''; }));
  load();
})();
