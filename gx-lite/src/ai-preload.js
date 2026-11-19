'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('gxa', {
  onState: (cb) => ipcRenderer.on('ai:state', (_e, s) => cb(s)),
  onPage: (cb) => ipcRenderer.on('ai:page', (_e, p) => cb(p)),
  onFocus: (cb) => ipcRenderer.on('ai:focus', () => cb()),
  ready: () => ipcRenderer.send('ai:ready'),
  send: (t) => ipcRenderer.send('ai:send', String(t || '')),
  summarize: () => ipcRenderer.send('ai:summarize'),
  confirm: (ok) => ipcRenderer.send('ai:confirm', !!ok),
  stop: () => ipcRenderer.send('ai:stop'),
  clear: () => ipcRenderer.send('ai:clear'),
  retry: () => ipcRenderer.send('ai:retry'),
  close: () => ipcRenderer.send('ai:close'),
  openSettings: () => ipcRenderer.send('ai:settings'),
  geminiSite: () => ipcRenderer.send('ai:gemini-site')
});
