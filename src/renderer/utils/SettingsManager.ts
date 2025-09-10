import { GameSettings } from '../types/card';

// 動態引入 ElectronManager (避免 SSR 問題)
let electronManager: any = null;

// 安全的 ElectronManager 載入函數
async function loadElectronManager() {
  if (electronManager) return electronManager;
  
  if (typeof window !== 'undefined' && window.electronAPI) {
    try {
      const module = await import('../src/utils/ElectronManager');
      electronManager = module.electronManager;
      return electronManager;
    } catch (error) {
      console.warn('ElectronManager not available:', error);
      return null;
    }
  }
  return null;
}

/**
 * 設定變更事件類型
 */
export type SettingsChangeEvent = {
  key: keyof GameSettings | string;
  oldValue: any;
  newValue: any;
  settings: GameSettings;
};

/**
 * 設定變更監聽器
 */
export type SettingsChangeListener = (event: SettingsChangeEvent) => void;

/**
 * 增強版設定管理器
 * 提供事件系統、驗證和深度合併功能
 */
export class SettingsManager {
  private static instance: SettingsManager;
  private settings: GameSettings;
  private listeners: Set<SettingsChangeListener> = new Set();
  private readonly STORAGE_KEY = 'fez-card-game-settings-v2';

  /**
   * 預設設定
   */
  private static readonly DEFAULT_SETTINGS: GameSettings = {
    // 遊戲設定
    maxRounds: 6,
    aiDifficulty: 'normal',
    language: 'zh',
    theme: 'dark',
    
    // 音效設定
    audio: {
      masterVolume: 0.7,
      effectsVolume: 0.8,
      musicVolume: 0.6,
      muted: false
    },
    
    // 顯示設定
    display: {
      fullscreen: false,
      resolution: {
        width: 1920,
        height: 1080
      },
      cardSize: 'medium',
      reduceAnimations: false
    },
    
    // 遊戲體驗設定
    gameplay: {
      autoAdvance: false,
      showHints: true,
      battleSpeed: 'normal'
    }
  };

  private constructor() {
    this.settings = this.loadSettings();
  }

  /**
   * 取得單例實例
   */
  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  /**
   * 取得當前設定
   */
  public getSettings(): GameSettings {
    return { ...this.settings };
  }

  /**
   * 取得特定設定值
   */
  public getSetting<K extends keyof GameSettings>(key: K): GameSettings[K] {
    return this.settings[key];
  }

  /**
   * 更新設定 (支援部分更新和深度合併)
   */
  public updateSettings(updates: DeepPartial<GameSettings>): void {
    const oldSettings = { ...this.settings };
    const newSettings = this.deepMerge(this.settings, updates);
    
    // 驗證設定
    const validatedSettings = this.validateSettings(newSettings);
    
    this.settings = validatedSettings;
    this.saveSettings();
    
    // 同步設定到主程序（如果在 Electron 環境中）
    this.syncToMainProcess();
    
    // 觸發變更事件
    this.notifyListeners(oldSettings, this.settings, updates);
  }

  /**
   * 重置為預設設定
   */
  public resetToDefaults(): void {
    const oldSettings = { ...this.settings };
    this.settings = { ...SettingsManager.DEFAULT_SETTINGS };
    this.saveSettings();
    
    this.notifyListeners(oldSettings, this.settings, {});
  }

  /**
   * 添加設定變更監聽器
   */
  public addChangeListener(listener: SettingsChangeListener): void {
    this.listeners.add(listener);
  }

  /**
   * 移除設定變更監聽器
   */
  public removeChangeListener(listener: SettingsChangeListener): void {
    this.listeners.delete(listener);
  }

  /**
   * 匯出設定
   */
  public exportSettings(): string {
    return JSON.stringify({
      settings: this.settings,
      exportDate: new Date().toISOString(),
      version: '2.0.0'
    }, null, 2);
  }

  /**
   * 匯入設定
   */
  public importSettings(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.settings && typeof data.settings === 'object') {
        const validatedSettings = this.validateSettings(data.settings);
        const oldSettings = { ...this.settings };
        
        this.settings = validatedSettings;
        this.saveSettings();
        
        this.notifyListeners(oldSettings, this.settings, {});
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  /**
   * 從本地儲存載入設定
   */
  private loadSettings(): GameSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        return this.validateSettings(
          this.deepMerge(SettingsManager.DEFAULT_SETTINGS, parsedSettings)
        );
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    
    return { ...SettingsManager.DEFAULT_SETTINGS };
  }

  /**
   * 儲存設定到本地儲存
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * 深度合併物件
   */
  private deepMerge<T extends Record<string, any>>(target: T, source: DeepPartial<T>): T {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];
        
