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
if (location.protocol === 'file:' && /\/renderer\/(newtab|settings|console|summary|terminal|memory)\.html$/.test(location.pathname)) {
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
    getMemory: () => ipcRenderer.invoke('mem:get'),
    unloadTab: (id) => ipcRenderer.send('mem:unload', id),
    unloadPanel: (id) => ipcRenderer.send('mem:unload-panel', id),
    unloadAll: () => ipcRenderer.send('mem:unload-all'),
    getSummary: () => ipcRenderer.invoke('summary:get'),
    onSummary: (cb) => ipcRenderer.on('summary:update', (_e, st) => cb(st)),
    runSummary: () => ipcRenderer.send('summary:run'),
    summaryViaClaude: () => ipcRenderer.send('summary:via-claude'),
    closePanel: () => ipcRenderer.send('panel:close'),
    aiStatus: () => ipcRenderer.invoke('ai:status'),
    setApiKey: (k) => ipcRenderer.invoke('ai:set-key', k),
    clearApiKey: () => ipcRenderer.invoke('ai:clear-key'),
    ptyStart: (c, r) => ipcRenderer.invoke('pty:start', c, r),
    ptyWrite: (d) => ipcRenderer.send('pty:write', d),
    ptyResize: (c, r) => ipcRenderer.send('pty:resize', c, r),
    ptyKill: () => ipcRenderer.invoke('pty:kill'),
    onPtyData: (cb) => ipcRenderer.on('pty:data', (_e, d) => cb(d)),
    onPtyExit: (cb) => ipcRenderer.on('pty:exit', (_e, c) => cb(c)),
    clearData: () => ipcRenderer.invoke('data:clear')
  });
}
