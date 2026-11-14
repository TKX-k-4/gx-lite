(() => {
  const list = document.getElementById('list'), sum = document.getElementById('sum');
  const fmt = (mb) => (mb >= 1024 ? (mb / 1024).toFixed(2) + ' GB' : mb + ' MB');

  function render(d) {
    if (!d) return;
    sum.textContent = `Total ${fmt(d.total)}  ·  pages ${fmt(d.pages)}  ·  browser and system ${fmt(d.other)}  ·  idle tabs unload after ${d.unloadMinutes ? d.unloadMinutes + ' min' : 'never'}`;
    const rows = d.rows.slice().sort((a, b) => b.mb - a.mb);
    list.textContent = '';
    for (const r of rows) {
      const el = document.createElement('div');
      el.className = 'mem-row' + (r.loaded ? '' : ' off');
      const main = document.createElement('div'); main.className = 'mem-main';
      const n = document.createElement('div'); n.className = 'mem-name'; n.textContent = r.name + (r.active ? '  (open now)' : '');
      const s = document.createElement('div'); s.className = 'mem-sub'; s.textContent = r.sub + (r.shared ? ' · shares a process' : '');
      main.append(n, s);
      const v = document.createElement('div'); v.className = 'mem-val'; v.textContent = r.loaded ? fmt(r.mb) : 'unloaded';
      const b = document.createElement('button'); b.className = 'chip'; b.textContent = 'Unload';
      b.disabled = !r.loaded || r.active;
      b.onclick = () => { if (r.kind === 'tab') window.gx.unloadTab(r.id); else window.gx.unloadPanel(r.id); setTimeout(refresh, 250); };
      el.append(main, v, b);
      list.append(el);
    }
  }
  const refresh = () => { if (!document.hidden) window.gx.getMemory().then(render); };
  document.getElementById('all').onclick = () => { window.gx.unloadAll(); setTimeout(refresh, 300); };
  refresh();
  setInterval(refresh, 2000);
})();
