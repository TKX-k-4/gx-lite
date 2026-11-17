'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('gxaf', {
  onItems: (cb) => ipcRenderer.on('af:items', (_e, items) => cb(items)),
  pick: (i) => ipcRenderer.send('af:pick', i),
  ready: () => ipcRenderer.send('af:ready')
});
