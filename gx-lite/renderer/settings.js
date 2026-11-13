(() => {
  const $ = (s) => document.querySelector(s);
  let S = {};
  function apply() {
    document.documentElement.style.setProperty('--accent', S.accent || '#3b82f6');
    $('#accent').value = S.accent || '#3b82f6';
    $('#bar').checked = !!S.showBookmarksBar;
    $('#adblock').checked = !!S.adBlock;
    $('#panelMode').value = S.panelMode || 'split';
    document.querySelectorAll('[data-app]').forEach((el) => { el.checked = !!(S.sidebarApps || {})[el.dataset.app]; });
  }
  $('#accent').addEventListener('input', (e) => window.gx.setSettings({ accent: e.target.value }));
  $('#panelMode').onchange = (e) => window.gx.setSettings({ panelMode: e.target.value });
  $('#adblock').onchange = (e) => window.gx.setSettings({ adBlock: e.target.checked });
  $('#bar').onchange = (e) => window.gx.setSettings({ showBookmarksBar: e.target.checked });
  document.querySelectorAll('[data-app]').forEach((el) => {
    el.onchange = () => window.gx.setSettings({ sidebarApps: { [el.dataset.app]: el.checked } });
  });
  $('#clear').onclick = async () => { await window.gx.clearData(); $('#msg').textContent = 'Browsing data cleared.'; };
  window.gx.onSettings((s) => { S = s; apply(); });
  window.gx.getSettings().then((s) => { S = s || {}; apply(); if (location.hash === '#sidebar') $('#sidebar').scrollIntoView(); });
})();
