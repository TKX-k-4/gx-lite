(() => {
  const $ = (id) => document.getElementById(id);
  const msgs = $('msgs'), input = $('in'), go = $('go'), cf = $('cf');
  const ICON_SEND = '<svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
  const ICON_STOP = '<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/></svg>';
  let st = { messages: [], busy: false, confirm: null, page: null, hasKey: true };
  let lastSig = '';

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  function md(t) {
    const out = []; let list = false;
    for (const line of String(t).split('\n')) {
      const m = line.match(/^\s*[-*•]\s+(.*)$/);
      if (m) { if (!list) { out.push('<ul>'); list = true; } out.push('<li>' + inline(m[1]) + '</li>'); }
      else { if (list) { out.push('</ul>'); list = false; } if (line.trim()) out.push('<p>' + inline(line) + '</p>'); }
    }
    if (list) out.push('</ul>');
    return out.join('');
  }
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const btn = (label, cls, fn) => { const b = el('button', 'btn ' + (cls || '')); b.textContent = label; b.onclick = fn; return b; };

  function renderPage() {
    const p = st.page;
    $('pg').textContent = p ? 'On this page: ' + (p.title || p.url || 'New tab') : '';
    $('pg').hidden = !p;
  }
  function render() {
    document.documentElement.style.setProperty('--accent', st.accent || '#3b82f6');
    renderPage();
    const sig = JSON.stringify([st.messages, st.busy, !!st.confirm, st.hasKey]);
    const nearBottom = msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 80;
    if (sig !== lastSig) {
      lastSig = sig;
      msgs.textContent = '';
      if (!st.messages.length) {
        const e = el('div', 'empty', '<h2>How can I help with this page?</h2><div>I can read the page, answer questions, and click buttons for you. You approve every click.</div>');
        const chips = el('div', 'chips');
        chips.append(btn('Summarize this page', '', () => window.gxa.summarize()), btn('What are the key points?', '', () => window.gxa.send('What are the key points of this page?')), btn('What can I click on this page?', '', () => window.gxa.send('List the main buttons and links I can click on this page.')));
        e.append(chips);
        if (!st.hasKey) {
          const k = el('div', 'er', 'Add your free Gemini API key to turn this on.');
          const row = el('div', 'row'); row.append(btn('Add API key', 'pri', () => window.gxa.openSettings()), btn('Use the Gemini website', '', () => window.gxa.geminiSite()));
          k.append(row); e.append(k);
        }
        msgs.append(e);
      }
      for (const m of st.messages) {
        if (m.role === 'user') msgs.append(el('div', 'u', esc(m.text)));
        else if (m.role === 'assistant') msgs.append(el('div', 'a', md(m.text) + (m.model ? `<div class="by">${esc(m.model)}</div>` : '')));
        else if (m.role === 'log') msgs.append(el('div', 'lg', esc(m.text)));
        else if (m.role === 'error') {
          const e = el('div', 'er', esc(m.text));
          if (m.needKey || m.retry) {
            const row = el('div', 'row');
            if (m.needKey) row.append(btn('Add API key', 'pri', () => window.gxa.openSettings()), btn('Use the Gemini website', '', () => window.gxa.geminiSite()));
            if (m.retry) row.append(btn('Try again', 'pri', () => window.gxa.retry()));
            e.append(row);
          }
          msgs.append(e);
        }
      }
      if (st.busy && !st.confirm) msgs.append(el('div', 'dots', '<i></i><i></i><i></i>'));
      if (nearBottom || !st.messages.length || true) msgs.scrollTop = msgs.scrollHeight;
    }
    cf.hidden = !st.confirm;
    cf.textContent = '';
    if (st.confirm) {
      const c = el('div', 'cf');
      c.append(el('div', '', `Gemini wants to click <strong>“${esc(st.confirm.label)}”</strong> (${esc(st.confirm.tag)})`));
      if (st.confirm.reason) c.append(el('div', 'd', esc(st.confirm.reason)));
      const row = el('div', 'row'); row.append(btn('Allow', 'pri', () => window.gxa.confirm(true)), btn('Skip', '', () => window.gxa.confirm(false)));
      c.append(row); cf.append(c);
    }
    go.innerHTML = st.busy ? ICON_STOP : ICON_SEND;
    go.title = st.busy ? 'Stop' : 'Send';
    go.disabled = false;
  }
  function submit() {
    if (st.busy) { window.gxa.stop(); return; }
    const t = input.value.trim();
    if (!t) return;
    input.value = ''; grow();
    window.gxa.send(t);
  }
  function grow() { input.style.height = 'auto'; input.style.height = Math.min(120, input.scrollHeight) + 'px'; }
  go.onclick = submit;
  input.oninput = grow;
  input.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); } };
  $('close').onclick = () => window.gxa.close();
  $('clear').onclick = () => window.gxa.clear();
  window.gxa.onState((s) => { st = s; render(); });
  window.gxa.onPage((p) => { st.page = p; renderPage(); });
  window.gxa.onFocus(() => input.focus());
  render();
  window.gxa.ready();
})();
