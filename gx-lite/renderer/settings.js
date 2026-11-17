(() => {
  const $ = (s) => document.querySelector(s);
  let S = {};
  function apply() {
    document.documentElement.style.setProperty('--accent', S.accent || '#3b82f6');
    $('#accent').value = S.accent || '#3b82f6';
    $('#bar').checked = !!S.showBookmarksBar;
    $('#adblock').checked = !!S.adBlock;
    $('#panelMode').value = S.panelMode || 'split';
    $('#suggest').checked = S.searchSuggest !== false;
    $('#unload').value = String(S.unloadMinutes ?? 5);
    $('#termoc').checked = S.terminalOpencode !== false;
    $('#freeze').checked = !!S.freezeTabs;
    $('#savepw').checked = S.savePasswords !== false;
    $('#fillpw').checked = S.autofillPasswords !== false;
    $('#fillprof').checked = S.autofillProfile !== false;
    $('#savehist').checked = S.saveHistory !== false;
    $('#spell').checked = S.spellcheck !== false;
    $('#lowmem').checked = !!S.lowMemory;
    $('#aiModel').value = S.aiModel || 'claude-haiku-5-5';
    document.querySelectorAll('[data-app]').forEach((el) => { el.checked = !!(S.sidebarApps || {})[el.dataset.app]; });
  }
  $('#accent').addEventListener('input', (e) => window.gx.setSettings({ accent: e.target.value }));
  $('#panelMode').onchange = (e) => window.gx.setSettings({ panelMode: e.target.value });
  $('#savepw').onchange = (e) => window.gx.setSettings({ savePasswords: e.target.checked });
  $('#fillpw').onchange = (e) => window.gx.setSettings({ autofillPasswords: e.target.checked });
  $('#fillprof').onchange = (e) => window.gx.setSettings({ autofillProfile: e.target.checked });
  $('#savehist').onchange = (e) => window.gx.setSettings({ saveHistory: e.target.checked });
  $('#open-ext').onclick = () => window.gx.openPage('extensions');
  $('#open-prof').onclick = () => window.gx.openPage('profiles');
  async function defRefresh() {
    const st = await window.gx.defaultStatus();
    if (!st) return;
    $('#def-btn').textContent = st.platform === 'win32' ? 'Open Windows default apps' : 'Make GX Lite my default browser';
    $('#def-status').textContent = !st.packaged ? 'Available in the installed app, not when started with npm start.'
      : st.platform === 'win32' ? 'Windows lets you choose the default yourself. Click the button, then pick GX Lite under Web browser.'
      : st.isDefault ? 'GX Lite is your default browser.' : 'GX Lite is not your default browser. macOS will ask you to confirm.';
  }
  $('#def-btn').onclick = async () => { const r = await window.gx.defaultSet(); if (r && r.error) $('#def-status').textContent = r.error; else await defRefresh(); };
  defRefresh();
  $('#open-auth').onclick = () => window.gx.openPage('authenticator');
  $('#open-pw').onclick = () => window.gx.openPage('passwords');
  $('#open-hist').onclick = () => window.gx.openPage('history');
  $('#freeze').onchange = (e) => window.gx.setSettings({ freezeTabs: e.target.checked });
  $('#spell').onchange = (e) => window.gx.setSettings({ spellcheck: e.target.checked });
  $('#termoc').onchange = (e) => window.gx.setSettings({ terminalOpencode: e.target.checked });
  $('#unload').onchange = (e) => window.gx.setSettings({ unloadMinutes: +e.target.value });
  $('#lowmem').onchange = (e) => window.gx.setSettings({ lowMemory: e.target.checked });
  $('#suggest').onchange = (e) => window.gx.setSettings({ searchSuggest: e.target.checked });
  $('#aiModel').onchange = (e) => window.gx.setSettings({ aiModel: e.target.value });
  async function aiRefresh() {
    const st = await window.gx.aiStatus();
    $('#ai-status').textContent = !st ? '' : st.hasKey ? 'A key is saved.' : st.canStore ? 'No key saved yet.' : 'Secure storage is not available on this computer, so a key cannot be saved.';
  }
  $('#ai-save').onclick = async () => {
    const r = await window.gx.setApiKey($('#ai-key').value);
    if (r.ok) $('#ai-key').value = '';
    await aiRefresh();
    if (!r.ok) $('#ai-status').textContent = r.error || 'Could not save the key.';
  };
  $('#ai-clear').onclick = async () => { await window.gx.clearApiKey(); await aiRefresh(); };
  aiRefresh();
  $('#adblock').onchange = (e) => window.gx.setSettings({ adBlock: e.target.checked });
  $('#bar').onchange = (e) => window.gx.setSettings({ showBookmarksBar: e.target.checked });
  document.querySelectorAll('[data-app]').forEach((el) => {
    el.onchange = () => window.gx.setSettings({ sidebarApps: { [el.dataset.app]: el.checked } });
  });
  $('#clear').onclick = async () => { await window.gx.clearData(); $('#msg').textContent = 'Browsing data cleared.'; };
  window.gx.onSettings((s) => { S = s; apply(); });
  window.gx.getSettings().then((s) => { S = s || {}; apply(); if (location.hash) { const t = document.querySelector(location.hash); if (t) t.scrollIntoView(); } });
})();
