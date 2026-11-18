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

  const logHtml = (s) => (s.log && s.log.length ? '<ul class="log">' + s.log.map((l) => `<li>${esc(l)}</li>`).join('') + '</ul>' : '');
  function render(s) {
    cur = s;
    if (s.state === 'loading') body.innerHTML = head(s) + logHtml(s) + '<p class="dim">Working on it…</p>';
    else if (s.state === 'confirm') {
      const a = s.action || {};
      body.innerHTML = head(s) + logHtml(s) +
        `<div class="ask-box"><div>Gemini wants to click <strong>“${esc(a.label)}”</strong> (${esc(a.tag)}).</div>${a.reason ? `<div class="url">${esc(a.reason)}</div>` : ''}` +
        '<div class="row2"><button class="btn" id="allow">Allow</button><button class="chip" id="skip">Skip</button></div></div>';
      document.getElementById('allow').onclick = () => window.gx.confirmSummary(true);
      document.getElementById('skip').onclick = () => window.gx.confirmSummary(false);
    }
    else if (s.state === 'done') body.innerHTML = head(s) + (s.question ? `<p class="dim">You asked: ${esc(s.question)}</p>` : '') + logHtml(s) + md(s.text) + `<div class="url">Written by ${esc(s.model)}</div>`;
    else if (s.state === 'error') body.innerHTML = (s.url ? head(s) : '') + logHtml(s) + `<p class="err">${esc(s.message)}</p>`;
    else if (s.state === 'nokey') {
      body.innerHTML = head(s) + '<p>To summarize pages here you need a Gemini API key. It is free to get. Add it in Settings.</p><p><button class="btn" id="gokey">Add API key</button></p>' +
        '<p class="dim">No key? This opens the Gemini website in a new tab and asks it to summarize the page.</p><p><button class="btn" id="viagemini">Use the Gemini website</button></p>';
      document.getElementById('gokey').onclick = () => window.gx.openSettings('ai');
      document.getElementById('viagemini').onclick = () => window.gx.summaryViaGemini();
    } else body.innerHTML = '<p class="dim">Click the sparkle button in the address bar to summarize the page you are on. Or type below to ask about it or tell Gemini to click a button. You approve each click.</p>';
  }

  const askBox = document.getElementById('ask');
  const askGo = () => { const q = askBox.value.trim(); if (!q) return; askBox.value = ''; window.gx.askSummary(q); };
  document.getElementById('askgo').onclick = askGo;
  askBox.onkeydown = (e) => { if (e.key === 'Enter') askGo(); };
  document.getElementById('again').onclick = () => window.gx.runSummary();
  document.getElementById('close').onclick = () => window.gx.closePanel();
  document.getElementById('copy').onclick = () => { if (cur.text) navigator.clipboard.writeText(cur.text).catch(() => {}); };
  window.gx.onSummary(render);
  window.gx.getSummary().then((s) => render(s || { state: 'idle' }));
})();
