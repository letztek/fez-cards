import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { settingsManager } from '../utils/SettingsManager';
import { audioManager } from '../src/utils/AudioManager';

interface VolumeControlProps {
  className?: string;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ className = '' }) => {
  const { t } = useTranslation();

  // 音量狀態
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [musicVolume, setMusicVolume] = useState(0.6);
  const [effectsVolume, setEffectsVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // 載入設定
  useEffect(() => {
    const settings = settingsManager.getSettings();
    setMasterVolume(settings.audio.masterVolume);
    setMusicVolume(settings.audio.musicVolume);
    setEffectsVolume(settings.audio.effectsVolume);
    setIsMuted(settings.audio.muted);
  }, []);

  // 監聽設定變更
  useEffect(() => {
    const handleSettingsChange = (event: any) => {
      if (event.key === 'audio') {
        setMasterVolume(event.newValue.masterVolume);
        setMusicVolume(event.newValue.musicVolume);
        setEffectsVolume(event.newValue.effectsVolume);
        setIsMuted(event.newValue.muted);
      }
    };

    settingsManager.addChangeListener(handleSettingsChange);
    return () => settingsManager.removeChangeListener(handleSettingsChange);
  }, []);

  // 音量變更處理 - 簡化版本
  const handleVolumeChange = useCallback((type: 'master' | 'music' | 'effects', value: number) => {
    const newValue = Math.max(0, Math.min(1, value));

    // 立即更新本地狀態
    if (type === 'master') {
      setMasterVolume(newValue);
    } else if (type === 'music') {
      setMusicVolume(newValue);
    } else if (type === 'effects') {
      setEffectsVolume(newValue);
    }

    // 異步更新設定，不阻塞 UI
    setTimeout(() => {
      try {
        settingsManager.updateSettings({
          audio: {
            masterVolume: type === 'master' ? newValue : masterVolume,
            musicVolume: type === 'music' ? newValue : musicVolume,
            effectsVolume: type === 'effects' ? newValue : effectsVolume,
            muted: isMuted
          }
        });
      } catch (error) {
        console.warn('Failed to update settings:', error);
      }
    }, 0);
  }, [masterVolume, musicVolume, effectsVolume, isMuted]);

  // 靜音切換
  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    setTimeout(() => {
      try {
        settingsManager.updateSettings({
          audio: {
            masterVolume,
            musicVolume,
            effectsVolume,
            muted: newMuted
          }
        });
      } catch (error) {
        console.warn('Failed to update mute setting:', error);
      }
    }, 0);
  }, [masterVolume, musicVolume, effectsVolume, isMuted]);

  // 重置為預設值
  const handleReset = useCallback(() => {
    setMasterVolume(0.7);
    setMusicVolume(0.6);
    setEffectsVolume(0.8);
    setIsMuted(false);

    setTimeout(() => {
      try {
        settingsManager.updateSettings({
          audio: {
            masterVolume: 0.7,
            musicVolume: 0.6,
            effectsVolume: 0.8,
            muted: false
          }
        });
      } catch (error) {
        console.warn('Failed to reset settings:', error);
      }
    }, 0);
  }, []);

  // 音量測試功能
  const handleVolumeTest = useCallback(async (type: 'music' | 'effects') => {
    try {
      if (type === 'music') {
        const currentTrack = audioManager.getCurrentTrack();
        if (currentTrack) {
          await audioManager.playTrack(currentTrack, false);
        } else {
          await audioManager.playTrack('splash', false);
        }
      } else if (type === 'effects') {
        console.log('Testing effects volume:', effectsVolume);
      }
    } catch (error) {
      console.warn('Failed to test volume:', error);
    }
  }, [effectsVolume]);

  // 簡化的滑桿組件
  const VolumeSlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    onTest?: () => void;
    icon: string;
    color: string;
  }> = ({ label, value, onChange, onTest, icon, color }) => {
    const percentage = Math.round(value * 100);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onChange(newValue);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{icon}</span>
            <label className="text-sm font-medium text-gray-300">{label}</label>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400 w-10 text-right">{percentage}%</span>
            {onTest && (
              <button
                onClick={onTest}
                className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-gray-300 transition-colors"
              >
                {t('settings.audio.test')}
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          {/* 滑桿軌道背景 */}
          <div className="w-full h-2 bg-slate-700 rounded-lg relative overflow-hidden">
            {/* 滑桿進度條 */}
            <div
              className={`h-full bg-gradient-to-r ${color} transition-all duration-200`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* 原生滑桿 - 完全透明覆蓋 */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={value}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{
              WebkitAppearance: 'none',
              appearance: 'none',
              background: 'transparent'
            }}
          />

          {/* 滑桿按鈕指示器 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-slate-200 shadow-lg pointer-events-none transition-all duration-200"
            style={{ left: `calc(${percentage}% - 8px)` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 音量控制標題 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{t('settings.audio.title')}</h3>
        <div className="flex items-center space-x-2">
          {/* 全域靜音按鈕 */}
          <motion.button
            onClick={handleMuteToggle}
            className={`p-2 rounded-lg transition-colors ${isMuted
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">
              {isMuted ? '🔇' : '🔊'}
            </span>
          </motion.button>

          {/* 重置按鈕 */}
          <motion.button
            onClick={handleReset}
            className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded text-gray-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('settings.audio.reset')}
          </motion.button>
        </div>
      </div>

      {/* 靜音狀態提示 */}
      {isMuted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/50 border border-red-600 rounded-lg p-3 text-red-200 text-sm"
        >
          <div className="flex items-center space-x-2">
            <span>🔇</span>
            <span>{t('settings.audio.mutedWarning')}</span>
          </div>
        </motion.div>
      )}

      {/* 音量滑桿 */}
      <div className="space-y-4">
        <VolumeSlider
          label={t('settings.audio.master')}
          value={masterVolume}
          onChange={(value) => handleVolumeChange('master', value)}
          icon="🔊"
          color="from-blue-500 to-blue-600"
        />

        <VolumeSlider
          label={t('settings.audio.music')}
          value={musicVolume}
          onChange={(value) => handleVolumeChange('music', value)}
          onTest={() => handleVolumeTest('music')}
          icon="🎵"
          color="from-green-500 to-green-600"
        />

        {/* 音效滑桿 - 為未來擴充準備，目前禁用 */}
        <div className="opacity-50 pointer-events-none">
          <VolumeSlider
            label={`${t('settings.audio.effects')} (${t('settings.audio.comingSoon')})`}
            value={effectsVolume}
            onChange={() => { }} // 暫時禁用
            icon="🔔"
            color="from-gray-500 to-gray-600"
          />
        </div>
      </div>

      {/* 說明文字 */}
      <div className="text-xs text-gray-400 bg-slate-800/50 rounded p-3">
        <p>{t('settings.audio.description')}</p>
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-green-400">🎵</span>
          <span>目前支援：背景音樂音量控制</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-yellow-400">🔔</span>
          <span>即將支援：遊戲音效、UI 音效</span>
        </div>
      </div>
    </div>
  );
};

export default VolumeControl;