(() => {
  const body = document.getElementById('body');
  let cur = { state: 'idle' };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // tiny, safe markdown: "- " bullets and **bold**
  function md(text) {
    const lines = esc(text).split('\n');
    let html = '', open = false;
    for (const raw of lines) {
      const li = raw.match(/^\s*[-*•]\s+(.*)$/);
      const inline = (x) => x.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (li) { if (!open) { html += '<ul>'; open = true; } html += `<li>${inline(li[1])}</li>`; }
      else { if (open) { html += '</ul>'; open = false; } if (raw.trim()) html += `<p>${inline(raw)}</p>`; }
    }
    return html + (open ? '</ul>' : '');
  }
  const head = (s) => `<h3>${esc(s.title || 'This page')}</h3><div class="url">${esc(s.url || '')}</div>`;

  function render(s) {
    cur = s;
    if (s.state === 'loading') body.innerHTML = head(s) + '<p class="dim">Reading the page and writing a summary…</p>';
    else if (s.state === 'done') body.innerHTML = head(s) + md(s.text) + `<div class="url">Written by ${esc(s.model)}</div>`;
    else if (s.state === 'error') body.innerHTML = (s.url ? head(s) : '') + `<p class="err">${esc(s.message)}</p>`;
    else if (s.state === 'nokey') {
      body.innerHTML = head(s) + '<p>To summarize pages you need an Anthropic API key. Add one in Settings.</p><p><button class="btn" id="gokey">Add API key</button></p>' +
        '<p class="dim">No key? This copies the page text and opens Claude in the sidebar. Press Ctrl/Cmd+V there to paste it.</p><p><button class="btn" id="viaclaude">Use the Claude sidebar</button></p>';
      document.getElementById('gokey').onclick = () => window.gx.openSettings('ai');
      document.getElementById('viaclaude').onclick = () => window.gx.summaryViaClaude();
    } else body.innerHTML = '<p class="dim">Click the sparkle button in the address bar to summarize the page you are on.</p>';
  }

  document.getElementById('again').onclick = () => window.gx.runSummary();
  document.getElementById('close').onclick = () => window.gx.closePanel();
  document.getElementById('copy').onclick = () => { if (cur.text) navigator.clipboard.writeText(cur.text).catch(() => {}); };
  window.gx.onSummary(render);
  window.gx.getSummary().then((s) => render(s || { state: 'idle' }));
})();
