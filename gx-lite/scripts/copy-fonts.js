// Copies Source Code Pro (variable) from node_modules into renderer/ so the app can load it offline.
const fs = require('fs');
const path = require('path');
const pkg = path.join(__dirname, '..', 'node_modules', '@fontsource-variable', 'source-code-pro');
const out = path.join(__dirname, '..', 'renderer');
try {
  const cssFile = ['wght.css', 'index.css'].map((f) => path.join(pkg, f)).find(fs.existsSync);
  if (!cssFile) throw new Error('font stylesheet not found in package');
  let css = fs.readFileSync(cssFile, 'utf8');
  fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });
  const used = new Set();
  css = css.replace(/url\((['"]?)\.\/files\/([^)'"]+)\1\)/g, (_m, q, f) => { used.add(f); return `url(${q}./fonts/${f}${q})`; });
  for (const f of used) { try { fs.copyFileSync(path.join(pkg, 'files', f), path.join(out, 'fonts', f)); } catch {} }
  fs.writeFileSync(path.join(out, 'fonts.css'), css);
  console.log(`[gx-lite] Source Code Pro installed (${used.size} files)`);
} catch (e) {
  console.warn('[gx-lite] Source Code Pro not bundled, using system monospace:', e.message);
}
