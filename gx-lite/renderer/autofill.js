(() => {
  const list = document.getElementById('list');
  window.gxaf.onItems((items) => {
    list.textContent = '';
    items.forEach((it, i) => {
      const row = document.createElement('div');
      row.className = 'row' + (it.type === 'manage' ? ' manage' : '');
      const t = document.createElement('div'); t.className = 't'; t.textContent = it.label;
      row.append(t);
      if (it.sub) { const s = document.createElement('div'); s.className = 's'; s.textContent = it.sub; row.append(s); }
      row.addEventListener('mousedown', (e) => { e.preventDefault(); window.gxaf.pick(i); });
      list.append(row);
    });
  });
  window.gxaf.ready();
})();
