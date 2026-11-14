(() => {
  const list = document.getElementById('list');
  const ICON = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    url: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    bookmark: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  function render({ items, sel }) {
    list.textContent = '';
    items.forEach((it, i) => {
      const row = document.createElement('div');
      row.className = 'row' + (i === sel ? ' sel' : '');
      row.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[it.kind] || ICON.url}</svg>`;
      const t = document.createElement('span'); t.className = 't'; t.textContent = it.main;
      row.append(t);
      if (it.sub) { const u = document.createElement('span'); u.className = 'u'; u.textContent = it.sub; row.append(u); }
      row.addEventListener('mousedown', (e) => { e.preventDefault(); window.gxo.pick(i); });
      list.append(row);
    });
  }
  window.gxo.onItems(render);
  window.gxo.ready();
})();
