'use strict';
// Password and autofill storage. Every secret is encrypted with Electron's safeStorage, which uses the
// operating system's key store (Keychain on macOS, DPAPI on Windows). Nothing is stored in plain text.
const fs = require('fs');
const crypto = require('crypto');

function parseCsv(text) {
  const rows = [];
  let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(f); f = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else f += c;
  }
  row.push(f);
  if (row.length > 1 || row[0] !== '') rows.push(row);
  return rows;
}
// ---- one-time codes (TOTP, RFC 6238) ----
function b32decode(str) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const s = String(str).toUpperCase().replace(/[\s=-]/g, '');
  if (!s) return null;
  let bits = 0, val = 0;
  const out = [];
  for (const ch of s) {
    const i = A.indexOf(ch);
    if (i < 0) return null;
    val = (val << 5) | i; bits += 5;
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 255); bits -= 8; val &= (1 << bits) - 1; }
  }
  return Buffer.from(out);
}
function totpAt(key, nowMs, digits = 6, period = 30, algo = 'sha1') {
  const counter = Math.floor(nowMs / 1000 / period);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac(algo, key).update(buf).digest();
  const o = h[h.length - 1] & 15;
  const bin = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(bin % 10 ** digits).padStart(digits, '0');
}
function parseOtpauth(uri) {
  try {
    const u = new URL(String(uri).trim());
    if (u.protocol !== 'otpauth:' || u.hostname !== 'totp') return null;
    const label = decodeURIComponent(u.pathname.replace(/^\//, ''));
    const i = label.indexOf(':');
    const issuerFromLabel = i >= 0 ? label.slice(0, i).trim() : '';
    const account = (i >= 0 ? label.slice(i + 1) : label).trim();
    return {
      issuer: u.searchParams.get('issuer') || issuerFromLabel, account, secret: u.searchParams.get('secret') || '',
      digits: +u.searchParams.get('digits') || 6, period: +u.searchParams.get('period') || 30, algo: (u.searchParams.get('algorithm') || 'SHA1').toUpperCase()
    };
  } catch { return null; }
}
const csvEsc = (s) => '"' + String(s ?? '').replace(/"/g, '""') + '"';

class Vault {
  constructor(file, safeStorage) {
    this.file = file; this.ss = safeStorage; this.timer = null;
    this.data = { v: 1, entries: [], never: [], profile: '', otp: [] };
    try { this.data = { ...this.data, ...JSON.parse(fs.readFileSync(file, 'utf8')) }; } catch {}
  }
  get available() { try { return this.ss.isEncryptionAvailable(); } catch { return false; } }
  _enc(o) { return this.ss.encryptString(JSON.stringify(o)).toString('base64'); }
  _dec(b) { try { return JSON.parse(this.ss.decryptString(Buffer.from(b, 'base64'))); } catch { return null; } }
  save() { clearTimeout(this.timer); this.timer = setTimeout(() => this.flush(), 200); }
  flush() {
    clearTimeout(this.timer);
    const tmp = this.file + '.tmp';
    try { fs.writeFileSync(tmp, JSON.stringify(this.data), { mode: 0o600 }); fs.renameSync(tmp, this.file); } catch {}
  }
  _meta(e) {
    const d = this._dec(e.blob);
    return d ? { id: e.id, origin: e.origin, username: d.u || '', created: e.created, updated: e.updated, used: e.used || 0 } : null;
  }
  list() { return this.data.entries.map((e) => this._meta(e)).filter(Boolean); }
  forOrigin(origin) { return this.data.entries.filter((e) => e.origin === origin).map((e) => this._meta(e)).filter(Boolean); }
  getPassword(id) { const e = this.data.entries.find((x) => x.id === id); const d = e && this._dec(e.blob); return d ? d.p : null; }
  touch(id) { const e = this.data.entries.find((x) => x.id === id); if (e) { e.used = Date.now(); this.save(); } }
  upsert({ id, origin, username, password }) {
    if (!this.available) return false;
    const now = Date.now();
    const e = id
      ? this.data.entries.find((x) => x.id === id)
      : this.data.entries.find((x) => x.origin === origin && (this._dec(x.blob) || {}).u === username);
    if (e) { e.origin = origin; e.blob = this._enc({ u: username, p: password }); e.updated = now; }
    else this.data.entries.push({ id: crypto.randomUUID(), origin, blob: this._enc({ u: username, p: password }), created: now, updated: now });
    this.save();
    return true;
  }
  remove(id) { this.data.entries = this.data.entries.filter((x) => x.id !== id); this.save(); }
  neverHas(o) { return this.data.never.includes(o); }
  neverAdd(o) { if (!this.data.never.includes(o)) { this.data.never.push(o); this.save(); } }
  neverRemove(o) { this.data.never = this.data.never.filter((x) => x !== o); this.save(); }
  getProfile() { return this.data.profile ? this._dec(this.data.profile) || {} : {}; }
  setProfile(p) { if (!this.available) return false; this.data.profile = this._enc(p); this.save(); return true; }
  generate(len = 20) {
    const sets = ['abcdefghijkmnopqrstuvwxyz', 'ABCDEFGHJKLMNPQRSTUVWXYZ', '23456789', '!@#$%^&*-_=+'];
    const all = sets.join('');
    const pick = (s) => s[crypto.randomInt(s.length)];
    const chars = sets.map(pick);
    while (chars.length < len) chars.push(pick(all));
    for (let i = chars.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
    return chars.join('');
  }
  // ---- authenticator ----
  otpList() {
    return this.data.otp.map((e) => {
      const d = this._dec(e.blob);
      return d ? { id: e.id, issuer: d.issuer || '', account: d.account || '', site: d.site || '', digits: d.digits, period: d.period } : null;
    }).filter(Boolean);
  }
  otpAdd(o) {
    if (!this.available) return { ok: false, error: 'Secure storage is not available on this computer.' };
    let d = o || {};
    if (d.uri) { const p = parseOtpauth(d.uri); if (!p) return { ok: false, error: 'That is not a valid otpauth:// link.' }; d = { ...p, site: d.site }; }
    const key = b32decode(d.secret);
    if (!key || key.length < 5) return { ok: false, error: 'Enter the secret key (letters A-Z and digits 2-7).' };
    const digits = [6, 7, 8].includes(+d.digits) ? +d.digits : 6;
    const period = [15, 30, 60].includes(+d.period) ? +d.period : 30;
    const algo = ['SHA1', 'SHA256', 'SHA512'].includes(String(d.algo || 'SHA1').toUpperCase()) ? String(d.algo || 'SHA1').toUpperCase() : 'SHA1';
    let site = String(d.site || '').trim().toLowerCase();
    try { if (site) site = new URL(/^[a-z]+:\/\//.test(site) ? site : 'https://' + site).hostname.replace(/^www\./, ''); } catch { site = ''; }
    const rec = { issuer: String(d.issuer || '').trim().slice(0, 60), account: String(d.account || '').trim().slice(0, 100), site, secret: String(d.secret).toUpperCase().replace(/[\s=-]/g, ''), digits, period, algo };
    this.data.otp.push({ id: crypto.randomUUID(), blob: this._enc(rec), created: Date.now() });
    this.save();
    return { ok: true };
  }
  otpRemove(id) { this.data.otp = this.data.otp.filter((x) => x.id !== id); this.save(); }
  otpCode(id, now = Date.now()) {
    const e = this.data.otp.find((x) => x.id === id);
    const d = e && this._dec(e.blob);
    if (!d) return null;
    const key = b32decode(d.secret);
    if (!key) return null;
    return { code: totpAt(key, now, d.digits, d.period, d.algo.toLowerCase()), remaining: d.period - (Math.floor(now / 1000) % d.period), period: d.period };
  }
  exportCsv() {
    const rows = ['name,url,username,password,note'];
    for (const e of this.data.entries) {
      const d = this._dec(e.blob);
      if (!d) continue;
      let host = e.origin;
      try { host = new URL(e.origin).hostname; } catch {}
      rows.push([host, e.origin, d.u, d.p, ''].map(csvEsc).join(','));
    }
    return rows.join('\r\n');
  }
  importCsv(text) {
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const rows = parseCsv(text);
    if (rows.length < 2) return 0;
    const h = rows[0].map((x) => x.trim().toLowerCase());
    const iu = h.indexOf('url'), ip = h.indexOf('password'), iun = h.findIndex((x) => x === 'username' || x === 'login');
    if (iu < 0 || ip < 0) return 0;
    let n = 0;
    for (const r of rows.slice(1)) {
      let origin = '';
      try { const u = new URL(r[iu]); if (/^https?:$/.test(u.protocol)) origin = u.origin; } catch {}
      const pw = r[ip];
      if (!origin || !pw) continue;
      if (this.upsert({ origin, username: iun >= 0 ? (r[iun] || '') : '', password: pw })) n++;
    }
    return n;
  }
}
module.exports = { Vault, b32decode, totpAt, parseOtpauth };
