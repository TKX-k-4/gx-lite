'use strict';
const { contextBridge, ipcRenderer } = require('electron');
const send = (ch, ...a) => ipcRenderer.send(ch, ...a);

contextBridge.exposeInMainWorld('gx', {
  platform: process.platform,
  onState: (cb) => ipcRenderer.on('state', (_e, s) => cb(s)),
  onCmd: (cb) => ipcRenderer.on('cmd', (_e, c, a) => cb(c, a)),
  onFind: (cb) => ipcRenderer.on('find-result', (_e, r) => cb(r)),
  newTab: () => send('tab:new'),
  activate: (id) => send('tab:activate', id),
  closeTab: (id) => send('tab:close', id),
  moveTab: (id, beforeId, gid) => send('tab:move', id, beforeId, gid),
  tabMenu: (id) => send('tab:menu', id),
  groupMenu: (id) => send('group:menu', id),
  summarize: () => send('summary:run'),
  omniQuery: (text, rect) => send('omni:query', text, rect),
  omniMove: (d) => send('omni:move', d),
  omniClose: () => send('omni:close'),
  onOmniFill: (cb) => ipcRenderer.on('omni:fill', (_e, v) => cb(v)),
  installUpdate: () => send('update:install'),
  openUpdate: () => send('update:open'),
  toggleAdBlock: () => send('adblock:toggle'),
  panelWidth: (w) => send('panel:width', w),
  toggleGroup: (id) => send('group:toggle', id),
  renameGroup: (id, name) => send('group:rename', id, name),
  switchWs: (i) => send('ws:switch', i),
  nav: (d) => send('nav', d),
  go: (text, mode) => send('go', text, mode),
  layout: (r) => send('layout', r),
  overlay: (b) => send('overlay', b),
  find: (o) => send('find', o),
  findStop: () => send('find:stop'),
  togglePanel: (id) => send('panel:toggle', id),
  toggleBookmark: () => send('bookmark:toggle'),
  openBookmark: (id, inNewTab) => send('bookmark:open', id, inNewTab),
  bookmarkMenu: (id) => send('bookmark:menu', id),
  openSettings: (hash) => send('open-settings', hash)
});
