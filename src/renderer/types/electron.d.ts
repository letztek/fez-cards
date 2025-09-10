// Electron API types for renderer process

interface DisplayInfo {
  id: number;
  label: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  size: {
    width: number;
    height: number;
  };
  workAreaSize: {
    width: number;
    height: number;
  };
  scaleFactor: number;
  primary: boolean;
}

interface WindowSize {
  width: number;
  height: number;
}

interface SystemVolumeInfo {
  supported: boolean;
  volume?: number;
  reason?: string;
  error?: string;
}

interface SystemVolumeResult {
  success: boolean;
  reason?: string;
  error?: string;
}

interface ElectronAPI {
  isElectron: boolean;
  isDev: boolean;
  platform: string;
  
  display: {
    getAllDisplays: () => Promise<DisplayInfo[]>;
    getPrimaryDisplay: () => Promise<DisplayInfo>;
  };
  
  window: {
    setFullscreen: (fullscreen: boolean) => Promise<boolean>;
    isFullscreen: () => Promise<boolean>;
    setSize: (width: number, height: number) => Promise<WindowSize | null>;
    getSize: () => Promise<WindowSize | null>;
    center: () => Promise<boolean>;
    setResizable: (resizable: boolean) => Promise<boolean>;
    maximize: () => Promise<boolean>;
    minimize: () => Promise<boolean>;
  };
  
  settings: {
    syncFromRenderer: (settings: any) => Promise<boolean>;
    getFromMain: () => Promise<any>;
  };
  
  system: {
    getVolume: () => Promise<SystemVolumeInfo>;
    setVolume: (volume: number) => Promise<SystemVolumeResult>;
  };
  
  platformHelpers: {
    isWindows: boolean;
    isMacOS: boolean;
    isLinux: boolean;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};