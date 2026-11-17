'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('gxm', {
  onItems: (cb) => ipcRenderer.on('extmenu:items', (_e, d) => cb(d)),
  pick: (action, id) => ipcRenderer.send('extmenu:pick', action, id),
  ready: () => ipcRenderer.send('extmenu:ready')
});
