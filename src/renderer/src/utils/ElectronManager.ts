import type { DisplayInfo, WindowSize, SystemVolumeInfo, SystemVolumeResult } from '../types/electron';

/**
 * Electron API 管理器
 * 提供統一的 Electron 功能封裝
 */
export class ElectronManager {
  private static instance: ElectronManager;
  private electronAPI: typeof window.electronAPI;

  private constructor() {
    if (typeof window !== 'undefined' && window.electronAPI) {
      this.electronAPI = window.electronAPI;
    } else {
      throw new Error('ElectronManager can only be used in Electron renderer process');
    }
  }

  public static getInstance(): ElectronManager {
    if (!ElectronManager.instance) {
      ElectronManager.instance = new ElectronManager();
    }
    return ElectronManager.instance;
  }

  // 檢查是否在 Electron 環境中
  public isElectron(): boolean {
    return this.electronAPI?.isElectron ?? false;
  }

  public isDev(): boolean {
    return this.electronAPI?.isDev ?? false;
  }

  public getPlatform(): string {
    return this.electronAPI?.platform ?? 'unknown';
  }

  // 顯示器相關功能
  public async getAllDisplays(): Promise<DisplayInfo[]> {
    if (!this.isElectron()) {
      throw new Error('Display API not available outside Electron');
    }
    return this.electronAPI.display.getAllDisplays();
  }

  public async getPrimaryDisplay(): Promise<DisplayInfo> {
    if (!this.isElectron()) {
      throw new Error('Display API not available outside Electron');
    }
    return this.electronAPI.display.getPrimaryDisplay();
  }

  // 視窗控制功能
  public async setFullscreen(fullscreen: boolean): Promise<boolean> {
    if (!this.isElectron()) {
      console.warn('Fullscreen API not available outside Electron');
      return false;
    }
    return this.electronAPI.window.setFullscreen(fullscreen);
  }

  public async isFullscreen(): Promise<boolean> {
    if (!this.isElectron()) {
      return false;
    }
    return this.electronAPI.window.isFullscreen();
  }

  public async setWindowSize(width: number, height: number): Promise<WindowSize | null> {
    if (!this.isElectron()) {
      console.warn('Window size API not available outside Electron');
      return null;
    }
    return this.electronAPI.window.setSize(width, height);
  }

  public async getWindowSize(): Promise<WindowSize | null> {
    if (!this.isElectron()) {
      return null;
    }
    return this.electronAPI.window.getSize();
  }

  public async centerWindow(): Promise<boolean> {
    if (!this.isElectron()) {
      console.warn('Window center API not available outside Electron');
      return false;
    }
    return this.electronAPI.window.center();
  }

  public async setResizable(resizable: boolean): Promise<boolean> {
    if (!this.isElectron()) {
      console.warn('Window resizable API not available outside Electron');
      return false;
    }
    return this.electronAPI.window.setResizable(resizable);
  }

  public async maximizeWindow(): Promise<boolean> {
    if (!this.isElectron()) {
      console.warn('Window maximize API not available outside Electron');
      return false;
    }
    return this.electronAPI.window.maximize();
  }

  public async minimizeWindow(): Promise<boolean> {
    if (!this.isElectron()) {
      console.warn('Window minimize API not available outside Electron');
      return false;
    }
    return this.electronAPI.window.minimize();
  }

  // 設定同步功能
  public async syncSettingsToMain(settings: any): Promise<boolean> {
    if (!this.isElectron()) {
      console.warn('Settings sync API not available outside Electron');
      return false;
    }
    
    // 檢查 settings API 是否可用
    if (!this.electronAPI.settings || typeof this.electronAPI.settings.syncFromRenderer !== 'function') {
      console.warn('Settings sync API not properly initialized');
      return false;
    }
    
    try {
      return await this.electronAPI.settings.syncFromRenderer(settings);
    } catch (error) {
      console.warn('Failed to sync settings:', error);
      return false;
    }
  }

  public async getSettingsFromMain(): Promise<any> {
    if (!this.isElectron()) {
      console.warn('Settings sync API not available outside Electron');
      return null;
    }
    
    // 檢查 settings API 是否可用
    if (!this.electronAPI.settings || typeof this.electronAPI.settings.getFromMain !== 'function') {
      console.warn('Settings get API not properly initialized');
      return null;
    }
    
    try {
      return await this.electronAPI.settings.getFromMain();
    } catch (error) {
      console.warn('Failed to get settings from main:', error);
      return null;
    }
  }

  // 系統音量功能（平台限制）
  public async getSystemVolume(): Promise<SystemVolumeInfo> {
    if (!this.isElectron()) {
      return { 
        supported: false, 
        reason: 'System volume API not available outside Electron' 
      };
    }
    return this.electronAPI.system.getVolume();
  }

  public async setSystemVolume(volume: number): Promise<SystemVolumeResult> {
    if (!this.isElectron()) {
      return { 
        success: false, 
        reason: 'System volume API not available outside Electron' 
      };
    }
    return this.electronAPI.system.setVolume(volume);
  }

  // 平台檢查功能
  public isWindows(): boolean {
    return this.electronAPI?.platformHelpers.isWindows ?? false;
  }

  public isMacOS(): boolean {
    return this.electronAPI?.platformHelpers.isMacOS ?? false;
  }

  public isLinux(): boolean {
    return this.electronAPI?.platformHelpers.isLinux ?? false;
  }

  // 建議的解析度選項
  public getCommonResolutions(): Array<{ width: number; height: number; label: string }> {
    return [
      { width: 1280, height: 720, label: '1280×720 (HD)' },
      { width: 1366, height: 768, label: '1366×768' },
      { width: 1440, height: 900, label: '1440×900' },
      { width: 1600, height: 900, label: '1600×900' },
      { width: 1920, height: 1080, label: '1920×1080 (Full HD)' },
      { width: 2560, height: 1440, label: '2560×1440 (2K)' },
      { width: 3840, height: 2160, label: '3840×2160 (4K)' },
    ];
  }

  // 根據當前顯示器獲取適合的解析度選項
  public async getAvailableResolutions(): Promise<Array<{ width: number; height: number; label: string }>> {
    if (!this.isElectron()) {
      return this.getCommonResolutions();
    }

    try {
      const primaryDisplay = await this.getPrimaryDisplay();
      const maxWidth = primaryDisplay.workAreaSize.width;
      const maxHeight = primaryDisplay.workAreaSize.height;
      
      return this.getCommonResolutions().filter(
        resolution => resolution.width <= maxWidth && resolution.height <= maxHeight
      );
    } catch (error) {
      console.error('Failed to get display info:', error);
      return this.getCommonResolutions();
    }
  }
}

// 匯出單例實例
export const electronManager = ElectronManager.getInstance();