        if (
          sourceValue &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          result[key] = this.deepMerge(targetValue, sourceValue);
        } else if (sourceValue !== undefined) {
          result[key] = sourceValue as any;
        }
      }
    }
    
    return result;
  }

  /**
   * 驗證設定值
   */
  private validateSettings(settings: any): GameSettings {
    const validated = { ...SettingsManager.DEFAULT_SETTINGS };
    
    // 驗證基本設定
    if (typeof settings.maxRounds === 'number' && settings.maxRounds > 0 && settings.maxRounds <= 20) {
      validated.maxRounds = settings.maxRounds;
    }
    
    if (['easy', 'normal', 'hard'].includes(settings.aiDifficulty)) {
      validated.aiDifficulty = settings.aiDifficulty;
    }
    
    if (['zh', 'en', 'ja'].includes(settings.language)) {
      validated.language = settings.language;
    }
    
    if (['light', 'dark'].includes(settings.theme)) {
      validated.theme = settings.theme;
    }
    
    // 驗證音效設定
    if (settings.audio && typeof settings.audio === 'object') {
      const audio = settings.audio;
      validated.audio = {
        masterVolume: this.clamp(audio.masterVolume, 0, 1) ?? validated.audio.masterVolume,
        effectsVolume: this.clamp(audio.effectsVolume, 0, 1) ?? validated.audio.effectsVolume,
        musicVolume: this.clamp(audio.musicVolume, 0, 1) ?? validated.audio.musicVolume,
        muted: typeof audio.muted === 'boolean' ? audio.muted : validated.audio.muted
      };
    }
    
    // 驗證顯示設定
    if (settings.display && typeof settings.display === 'object') {
      const display = settings.display;
      validated.display = {
        fullscreen: typeof display.fullscreen === 'boolean' ? display.fullscreen : validated.display.fullscreen,
        resolution: {
          width: (typeof display.resolution?.width === 'number' && display.resolution.width > 0) 
            ? display.resolution.width : validated.display.resolution.width,
          height: (typeof display.resolution?.height === 'number' && display.resolution.height > 0) 
            ? display.resolution.height : validated.display.resolution.height
        },
        cardSize: ['small', 'medium', 'large'].includes(display.cardSize) 
          ? display.cardSize : validated.display.cardSize,
        reduceAnimations: typeof display.reduceAnimations === 'boolean' 
          ? display.reduceAnimations : validated.display.reduceAnimations
      };
    }
    
    // 驗證遊戲體驗設定
    if (settings.gameplay && typeof settings.gameplay === 'object') {
      const gameplay = settings.gameplay;
      validated.gameplay = {
        autoAdvance: typeof gameplay.autoAdvance === 'boolean' 
          ? gameplay.autoAdvance : validated.gameplay.autoAdvance,
        showHints: typeof gameplay.showHints === 'boolean' 
          ? gameplay.showHints : validated.gameplay.showHints,
        battleSpeed: ['slow', 'normal', 'fast'].includes(gameplay.battleSpeed) 
          ? gameplay.battleSpeed : validated.gameplay.battleSpeed
      };
    }
    
    return validated;
  }

  /**
   * 限制數值範圍
   */
  private clamp(value: any, min: number, max: number): number | undefined {
    if (typeof value !== 'number' || isNaN(value)) return undefined;
    return Math.max(min, Math.min(max, value));
  }

  /**
   * 通知所有監聽器設定已變更
   */
  private notifyListeners(oldSettings: GameSettings, newSettings: GameSettings, updates: any): void {
    // 找出實際變更的鍵值
    const changes = this.findChanges(oldSettings, newSettings);
    
    changes.forEach(change => {
      const event: SettingsChangeEvent = {
        key: change.key,
        oldValue: change.oldValue,
        newValue: change.newValue,
        settings: { ...newSettings }
      };
      
      this.listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in settings change listener:', error);
        }
      });
    });
  }

  /**
   * 找出設定中的變更
   */
  private findChanges(oldSettings: GameSettings, newSettings: GameSettings): Array<{key: string, oldValue: any, newValue: any}> {
    const changes: Array<{key: string, oldValue: any, newValue: any}> = [];
    
    // 簡化版本：比較第一層屬性
    (Object.keys(newSettings) as Array<keyof GameSettings>).forEach(key => {
      if (JSON.stringify(oldSettings[key]) !== JSON.stringify(newSettings[key])) {
        changes.push({
          key: key as string,
          oldValue: oldSettings[key],
          newValue: newSettings[key]
        });
      }
    });
    
    return changes;
  }

  /**
   * 同步設定到主程序
   */
  private async syncToMainProcess(): Promise<void> {
    try {
      const manager = await loadElectronManager();
      if (manager && typeof manager.syncSettingsToMain === 'function') {
        const success = await manager.syncSettingsToMain(this.settings);
        if (!success) {
          console.warn('Settings sync to main process returned false');
        }
      } else {
        console.warn('ElectronManager or syncSettingsToMain method not available');
      }
    } catch (error) {
      console.warn('Failed to sync settings to main process:', error);
    }
  }

  /**
   * 從主程序載入設定
   */
  public async loadFromMainProcess(): Promise<boolean> {
    try {
      const manager = await loadElectronManager();
      if (manager && typeof manager.getSettingsFromMain === 'function') {
        const mainSettings = await manager.getSettingsFromMain();
        if (mainSettings && typeof mainSettings === 'object') {
          const oldSettings = { ...this.settings };
          const validatedSettings = this.validateSettings(
            this.deepMerge(SettingsManager.DEFAULT_SETTINGS, mainSettings)
          );
          
          this.settings = validatedSettings;
          this.saveSettings();
          
          this.notifyListeners(oldSettings, this.settings, {});
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to load settings from main process:', error);
    }
    return false;
  }
}

/**
 * 深度部分類型定義
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string, any> ? DeepPartial<T[P]> : T[P];
};

// 匯出單例實例
export const settingsManager = SettingsManager.getInstance();