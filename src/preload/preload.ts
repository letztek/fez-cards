import { contextBridge, ipcRenderer } from 'electron';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});

// --------- Expose electron environment info ---------
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  isDev: process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL !== undefined,
  platform: process.platform,
  
  // Display APIs
  display: {
    getAllDisplays: () => ipcRenderer.invoke('display:get-all-displays'),
    getPrimaryDisplay: () => ipcRenderer.invoke('display:get-primary-display'),
  },
  
  // Window APIs
  window: {
    setFullscreen: (fullscreen: boolean) => ipcRenderer.invoke('window:set-fullscreen', fullscreen),
    isFullscreen: () => ipcRenderer.invoke('window:is-fullscreen'),
    setSize: (width: number, height: number) => ipcRenderer.invoke('window:set-size', width, height),
    getSize: () => ipcRenderer.invoke('window:get-size'),
    center: () => ipcRenderer.invoke('window:center'),
    setResizable: (resizable: boolean) => ipcRenderer.invoke('window:set-resizable', resizable),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    minimize: () => ipcRenderer.invoke('window:minimize'),
  },
  
  // Settings sync APIs
  settings: {
    syncFromRenderer: (settings: any) => ipcRenderer.invoke('settings:sync-from-renderer', settings),
    getFromMain: () => ipcRenderer.invoke('settings:get-from-main'),
  },
  
  // System APIs
  system: {
    getVolume: () => ipcRenderer.invoke('system:get-volume'),
    setVolume: (volume: number) => ipcRenderer.invoke('system:set-volume', volume),
  },
  
  // Platform helpers
  platformHelpers: {
    isWindows: process.platform === 'win32',
    isMacOS: process.platform === 'darwin',
    isLinux: process.platform === 'linux',
  }
});