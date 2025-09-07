interface AudioConfig {
  volume: number;
  enabled: boolean;
}

interface AudioTrack {
  id: string;
  src: string;
  loop?: boolean;
  volume?: number;
}

class AudioManager {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private currentTrack: string | null = null;
  private config: AudioConfig = {
    volume: 0.6,
    enabled: true
  };

  constructor() {
    // 預載入所有音樂
    this.preloadTracks([
      { id: 'splash', src: '/asset/Fantasy Earth Zero Soundtrack/m01.mp3', loop: true },
      { id: 'battle', src: '/asset/Fantasy Earth Zero Soundtrack/m101.mp3', loop: true },
    ]);
  }

  private preloadTracks(tracks: AudioTrack[]) {
    tracks.forEach(track => {
      const audio = new Audio(track.src);
      audio.loop = track.loop || false;
      audio.volume = (track.volume || 1) * this.config.volume;
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

      // 設置音量
      if (fadeIn) {
        audio.volume = 0;
      } else {
        audio.volume = this.config.volume;
      }

      // 重置播放位置並播放
      audio.currentTime = 0;
      await audio.play();
      
      this.currentTrack = trackId;

      // 淡入效果
      if (fadeIn) {
        this.fadeIn(audio, this.config.volume, 2000);
      }

      console.log(`Now playing: ${trackId}`);
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
    
    // 更新所有音頻元素的音量
    this.audioElements.forEach(audio => {
      audio.volume = this.config.volume;
    });
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

  // 清理資源
  cleanup() {
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