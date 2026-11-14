(async () => {
  const el = document.getElementById('term');
  if (typeof Terminal === 'undefined' || typeof FitAddon === 'undefined') {
    el.textContent = 'The terminal files are missing. Run "npm install" in the project folder, then restart.';
    el.style.padding = '16px';
    return;
  }
  const gx = window.gx;
  const term = new Terminal({
    fontFamily: '"Source Code Pro Variable","Source Code Pro",Menlo,Consolas,monospace',
    fontSize: 13, cursorBlink: true, scrollback: 5000, allowProposedApi: true,
    theme: { background: '#080c16', foreground: '#e8eefc', cursor: '#3b82f6', selectionBackground: '#1f3a73' }
  });
  const fit = new FitAddon.FitAddon();
  term.loadAddon(fit);
  term.open(el);
  fit.fit();

  // copy selection with Ctrl/Cmd+C when something is selected; paste with Ctrl+Shift+V
  term.attachCustomKeyEventHandler((e) => {
    if (e.type !== 'keydown') return true;
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'c' && term.hasSelection()) {
      navigator.clipboard.writeText(term.getSelection()).catch(() => {});
      return false;
    }
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'v') {
      navigator.clipboard.readText().then((t) => term.paste(t)).catch(() => {});
      return false;
    }
    return true;
  });

  async function start() {
    const res = await gx.ptyStart(term.cols, term.rows);
    if (!res.ok) { term.write('\r\nTerminal unavailable: ' + res.error + '\r\n'); return; }
    if (res.replay) term.write(res.replay);
    term.focus();
  }
  term.onData((d) => gx.ptyWrite(d));
  gx.onPtyData((d) => term.write(d));
  gx.onPtyExit((c) => term.write(`\r\n[shell exited with code ${c}. Press Restart]\r\n`));
  new ResizeObserver(() => { try { fit.fit(); gx.ptyResize(term.cols, term.rows); } catch {} }).observe(el);

  document.getElementById('opencode').onclick = () => { gx.ptyWrite('opencode\r'); term.focus(); };
  document.getElementById('restart').onclick = async () => { await gx.ptyKill(); term.reset(); await start(); };

  await start();
})();
