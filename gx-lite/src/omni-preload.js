'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('gxo', {
  onItems: (cb) => ipcRenderer.on('omni:items', (_e, d) => cb(d)),
  pick: (i) => ipcRenderer.send('omni:pick', i),
  ready: () => ipcRenderer.send('omni:ready')
});
