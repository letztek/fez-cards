import { GameSettings } from '../types/card';

const STORAGE_KEYS = {
  GAME_SETTINGS: 'fez-card-game-settings',
  GAME_STATS: 'fez-card-game-stats'
} as const;

export interface GameStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalTies: number;
  classStats: Record<string, { wins: number; total: number }>;
  lastPlayed: string;
}

/**
 * 本地儲存管理工具
 */
export class StorageManager {
  /**
   * 載入遊戲設定
   */
  static loadSettings(): GameSettings | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GAME_SETTINGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
//       console.error('Failed to load settings:', error);
    }
    return null;
  }

  /**
   * 儲存遊戲設定
   */
  static saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GAME_SETTINGS, JSON.stringify(settings));
    } catch (error) {
//       console.error('Failed to save settings:', error);
    }
  }

  /**
   * 載入遊戲統計
   */
  static loadStats(): GameStats | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
//       console.error('Failed to load stats:', error);
    }
    return null;
  }

  /**
   * 儲存遊戲統計
   */
  static saveStats(stats: GameStats): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(stats));
    } catch (error) {
//       console.error('Failed to save stats:', error);
    }
  }

  /**
   * 更新遊戲統計
   */
  static updateGameStats(
    winner: 'player' | 'computer' | 'tie',
    playerCards: Array<{ class: string }>
  ): void {
    const currentStats = this.loadStats() || {
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      totalTies: 0,
      classStats: {},
      lastPlayed: new Date().toISOString()
    };

    // 更新總體統計
    currentStats.totalGames++;
    if (winner === 'player') {
      currentStats.totalWins++;
    } else if (winner === 'computer') {
      currentStats.totalLosses++;
    } else {
      currentStats.totalTies++;
    }

    // 更新職業統計
    playerCards.forEach(card => {
      const cardClass = card.class;
      if (!currentStats.classStats[cardClass]) {
        currentStats.classStats[cardClass] = { wins: 0, total: 0 };
      }
      currentStats.classStats[cardClass].total++;
      if (winner === 'player') {
        currentStats.classStats[cardClass].wins++;
      }
    });

    currentStats.lastPlayed = new Date().toISOString();
    this.saveStats(currentStats);
  }

  /**
   * 重置所有資料
   */
  static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.GAME_SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.GAME_STATS);
    } catch (error) {
//       console.error('Failed to clear storage:', error);
    }
  }

  /**
   * 匯出資料
   */
  static exportData(): string {
    const settings = this.loadSettings();
    const stats = this.loadStats();
    
    return JSON.stringify({
      settings,
      stats,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);
  }

  /**
   * 匯入資料
   */
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      
      if (data.stats) {
        this.saveStats(data.stats);
      }
      
      return true;
    } catch (error) {
//       console.error('Failed to import data:', error);
      return false;
    }
  }
}