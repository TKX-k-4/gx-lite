(() => {
  const $ = (s) => document.querySelector(s);
  const gx = window.gx;
  let sig = '', rows = new Map();
  const say = (t) => { $('#msg').textContent = t; setTimeout(() => { if ($('#msg').textContent === t) $('#msg').textContent = ''; }, 5000); };
  const fmt = (c) => (c.length === 6 ? c.slice(0, 3) + ' ' + c.slice(3) : c.length === 8 ? c.slice(0, 4) + ' ' + c.slice(4) : c);

  function build(items) {
    const list = $('#list');
    list.textContent = ''; rows = new Map();
    if (!items.length) { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'No accounts yet.'; list.append(e); return; }
    for (const x of items) {
      const row = document.createElement('div'); row.className = 'item';
      const main = document.createElement('div'); main.className = 'main';
      const name = document.createElement('div'); name.className = 'site'; name.textContent = x.issuer || x.account || 'Account';
      const user = document.createElement('div'); user.className = 'user'; user.textContent = x.issuer ? x.account : '';
      const code = document.createElement('div'); code.className = 'otp-code';
      const bar = document.createElement('div'); bar.className = 'otp-bar'; const fill = document.createElement('i'); bar.append(fill);
      main.append(name, user, code, bar);
      const acts = document.createElement('div'); acts.className = 'acts';
      const copy = document.createElement('button'); copy.className = 'btn small'; copy.textContent = 'Copy';
      copy.onclick = async () => { if (await gx.otpCopy(x.id)) { copy.textContent = 'Copied'; setTimeout(() => { copy.textContent = 'Copy'; }, 1500); } };
      const del = document.createElement('button'); del.className = 'btn small'; del.textContent = 'Delete';
      del.onclick = async () => { if (confirm(`Delete ${x.issuer || 'this account'}? You will need its secret key to add it again.`)) { await gx.otpRemove(x.id); tick(); } };
      acts.append(copy, del);
      row.append(main, acts); list.append(row);
      rows.set(x.id, { code, fill });
    }
  }
  async function tick() {
    const d = await gx.otpCodes();
    if (!d) return;
    $('#warn').hidden = d.available !== false;
    const s = d.items.map((x) => x.id).join(',');
    if (s !== sig) { sig = s; build(d.items); }
    for (const x of d.items) {
      const r = rows.get(x.id); if (!r) continue;
      r.code.textContent = fmt(x.code);
      r.fill.style.width = Math.max(0, Math.min(100, (x.remaining / x.period) * 100)) + '%';
    }
  }
  $('#form').onsubmit = async (e) => {
    e.preventDefault();
    const r = await gx.otpAdd({ uri: $('#uri').value.trim(), issuer: $('#issuer').value, account: $('#account').value, secret: $('#secret').value, site: $('#site').value });
    if (r && r.ok) { say('Added.'); for (const id of ['uri', 'issuer', 'account', 'secret', 'site']) $('#' + id).value = ''; tick(); }
    else say((r && r.error) || 'Could not add it.');
  };
  tick(); setInterval(tick, 1000);
})();
