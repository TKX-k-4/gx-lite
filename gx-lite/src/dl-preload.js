'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('gxd', {
  onItems: (cb) => ipcRenderer.on('dl:items', (_e, d) => cb(d)),
  act: (action, id) => ipcRenderer.send('dl:act', action, id),
  ready: () => ipcRenderer.send('dl:ready')
});
