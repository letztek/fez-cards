import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/game-store';
import { Button } from './Button';
import { BattleEngine } from '../utils/battle-engine';

interface StatisticsProps {
  onClose: () => void;
}

export const Statistics: React.FC<StatisticsProps> = ({ onClose }) => {
  const { gameState } = useGameStore();
  const stats = BattleEngine.calculateBattleStats(gameState.battleHistory);

  const winRate = gameState.battleHistory.length > 0 
    ? ((stats.playerWins / gameState.battleHistory.length) * 100).toFixed(1)
    : '0.0';

  const classStats = gameState.battleHistory.reduce((acc, battle) => {
    const playerClass = battle.playerCard.class;
    if (!acc[playerClass]) {
      acc[playerClass] = { wins: 0, total: 0 };
    }
    acc[playerClass].total++;
    if (battle.winner === 'player') {
      acc[playerClass].wins++;
    }
    return acc;
  }, {} as Record<string, { wins: number; total: number }>);

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
          <h2 className="text-2xl font-bold text-white">遊戲統計</h2>
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
            <h3 className="text-lg font-semibold text-white mb-4">總體戰績</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.playerWins}</div>
                <div className="text-sm text-gray-400">勝利</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{stats.computerWins}</div>
                <div className="text-sm text-gray-400">失敗</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.ties}</div>
                <div className="text-sm text-gray-400">平手</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{winRate}%</div>
                <div className="text-sm text-gray-400">勝率</div>
              </div>
            </div>
          </div>

          {/* 職業統計 */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">職業使用統計</h3>
            <div className="space-y-3">
              {Object.entries(classStats).map(([cardClass, stat]) => {
                const classWinRate = stat.total > 0 ? ((stat.wins / stat.total) * 100).toFixed(1) : '0.0';
                const classNames = {
                  'warrior': { name: '⚔️ 戰士', color: 'text-red-400' },
                  'mage': { name: '🔮 法師', color: 'text-blue-400' },
                  'ranger': { name: '🏹 遊俠', color: 'text-green-400' }
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

          {/* 戰鬥歷史 */}
          {gameState.battleHistory.length > 0 && (
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">最近戰鬥記錄</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {gameState.battleHistory.slice(-10).reverse().map((battle, index) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 bg-slate-600/30 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">第{gameState.battleHistory.length - index}回合</span>
                      <span className="text-sm">
                        {battle.playerCard.class} vs {battle.computerCard.class}
                      </span>
                    </div>
                    <div className={`text-sm font-medium ${
                      battle.winner === 'player' ? 'text-green-400' :
                      battle.winner === 'computer' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {battle.winner === 'player' ? '勝利' :
                       battle.winner === 'computer' ? '失敗' : '平手'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 遊戲提示 */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">遊戲提示</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div>• 戰士克制遊俠，遊俠克制法師，法師克制戰士</div>
              <div>• 觀察 AI 的出牌模式，調整你的策略</div>
              <div>• 保持職業平衡，不要過度依賴單一職業</div>
              <div>• 在困難模式下，AI 會分析你的出牌習慣</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="primary">
            關閉
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};