(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let S = {}, B = [];

  function apply() {
    document.body.dataset.wp = ['default', 'ocean', 'void', 'mono', 'image'].includes(S.wallpaper) ? S.wallpaper : 'default';
    document.documentElement.style.setProperty('--accent', S.accent || '#3b82f6');
    $('#bg').style.backgroundImage = S.wallpaper === 'image' && S.wallpaperImage ? `url("${S.wallpaperImage}")` : '';
    $('#clock').hidden = $('#date').hidden = !S.showClock;
    $('#dial').hidden = !S.showSpeedDial;
    document.querySelectorAll('.sw').forEach((el) => el.classList.toggle('on', el.dataset.wp === S.wallpaper));
    $('#accent').value = S.accent || '#3b82f6';
    $('#t-clock').checked = !!S.showClock; $('#t-dial').checked = !!S.showSpeedDial; $('#t-bar').checked = !!S.showBookmarksBar;
  }
  function renderDial() {
    $('#dial').innerHTML = B.map((b) =>
      `<a class="tile" href="${esc(b.url)}"><span class="ti">${b.favicon ? `<img class="${/github\.com/.test(b.url) ? 'light' : ''}" src="${esc(b.favicon)}" alt="">` : esc((b.title || '?')[0].toUpperCase())}</span><span class="n">${esc(b.title)}</span></a>`).join('');
  }
  function tick() {
    const d = new Date();
    $('#clock').textContent = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    $('#date').textContent = d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }

  $('#sf').addEventListener('submit', (e) => { e.preventDefault(); const v = $('#q').value.trim(); if (v) window.gx.search(v); });
  $('#cust-btn').onclick = () => { $('#cust').hidden = !$('#cust').hidden; };
  $('#sw').addEventListener('click', (e) => { const s = e.target.closest('.sw'); if (s) window.gx.setSettings({ wallpaper: s.dataset.wp }); });
  $('#accent').addEventListener('input', (e) => window.gx.setSettings({ accent: e.target.value }));
  $('#t-clock').onchange = (e) => window.gx.setSettings({ showClock: e.target.checked });
  $('#t-dial').onchange = (e) => window.gx.setSettings({ showSpeedDial: e.target.checked });
  $('#t-bar').onchange = (e) => window.gx.setSettings({ showBookmarksBar: e.target.checked });
  $('#upload').onclick = () => $('#file').click();
  $('#file').onchange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) { $('#msg').textContent = 'Image is over 4 MB. Choose a smaller one.'; return; }
    const r = new FileReader();
    r.onload = () => { $('#msg').textContent = ''; window.gx.setSettings({ wallpaper: 'image', wallpaperImage: r.result }); };
    r.readAsDataURL(f);
  };

  window.gx.onSettings((s) => { S = s; apply(); });
  window.gx.onBookmarks((b) => { B = b; renderDial(); });
  Promise.all([window.gx.getSettings(), window.gx.getBookmarks()]).then(([s, b]) => { S = s || {}; B = b || []; apply(); renderDial(); });
  tick(); setInterval(tick, 15000);
})();
