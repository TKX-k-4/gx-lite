'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// macOS has no native back/forward event for mouse buttons 4/5. Windows uses 'app-command' in main.
if (process.platform === 'darwin') {
  window.addEventListener('mouseup', (e) => {
    if (e.button === 3) { e.preventDefault(); ipcRenderer.send('nav', 'back'); }
    else if (e.button === 4) { e.preventDefault(); ipcRenderer.send('nav', 'forward'); }
  }, true);
}

// Only our own pages (new tab, settings) get an API.
if (location.protocol === 'file:' && /\/renderer\/(newtab|settings|console)\.html$/.test(location.pathname)) {
  contextBridge.exposeInMainWorld('gx', {
    getBookmarks: () => ipcRenderer.invoke('bookmarks:get'),
    getSettings: () => ipcRenderer.invoke('settings:get'),
    setSettings: (patch) => ipcRenderer.invoke('settings:set', patch),
    onSettings: (cb) => ipcRenderer.on('settings', (_e, s) => cb(s)),
    onBookmarks: (cb) => ipcRenderer.on('bookmarks', (_e, b) => cb(b)),
    search: (text) => ipcRenderer.send('navigate-self', text),
    openSettings: (hash) => ipcRenderer.send('open-settings', hash),
    getLogs: () => ipcRenderer.invoke('console:get'),
    onLogs: (cb) => ipcRenderer.on('console:lines', (_e, l) => cb(l)),
    clearLogs: () => ipcRenderer.invoke('console:clear'),
    clearData: () => ipcRenderer.invoke('data:clear')
  });
}
