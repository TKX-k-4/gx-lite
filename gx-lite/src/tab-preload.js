'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// macOS has no native back/forward event for mouse buttons 4/5. Windows uses 'app-command' in main.
if (process.platform === 'darwin') {
  window.addEventListener('mouseup', (e) => {
    if (e.button === 3) { e.preventDefault(); ipcRenderer.send('nav', 'back'); }
    else if (e.button === 4) { e.preventDefault(); ipcRenderer.send('nav', 'forward'); }
  }, true);
}

// Only our own pages (new tab, settings) get an API.
if (location.protocol === 'file:' && /\/renderer\/(newtab|settings|console|terminal|memory|history|passwords|profiles|extensions|authenticator)\.html$/.test(location.pathname)) {
  contextBridge.exposeInMainWorld('gx', {
    getBookmarks: () => ipcRenderer.invoke('bookmarks:get'),
    getSettings: () => ipcRenderer.invoke('settings:get'),
    setSettings: (patch) => ipcRenderer.invoke('settings:set', patch),
    onSettings: (cb) => ipcRenderer.on('settings', (_e, s) => cb(s)),
    onBookmarks: (cb) => ipcRenderer.on('bookmarks', (_e, b) => cb(b)),
    search: (text) => ipcRenderer.send('navigate-self', text),
    openSettings: (hash) => ipcRenderer.send('open-settings', hash),
    getLogs: () => ipcRenderer.invoke('console:get'),
    onLogs: (cb) => ipcRenderer.on('console:lines', (_e, l) => cb(l)),
    clearLogs: () => ipcRenderer.invoke('console:clear'),
    profList: () => ipcRenderer.invoke('prof:list'),
    profAdd: (d) => ipcRenderer.invoke('prof:add', d),
    profUpdate: (d) => ipcRenderer.invoke('prof:update', d),
    profDelete: (id) => ipcRenderer.invoke('prof:delete', id),
    profOpen: (id) => ipcRenderer.send('prof:open', id),
    extList: () => ipcRenderer.invoke('ext:list'),
    extInstall: (i) => ipcRenderer.invoke('ext:install', i),
    extRemove: (id) => ipcRenderer.invoke('ext:remove', id),
    extOpen: (id, k) => ipcRenderer.send('ext:open', id, k),
    extStore: () => ipcRenderer.send('ext:store'),
    otpCodes: () => ipcRenderer.invoke('otp:codes'),
    otpAdd: (d) => ipcRenderer.invoke('otp:add', d),
    otpRemove: (id) => ipcRenderer.invoke('otp:remove', id),
    otpCopy: (id) => ipcRenderer.invoke('otp:copy', id),
    defaultStatus: () => ipcRenderer.invoke('default:status'),
    defaultSet: () => ipcRenderer.invoke('default:set'),
    openPage: (n) => ipcRenderer.send('open-internal', n),
    openTab: (u) => ipcRenderer.send('open-tab', u),
    pwStatus: () => ipcRenderer.invoke('pw:status'),
    pwList: () => ipcRenderer.invoke('pw:list'),
    pwSave: (d) => ipcRenderer.invoke('pw:save', d),
    pwDelete: (id) => ipcRenderer.invoke('pw:delete', id),
    pwReveal: (id) => ipcRenderer.invoke('pw:reveal', id),
    pwCopy: (id) => ipcRenderer.invoke('pw:copy', id),
    pwGenerate: () => ipcRenderer.invoke('pw:generate'),
    pwImport: (t) => ipcRenderer.invoke('pw:import', t),
    pwExport: () => ipcRenderer.invoke('pw:export'),
    pwNeverList: () => ipcRenderer.invoke('pw:never-list'),
    pwNeverRemove: (o) => ipcRenderer.invoke('pw:never-remove', o),
    profileGet: () => ipcRenderer.invoke('pw:profile-get'),
    profileSet: (p) => ipcRenderer.invoke('pw:profile-set', p),
    histList: (q, n) => ipcRenderer.invoke('hist:list', q, n),
    histDelete: (u) => ipcRenderer.invoke('hist:delete', u),
    histClear: (r) => ipcRenderer.invoke('hist:clear', r),
    getMemory: () => ipcRenderer.invoke('mem:get'),
    unloadTab: (id) => ipcRenderer.send('mem:unload', id),
    unloadPanel: (id) => ipcRenderer.send('mem:unload-panel', id),
    unloadAll: () => ipcRenderer.send('mem:unload-all'),
    closePanel: () => ipcRenderer.send('panel:close'),
    aiStatus: () => ipcRenderer.invoke('ai:status'),
    setApiKey: (k) => ipcRenderer.invoke('ai:set-key', k),
    clearApiKey: () => ipcRenderer.invoke('ai:clear-key'),
    ptyStart: (c, r) => ipcRenderer.invoke('pty:start', c, r),
    ptyWrite: (d) => ipcRenderer.send('pty:write', d),
    ptyResize: (c, r) => ipcRenderer.send('pty:resize', c, r),
    ptyKill: () => ipcRenderer.invoke('pty:kill'),
    onPtyData: (cb) => ipcRenderer.on('pty:data', (_e, d) => cb(d)),
    onPtyExit: (cb) => ipcRenderer.on('pty:exit', (_e, c) => cb(c)),
    clearData: () => ipcRenderer.invoke('data:clear')
  });
}

