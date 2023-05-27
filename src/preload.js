const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  requireRblxClientToggle: (t) => ipcRenderer.send('sw-require-rblx-client-toggled', t)
})