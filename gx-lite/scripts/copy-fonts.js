// Runs after "npm install": copies the font and terminal files into renderer/ so the app loads them offline.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const nm = (...p) => path.join(root, 'node_modules', ...p);
const out = (...p) => path.join(root, 'renderer', ...p);

// Source Code Pro
try {
  const pkg = nm('@fontsource-variable', 'source-code-pro');
  const cssFile = ['wght.css', 'index.css'].map((f) => path.join(pkg, f)).find(fs.existsSync);
  if (!cssFile) throw new Error('font stylesheet not found in package');
  let css = fs.readFileSync(cssFile, 'utf8');
  fs.mkdirSync(out('fonts'), { recursive: true });
  const used = new Set();
  css = css.replace(/url\((['"]?)\.\/files\/([^)'"]+)\1\)/g, (_m, q, f) => { used.add(f); return `url(${q}./fonts/${f}${q})`; });
  for (const f of used) { try { fs.copyFileSync(path.join(pkg, 'files', f), out('fonts', f)); } catch {} }
  fs.writeFileSync(out('fonts.css'), css);
  console.log(`[gx-lite] Source Code Pro installed (${used.size} files)`);
} catch (e) {
  console.warn('[gx-lite] Source Code Pro not bundled, using system monospace:', e.message);
}

// xterm.js for the terminal panel
try {
  fs.mkdirSync(out('vendor'), { recursive: true });
  fs.copyFileSync(nm('@xterm', 'xterm', 'lib', 'xterm.js'), out('vendor', 'xterm.js'));
  fs.copyFileSync(nm('@xterm', 'xterm', 'css', 'xterm.css'), out('vendor', 'xterm.css'));
  fs.copyFileSync(nm('@xterm', 'addon-fit', 'lib', 'addon-fit.js'), out('vendor', 'addon-fit.js'));
  console.log('[gx-lite] terminal files installed');
} catch (e) {
  console.warn('[gx-lite] terminal files not copied:', e.message);
}

// node-pty ships a helper program that must be executable on macOS/Linux
try {
  const pre = nm('node-pty', 'prebuilds');
  for (const d of fs.readdirSync(pre)) {
    const h = path.join(pre, d, 'spawn-helper');
    if (fs.existsSync(h)) fs.chmodSync(h, 0o755);
  }
} catch {}
