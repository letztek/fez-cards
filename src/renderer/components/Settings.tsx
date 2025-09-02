import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/game-store';
import { Button } from './Button';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { settings, updateSettings } = useGameStore();

  const handleMaxRoundsChange = (rounds: number) => {
    updateSettings({ maxRounds: rounds });
  };

  const handleAIDifficultyChange = (difficulty: 'easy' | 'normal' | 'hard') => {
    updateSettings({ aiDifficulty: difficulty });
  };

  const handleLanguageChange = (language: 'zh' | 'en' | 'ja') => {
    updateSettings({ language });
  };

  const handleThemeChange = (theme: 'dark' | 'light') => {
    updateSettings({ theme });
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">遊戲設定</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* 回合數設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              回合數
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 6, 9].map((rounds) => (
                <button
                  key={rounds}
                  onClick={() => handleMaxRoundsChange(rounds)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    settings.maxRounds === rounds
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {rounds} 回合
                </button>
              ))}
            </div>
          </div>

          {/* 電腦難度設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              電腦難度
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'easy', label: '簡單' },
                { value: 'normal', label: '普通' },
                { value: 'hard', label: '困難' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleAIDifficultyChange(value as any)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    settings.aiDifficulty === value
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 語言設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              語言
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'zh', label: '中文' },
                { value: 'en', label: 'English' },
                { value: 'ja', label: '日本語' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleLanguageChange(value as any)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    settings.language === value
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 主題設定 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              主題
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'dark', label: '深色' },
                { value: 'light', label: '淺色' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleThemeChange(value as any)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    settings.theme === value
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Button onClick={onClose} variant="secondary">
            關閉
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};