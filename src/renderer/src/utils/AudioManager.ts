import { getAssetPath } from './asset-paths';
import { settingsManager } from '../../utils/SettingsManager';

interface AudioConfig {
  volume: number;
  enabled: boolean;
  effectsVolume: number;
  musicVolume: number;
}

interface AudioTrack {
  id: string;
  src: string;
  loop?: boolean;
  volume?: number;
  type?: 'music' | 'effect';
}

class AudioManager {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private currentTrack: string | null = null;
  private config: AudioConfig = {
    volume: 0.6,
    enabled: true,
    effectsVolume: 0.8,
    musicVolume: 0.6
  };

  constructor() {
    // 從設定管理器載入音效設定
    this.loadSettingsFromManager();
    
    // 監聽設定變更
    settingsManager.addChangeListener((event) => {
      if (event.key === 'audio') {
        this.updateAudioSettings(event.newValue);
      }
    });
    
    // 預載入所有音樂
    this.preloadTracks([
      { id: 'splash', src: 'asset/Fantasy Earth Zero Soundtrack/m01.mp3', loop: true, type: 'music' },
      { id: 'battle', src: 'asset/Fantasy Earth Zero Soundtrack/m101.mp3', loop: true, type: 'music' },
    ]);
  }

  private preloadTracks(tracks: AudioTrack[]) {
    tracks.forEach(track => {
      const audio = new Audio(getAssetPath(track.src));
      audio.loop = track.loop || false;
      
      // 根據音軌類型設定不同音量
      const baseVolume = track.volume || 1;
      const typeVolume = track.type === 'music' ? this.config.musicVolume : this.config.effectsVolume;
      audio.volume = baseVolume * typeVolume * this.config.volume;
      
      audio.preload = 'auto';
      this.audioElements.set(track.id, audio);
    });
  }

  async playTrack(trackId: string, fadeIn: boolean = true): Promise<void> {
    if (!this.config.enabled) return;

    const audio = this.audioElements.get(trackId);
    if (!audio) {
      console.warn(`Audio track "${trackId}" not found`);
      return;
    }

    try {
      // 停止當前播放的音軌
      await this.stopCurrentTrack();

      // 設置音量（根據音軌類型）
      const trackType = this.getTrackType(trackId);
      const targetVolume = trackType === 'music' ? 
        this.config.musicVolume * this.config.volume : 
        this.config.effectsVolume * this.config.volume;
      
      if (fadeIn) {
        audio.volume = 0;
      } else {
        audio.volume = targetVolume;
      }

      // 重置播放位置並播放
      audio.currentTime = 0;
      await audio.play();
      
      this.currentTrack = trackId;

      // 淡入效果
      if (fadeIn) {
        const trackType = this.getTrackType(trackId);
        const targetVolume = trackType === 'music' ? 
          this.config.musicVolume * this.config.volume : 
          this.config.effectsVolume * this.config.volume;
        this.fadeIn(audio, targetVolume, 2000);
      }

      console.log(`🎵 Now playing: ${trackId} (${audio.src})`);
    } catch (error) {
      console.warn(`Failed to play audio track "${trackId}":`, error);
    }
  }

  async stopCurrentTrack(fadeOut: boolean = true): Promise<void> {
    if (!this.currentTrack) return;

    const audio = this.audioElements.get(this.currentTrack);
    if (!audio) return;

    if (fadeOut) {
      await this.fadeOut(audio, 1000);
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    this.currentTrack = null;
  }

  private fadeIn(audio: HTMLAudioElement, targetVolume: number, duration: number) {
    const steps = 50;
    const increment = targetVolume / steps;
    const interval = duration / steps;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(increment * currentStep, targetVolume);

      if (currentStep >= steps || audio.volume >= targetVolume) {
        clearInterval(fadeInterval);
        audio.volume = targetVolume;
      }
    }, interval);
  }

  private fadeOut(audio: HTMLAudioElement, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const steps = 50;
      const startVolume = audio.volume;
      const decrement = startVolume / steps;
      const interval = duration / steps;

      let currentStep = 0;
      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(startVolume - (decrement * currentStep), 0);

        if (currentStep >= steps || audio.volume <= 0) {
          clearInterval(fadeInterval);
          audio.pause();
          audio.currentTime = 0;
          audio.volume = startVolume; // 重置音量供下次使用
          resolve();
        }
      }, interval);
    });
  }

  setVolume(volume: number) {
    this.config.volume = Math.max(0, Math.min(1, volume));
    this.updateAllAudioVolumes();
  }
  
  setMusicVolume(volume: number) {
    this.config.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateAllAudioVolumes();
  }
  
  setEffectsVolume(volume: number) {
    this.config.effectsVolume = Math.max(0, Math.min(1, volume));
    this.updateAllAudioVolumes();
  }

  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
    
    if (!enabled && this.currentTrack) {
      this.stopCurrentTrack(false);
    }
  }

  getCurrentTrack(): string | null {
    return this.currentTrack;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getVolume(): number {
    return this.config.volume;
  }
  
  getMusicVolume(): number {
    return this.config.musicVolume;
  }
  
  getEffectsVolume(): number {
    return this.config.effectsVolume;
  }

  // 從設定管理器載入設定
  private loadSettingsFromManager() {
    const settings = settingsManager.getSettings();
    this.config.volume = settings.audio.masterVolume;
    this.config.musicVolume = settings.audio.musicVolume;
    this.config.effectsVolume = settings.audio.effectsVolume;
    this.config.enabled = !settings.audio.muted;
  }
  
  // 更新音效設定
  private updateAudioSettings(audioSettings: any) {
    this.config.volume = audioSettings.masterVolume;
    this.config.musicVolume = audioSettings.musicVolume;
    this.config.effectsVolume = audioSettings.effectsVolume;
    this.config.enabled = !audioSettings.muted;
    
    this.updateAllAudioVolumes();
    
    if (!this.config.enabled && this.currentTrack) {
      this.stopCurrentTrack(false);
    }
  }
  
  // 更新所有音頻元素的音量
  private updateAllAudioVolumes() {
    this.audioElements.forEach((audio, trackId) => {
      const trackType = this.getTrackType(trackId);
      const typeVolume = trackType === 'music' ? this.config.musicVolume : this.config.effectsVolume;
      audio.volume = typeVolume * this.config.volume;
    });
  }
  
  // 取得音軌類型
  private getTrackType(trackId: string): 'music' | 'effect' {
    // 根據 trackId 判斷類型，預設為音樂
    if (trackId.includes('effect') || trackId.includes('sfx')) {
      return 'effect';
    }
    return 'music';
  }
  
  // 清理資源
  cleanup() {
    // 移除設定監聽器
    settingsManager.removeChangeListener(this.updateAudioSettings.bind(this));
    
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.audioElements.clear();
    this.currentTrack = null;
  }
}

// 創建單例實例
export const audioManager = new AudioManager();

// 導出類型供其他地方使用
export type { AudioConfig, AudioTrack };