import { getAssetPath } from './asset-paths';
import { settingsManager } from '../../utils/SettingsManager';

// AudioContext 類型定義
declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

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
    
    // 預載入所有音樂和音效 - 只使用 MP3 格式
    this.preloadTracks([
      { id: 'splash', src: 'asset/Fantasy Earth Zero Soundtrack/m01.mp3', loop: true, type: 'music' },
      { id: 'battle', src: 'asset/Fantasy Earth Zero Soundtrack/m101.mp3', loop: true, type: 'music' },
      { id: 'flipcard', src: 'asset/84322__splashdust__flipcard.mp3', loop: false, type: 'effect', volume: 0.8 },
    ]);
  }

  private preloadTracks(tracks: AudioTrack[]) {
    tracks.forEach((track) => {
      const fullPath = getAssetPath(track.src);
      console.log(`🎵 Preloading ${track.type} track: ${track.id} from ${fullPath}`);
      
      const audio = new Audio();
      
      // 簡化的錯誤處理
      audio.addEventListener('error', (e) => {
        console.error(`❌ Failed to preload ${track.id}:`, audio.error?.code || 'Unknown error');
      });
      
      audio.addEventListener('canplaythrough', () => {
        console.log(`✅ Preloaded successfully: ${track.id}`);
      });
      
      // 設置屬性
      audio.loop = track.loop || false;
      audio.preload = 'auto';
      
      // 根據音軌類型設定不同音量
      const baseVolume = track.volume || 1;
      const typeVolume = track.type === 'music' ? this.config.musicVolume : this.config.effectsVolume;
      audio.volume = baseVolume * typeVolume * this.config.volume;
      
      // 設置源並載入
      audio.src = fullPath;
      
      this.audioElements.set(track.id, audio);
      
      // 開始載入
      audio.load();
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
      const trackType = this.getTrackType(trackId);
      
      // 對於音效，不需要停止當前音軌，可以同時播放
      if (trackType === 'effect') {
        // 設置音效音量
        const targetVolume = this.config.effectsVolume * this.config.volume;
        audio.volume = targetVolume;
        
        // 重置播放位置並播放
        audio.currentTime = 0;
        await audio.play();
        
        console.log(`🔔 Playing effect: ${trackId}`);
        return;
      }

      // 對於音樂，停止當前播放的音軌
      await this.stopCurrentTrack();

      // 設置音量（根據音軌類型）
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
  
  // 播放音效的簡化方法 - 只使用 MP3 格式
  async playEffect(effectId: string): Promise<void> {
    if (!this.config.enabled) {
      console.log(`🔇 Audio disabled, skipping effect: ${effectId}`);
      return;
    }

    let audio = this.audioElements.get(effectId);
    
    // 如果音頻元素不存在或有問題，嘗試重新創建
    if (!audio || audio.error) {
      console.log(`🔄 Recreating audio element for: ${effectId}`);
      
      try {
        // 使用正確的路徑（檔案現在在 public/asset 中）
        const audioPath = 'asset/84322__splashdust__flipcard.mp3';
        const fullPath = getAssetPath(audioPath);
        console.log(`🎵 Loading MP3: ${fullPath}`);
        
        const newAudio = new Audio(fullPath);
        
        // 設置基本屬性
        newAudio.preload = 'auto';
        newAudio.volume = this.config.effectsVolume * this.config.volume * 0.8;
        
        // 載入音頻
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout loading MP3'));
          }, 3000);
          
          newAudio.oncanplaythrough = () => {
            clearTimeout(timeout);
            console.log(`✅ MP3 loaded successfully: ${effectId}`);
            resolve(newAudio);
          };
          
          newAudio.onerror = (e) => {
            clearTimeout(timeout);
            const errorMsg = newAudio.error ? 
              `Error code: ${newAudio.error.code}` : 
              'Unknown audio error';
            reject(new Error(`Failed to load MP3: ${errorMsg}`));
          };
          
          newAudio.load();
        });
        
        this.audioElements.set(effectId, newAudio);
        audio = newAudio;
        
      } catch (error) {
        console.error(`❌ Failed to load MP3 for ${effectId}:`, error);
        console.log(`🔔 Using fallback sound effect instead`);
        this.createFallbackEffect();
        return;
      }
    }

    if (!audio) {
      console.warn(`Effect "${effectId}" not found`);
      return;
    }

    try {
      // 設置音效音量
      const targetVolume = this.config.effectsVolume * this.config.volume * 0.8;
      audio.volume = targetVolume;
      
      // 重置播放位置並播放
      audio.currentTime = 0;
      await audio.play();
      
      console.log(`🔔 Playing effect: ${effectId} at volume ${targetVolume.toFixed(2)}`);
    } catch (error) {
      console.warn(`Failed to play effect "${effectId}":`, error);
      
      // 嘗試創建純音效作為後備方案
      this.createFallbackEffect();
    }
  }

  // 創建後備音效（使用 Web Audio API 生成翻牌聲）
  private createFallbackEffect(): void {
    if (!window.AudioContext && !window.webkitAudioContext) {
      console.warn('Web Audio API not supported, no fallback sound available');
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();

      // 創建翻牌音效 - 兩個快速的"咔嚓"聲
      const createFlipSound = (startTime: number, frequency: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // 設定頻率變化模擬翻牌聲
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, startTime + 0.05);

        // 音量包絡
        const volume = 0.15 * this.config.effectsVolume * this.config.volume;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

        oscillator.type = 'square'; // 使用方波產生更清脆的聲音
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.08);
      };

      const now = audioContext.currentTime;
      
      // 第一個翻牌聲
      createFlipSound(now, 1200);
      // 第二個翻牌聲（稍微延遲）
      createFlipSound(now + 0.06, 800);

      console.log('🔔 Playing fallback flip sound effect');

    } catch (error) {
      console.warn('Failed to create fallback sound:', error);
    }
  }

  // 取得音軌類型
  private getTrackType(trackId: string): 'music' | 'effect' {
    // 根據 trackId 判斷類型
    if (trackId.includes('effect') || trackId.includes('sfx') || trackId === 'flipcard') {
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