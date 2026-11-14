(async () => {
  const el = document.getElementById('term'), ttl = document.getElementById('ttl');
  if (typeof Terminal === 'undefined' || typeof FitAddon === 'undefined') {
    el.textContent = 'The terminal files are missing. Run "npm install" in the project folder, then restart.';
    el.style.cssText += ';padding:16px;color:#f2f2f2';
    return;
  }
  const gx = window.gx;

  // macOS Terminal.app: "Pro" background with the standard Terminal colour set, block cursor, SF Mono / Menlo
  const term = new Terminal({
    fontFamily: '"SF Mono", SFMono-Regular, Menlo, Monaco, "Source Code Pro Variable", "Source Code Pro", Consolas, monospace',
    fontSize: 12, lineHeight: 1, cursorStyle: 'block', cursorBlink: true, scrollback: 5000, allowProposedApi: true,
    theme: {
      background: '#000000', foreground: '#f2f2f2', cursor: '#b8b8b8', cursorAccent: '#000000', selectionBackground: 'rgba(180,213,255,0.35)',
      black: '#000000', red: '#c23621', green: '#25bc24', yellow: '#adad27', blue: '#492ee1', magenta: '#d338d3', cyan: '#33bbc8', white: '#cbcccd',
      brightBlack: '#818383', brightRed: '#fc391f', brightGreen: '#31e722', brightYellow: '#eaec23', brightBlue: '#5833ff', brightMagenta: '#f935f8', brightCyan: '#14f0f0', brightWhite: '#e9ebeb'
    }
  });
  const fit = new FitAddon.FitAddon();
  term.loadAddon(fit);
  try { if (typeof Unicode11Addon !== 'undefined') { term.loadAddon(new Unicode11Addon.Unicode11Addon()); term.unicode.activeVersion = '11'; } } catch {}
  term.open(el);
  fit.fit();

  // window title like Terminal.app: "<process title> — 80×24"
  let base = 'Terminal';
  const setTitle = () => { ttl.textContent = `${base} — ${term.cols}×${term.rows}`; };
  term.onTitleChange((t) => { base = t || 'Terminal'; setTitle(); });
  term.onResize(setTitle);
  setTitle();

  // Cmd/Ctrl+C copies when text is selected; Ctrl+Shift+V pastes
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
  gx.onPtyExit((c) => term.write(`\r\n[Process completed with exit code ${c}. Press Restart.]\r\n`));
  new ResizeObserver(() => { try { fit.fit(); gx.ptyResize(term.cols, term.rows); } catch {} }).observe(el);

  document.getElementById('close').onclick = () => gx.closePanel();
  document.getElementById('opencode').onclick = () => { gx.ptyWrite('opencode\r'); term.focus(); };
  document.getElementById('restart').onclick = async () => { await gx.ptyKill(); term.reset(); base = 'Terminal'; setTitle(); await start(); };

  await start();
})();
