(() => {
  const list = document.getElementById('list');
  window.gxm.onItems(({ items, available }) => {
    list.textContent = '';
    if (!items.length) {
      const e = document.createElement('div'); e.className = 'empty';
      e.textContent = available === false ? 'Extension support did not start. Run npm install and restart.' : 'No extensions yet. Open the Chrome Web Store to add some.';
      list.append(e); return;
    }
    for (const x of items) {
      const row = document.createElement('div'); row.className = 'row';
      const ico = document.createElement(x.icon ? 'img' : 'div'); ico.className = 'ico';
      if (x.icon) ico.src = x.icon; else ico.textContent = (x.name || '?')[0].toUpperCase();
      const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = x.name;
      const sub = document.createElement('span'); sub.className = 'sub'; sub.textContent = x.hasPopup ? 'Click to open' : (x.hasOptions ? 'Runs in pages. Click for options' : 'Runs in the background');
      nm.append(sub);
      row.append(ico, nm);
      if (x.hasPopup && x.hasOptions) {
        const o = document.createElement('button'); o.className = 'opt'; o.textContent = 'Options';
        o.onmousedown = (e) => { e.preventDefault(); e.stopPropagation(); window.gxm.pick('options', x.id); };
        row.append(o);
      }
      row.onmousedown = (e) => { e.preventDefault(); if (x.hasPopup) window.gxm.pick('popup', x.id); else if (x.hasOptions) window.gxm.pick('options', x.id); };
      list.append(row);
    }
  });
  document.getElementById('manage').onmousedown = (e) => { e.preventDefault(); window.gxm.pick('manage'); };
  document.getElementById('store').onmousedown = (e) => { e.preventDefault(); window.gxm.pick('store'); };
  window.gxm.ready();
})();
