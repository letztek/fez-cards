import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../stores/game-store';
import { Button } from './Button';
import { BattleEngine } from '../utils/battle-engine';
import { StorageManager } from '../utils/storage';

interface StatisticsProps {
  onClose: () => void;
}

export const Statistics: React.FC<StatisticsProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { gameState } = useGameStore();
  const [showConfirm, setShowConfirm] = useState(false);
  
  // 載入持久化的統計數據
  const globalStats = StorageManager.loadStats();
  const currentGameStats = BattleEngine.calculateBattleStats(gameState.battleHistory);

  // 使用全局統計數據，如果沒有則顯示當前遊戲統計
  const totalGames = globalStats?.totalGames || 0;
  const totalWins = globalStats?.totalWins || currentGameStats.playerWins;
  const totalLosses = globalStats?.totalLosses || currentGameStats.computerWins;
  const totalTies = globalStats?.totalTies || currentGameStats.ties;
  const classStats = globalStats?.classStats || {};

  const winRate = totalGames > 0 
    ? ((totalWins / totalGames) * 100).toFixed(1)
    : '0.0';

  const handleClearStats = () => {
    StorageManager.saveStats({
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      totalTies: 0,
      classStats: {},
      lastPlayed: new Date().toISOString()
    });
    setShowConfirm(false);
    // 觸發重新渲染
    window.location.reload();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{t('statistics.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* 總體統計 */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">{t('statistics.totalGames')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{totalWins}</div>
                <div className="text-sm text-gray-400">{t('statistics.wins')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{totalLosses}</div>
                <div className="text-sm text-gray-400">{t('statistics.losses')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{totalTies}</div>
                <div className="text-sm text-gray-400">{t('statistics.ties')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{winRate}%</div>
                <div className="text-sm text-gray-400">{t('statistics.winRate')}</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-400">
                {t('statistics.totalGamesCount', { count: totalGames })}
              </div>
            </div>
          </div>

          {/* 職業統計 */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">{t('statistics.classUsage')}</h3>
            <div className="space-y-3">
              {Object.entries(classStats).map(([cardClass, stat]) => {
                const classWinRate = stat.total > 0 ? ((stat.wins / stat.total) * 100).toFixed(1) : '0.0';
                const classNames = {
                  'warrior': { name: `⚔️ ${t('classes.warrior')}`, color: 'text-red-400' },
                  'mage': { name: `🔮 ${t('classes.mage')}`, color: 'text-blue-400' },
                  'ranger': { name: `🏹 ${t('classes.ranger')}`, color: 'text-green-400' }
                };
                const classInfo = classNames[cardClass as keyof typeof classNames] || { name: cardClass, color: 'text-gray-400' };

                return (
                  <div key={cardClass} className="flex justify-between items-center">
                    <span className={`font-medium ${classInfo.color}`}>
                      {classInfo.name}
                    </span>
                    <div className="text-right">
                      <span className="text-white">{stat.wins}/{stat.total}</span>
                      <span className="text-gray-400 ml-2">({classWinRate}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 當前遊戲歷史 */}
          {gameState.battleHistory.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">{t('statistics.currentGameBattles')}</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {gameState.battleHistory.slice(-10).reverse().map((battle, index) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 bg-slate-600/30 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">{t('statistics.round', { number: gameState.battleHistory.length - index })}</span>
                      <span className="text-sm">
                        {battle.playerCard.class} vs {battle.computerCard.class}
                      </span>
                    </div>
                    <div className={`text-sm font-medium ${
                      battle.winner === 'player' ? 'text-green-400' :
                      battle.winner === 'computer' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {battle.winner === 'player' ? t('statistics.win') :
                       battle.winner === 'computer' ? t('statistics.loss') : t('statistics.tie')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 遊戲提示 */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">{t('statistics.gameTips')}</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div>• {t('statistics.tip1')}</div>
              <div>• {t('statistics.tip2')}</div>
              <div>• {t('statistics.tip3')}</div>
              <div>• {t('statistics.tip4')}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Button 
            onClick={() => setShowConfirm(true)} 
            variant="secondary"
            className="text-red-400 hover:text-red-300"
          >
            {t('statistics.clearData')}
          </Button>
          <Button onClick={onClose} variant="primary">
            {t('statistics.close')}
          </Button>
        </div>

        {/* 確認清除對話框 */}
        {showConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60"
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
              <h3 className="text-lg font-semibold text-white mb-4">{t('statistics.confirmClear')}</h3>
              <p className="text-gray-300 mb-6">{t('statistics.confirmClearMessage')}</p>
              <div className="flex justify-end space-x-3">
                <Button 
                  onClick={() => setShowConfirm(false)} 
                  variant="secondary"
                >
                  {t('statistics.cancel')}
                </Button>
                <Button 
                  onClick={handleClearStats} 
                  variant="primary"
                  className="bg-red-600 hover:bg-red-700"
                >
                  {t('statistics.confirm')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};