'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('gxr', { start: () => ipcRenderer.send('resize:start'), end: () => ipcRenderer.send('resize:end') });