// ================= password and info autofill (top frame of https pages only) =================
(() => {
  const okProto = location.protocol === 'https:' || (location.protocol === 'http:' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1'));
  if (!okProto) return;

  const AC = { name: 'fullName', 'given-name': 'first', 'family-name': 'last', email: 'email', tel: 'phone', organization: 'organization', 'street-address': 'street', 'address-line1': 'street', 'address-line2': 'street2', 'address-level2': 'city', 'address-level1': 'state', 'postal-code': 'zip', country: 'country', 'country-name': 'country' };
  const HINTS = [[/e-?mail/i, 'email'], [/phone|tel|mobile/i, 'phone'], [/first.?name|given|fname/i, 'first'], [/last.?name|family|surname|lname/i, 'last'], [/zip|postal/i, 'zip'], [/city|town/i, 'city'], [/address.*(2|line2)|apt|suite|unit/i, 'street2'], [/address|street/i, 'street'], [/state|province|region/i, 'state'], [/country/i, 'country'], [/company|organi[sz]ation/i, 'organization'], [/^(full.?)?name$/i, 'fullName']];

  const vis = (el) => {
    if (!el || el.disabled || el.readOnly) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  const isOtpField = (el) => el instanceof HTMLInputElement && ['text', 'tel', 'number', 'password', ''].includes(el.type) &&
    (/one-time-code/i.test(el.autocomplete || '') ||
      (/otp|one.?time|2fa|totp|mfa|verification.?code|auth(entication)?.?code|security.?code|authenticator/i.test([el.name, el.id, el.placeholder, el.getAttribute('aria-label')].filter(Boolean).join(' ')) && (el.maxLength < 0 || el.maxLength <= 10)));
  const isUserField = (i) => i instanceof HTMLInputElement && ['text', 'email', 'tel', ''].includes(i.type);
  const profileKey = (el) => {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) return null;
    if (el instanceof HTMLInputElement && !['text', 'email', 'tel', 'search', ''].includes(el.type)) return null;
    const toks = String(el.autocomplete || '').toLowerCase().split(/\s+/);
    for (let i = toks.length - 1; i >= 0; i--) if (AC[toks[i]]) return AC[toks[i]];
    const s = [el.name, el.id, el.getAttribute('aria-label'), el.placeholder].filter(Boolean).join(' ');
    for (const [re, key] of HINTS) if (re.test(s)) return key;
    return null;
  };
  function loginModel(el) {
    const root = el.form || document;
    const inputs = [...root.querySelectorAll('input')].filter(vis);
    const passes = inputs.filter((i) => i.type === 'password');
    if (!passes.length) return null;
    let pass, user = null;
    if (el.type === 'password') {
      pass = el;
      user = inputs.slice(0, inputs.indexOf(el)).reverse().find(isUserField) || null;
    } else if (isUserField(el)) {
      user = el;
      pass = inputs.slice(inputs.indexOf(el) + 1).find((i) => i.type === 'password') || passes[0];
    } else return null;
    return { user, pass, isNew: /new-password/i.test(pass.autocomplete || '') };
  }
  function setVal(el, v) {
    const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  let ctx = null, hideTimer = null;
  const hideSoon = () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { if (!ctx || document.activeElement !== ctx.el) { ctx = null; ipcRenderer.send('autofill:hide'); } }, 250);
  };

  // Only react to real user focus, never to events a web page fakes.
  document.addEventListener('focusin', (e) => {
    if (!e.isTrusted) return;
    const el = e.target;
    if (!(el instanceof HTMLElement)) return;
    let kind = null, model = null;
    if (isOtpField(el)) kind = 'otp';
    else if (el instanceof HTMLInputElement && (el.type === 'password' || isUserField(el))) {
      model = loginModel(el);
      if (model) kind = model.isNew ? (el === model.pass ? 'new-password' : null) : 'login';
    }
    if (!kind && profileKey(el)) { kind = 'profile'; model = null; }
    if (!kind) { hideSoon(); return; }
    clearTimeout(hideTimer);
    ctx = { kind, model, el };
    const r = el.getBoundingClientRect();
    ipcRenderer.send('autofill:focus', { kind, rect: { x: r.left, y: r.top, w: r.width, h: r.height } });
  }, true);
  document.addEventListener('focusout', hideSoon, true);
  window.addEventListener('scroll', () => { if (ctx) ipcRenderer.send('autofill:hide'); }, true);
  window.addEventListener('resize', () => { if (ctx) ipcRenderer.send('autofill:hide'); });

  ipcRenderer.on('autofill:fill', (_e, d) => {
    if (!ctx || !d) return;
    const { model } = ctx;
    if (d.kind === 'login' && model) {
      if (model.user && vis(model.user)) setVal(model.user, d.username || '');
      if (model.pass && vis(model.pass)) setVal(model.pass, d.password || '');
    } else if (d.kind === 'password' && model) {
      const root = model.pass.form || document;
      [...root.querySelectorAll('input[type=password]')].filter(vis).forEach((p) => setVal(p, d.password || ''));
    } else if (d.kind === 'otp') {
      setVal(ctx.el, String(d.code || ''));
    } else if (d.kind === 'profile' && d.profile) {
      const p = d.profile;
      const vals = { fullName: [p.first, p.last].filter(Boolean).join(' '), first: p.first, last: p.last, email: p.email, phone: p.phone, organization: p.organization, street: p.street, street2: p.street2, city: p.city, state: p.state, zip: p.zip, country: p.country };
      const root = ctx.el.form || document;
      for (const f of root.querySelectorAll('input, select, textarea')) {
        if (!vis(f)) continue;
        const key = profileKey(f);
        const v = key && vals[key];
        if (!v || (f.value && f !== ctx.el)) continue;
        if (f instanceof HTMLSelectElement) {
          const opt = [...f.options].find((o) => o.value.toLowerCase() === String(v).toLowerCase() || o.text.trim().toLowerCase() === String(v).toLowerCase());
          if (opt) setVal(f, opt.value);
        } else setVal(f, v);
      }
    }
  });

  // Offer to save after a login or sign-up form is submitted.
  let lastKey = '', lastAt = 0;
  function submitFrom(root) {
    const passes = [...root.querySelectorAll('input[type=password]')].filter((p) => p.value);
    if (!passes.length) return;
    const pass = passes.find((p) => /new-password/i.test(p.autocomplete || '')) || (passes.length >= 3 ? passes[1] : passes[0]);
    const m = loginModel(pass);
    const username = (m && m.user && m.user.value) || '';
    const key = username + '\u0000' + pass.value;
    if (key === lastKey && Date.now() - lastAt < 3000) return;
    lastKey = key; lastAt = Date.now();
    ipcRenderer.send('autofill:submit', { username, password: pass.value });
  }
  document.addEventListener('submit', (e) => { if (e.target instanceof HTMLFormElement) submitFrom(e.target); }, true);
  document.addEventListener('click', (e) => {
    const b = e.target instanceof Element && e.target.closest('button, input[type=submit], input[type=button], [role=button]');
    if (b) submitFrom(b.form || b.closest('form') || document);
  }, true);
})();
