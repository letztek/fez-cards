import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardComponent } from './Card';
import { Card as CardType, BattleResult } from '../types/card';

interface BattleAreaProps {
  playerCard?: CardType;
  computerCard?: CardType;
  result?: BattleResult;
  isAnimating?: boolean;
  onAnimationComplete?: () => void;
  className?: string;
}

export const BattleArea: React.FC<BattleAreaProps> = ({
  playerCard,
  computerCard,
  result,
  isAnimating = false,
  onAnimationComplete,
  className = ''
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 24 
      }
    },
    battle: {
      scale: [1, 1.1, 1],
      transition: { 
        duration: 0.6,
        times: [0, 0.5, 1]
      }
    }
  };

  const resultVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25,
        delay: 0.5
      }
    }
  };

  const getResultColor = () => {
    if (!result) return '';
    switch (result.winner) {
      case 'player':
        return 'text-green-400 border-green-400';
      case 'computer':
        return 'text-red-400 border-red-400';
      case 'tie':
        return 'text-yellow-400 border-yellow-400';
      default:
        return 'text-white border-white';
    }
  };

  const getResultIcon = () => {
    if (!result) return '';
    switch (result.winner) {
      case 'player':
        return '🎉';
      case 'computer':
        return '😔';
      case 'tie':
        return '🤝';
      default:
        return '❓';
    }
  };

  const getResultText = () => {
    if (!result) return '';
    switch (result.winner) {
      case 'player':
        return '玩家獲勝！';
      case 'computer':
        return '電腦獲勝！';
      case 'tie':
        return '平手！';
      default:
        return '未知結果';
    }
  };

  return (
    <motion.div
      className={`
        flex flex-col items-center justify-center
        min-h-[400px] p-6
        bg-slate-800/30 backdrop-blur-sm
        rounded-xl border border-slate-700/50
        ${className}
      `}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Battle Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">對戰區域</h2>
        {result && (
          <div className="text-sm text-white/70">
            第 {result.round} 回合
          </div>
        )}
      </div>

      {/* Battle Cards */}
      <div className="flex items-center justify-center gap-8 mb-6">
        {/* Player Card */}
        <div className="text-center">
          <div className="text-sm text-blue-400 mb-2 font-medium">玩家</div>
          <AnimatePresence mode="wait">
            {playerCard ? (
              <motion.div
                key={`player-${playerCard.id}`}
                variants={cardVariants}
                initial="hidden"
                animate={isAnimating ? 'battle' : 'visible'}
                exit="hidden"
                onAnimationComplete={() => {
                  if (isAnimating && onAnimationComplete) {
                    onAnimationComplete();
                  }
                }}
              >
                <CardComponent
                  card={playerCard}
                  size="medium"
                  state={isAnimating ? 'playing' : 'idle'}
                />
              </motion.div>
            ) : (
              <motion.div
                className="w-32 h-44 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="text-slate-500 text-center">
                  <div className="text-2xl mb-1">🃏</div>
                  <div className="text-xs">等待出牌</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* VS Indicator */}
        <motion.div
          className="text-center"
          animate={isAnimating ? { 
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0]
          } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="text-3xl font-bold text-yellow-400 mb-2">VS</div>
          {result && (
            <motion.div
              className="text-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              {getResultIcon()}
            </motion.div>
          )}
        </motion.div>

        {/* Computer Card */}
        <div className="text-center">
          <div className="text-sm text-red-400 mb-2 font-medium">電腦</div>
          <AnimatePresence mode="wait">
            {computerCard ? (
              <motion.div
                key={`computer-${computerCard.id}`}
                variants={cardVariants}
                initial="hidden"
                animate={isAnimating ? 'battle' : 'visible'}
                exit="hidden"
              >
                <CardComponent
                  card={computerCard}
                  size="medium"
                  state={isAnimating ? 'playing' : 'idle'}
                />
              </motion.div>
            ) : (
              <motion.div
                className="w-32 h-44 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="text-slate-500 text-center">
                  <div className="text-2xl mb-1">🤖</div>
                  <div className="text-xs">AI 思考中</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Battle Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            className={`
              text-center p-4 rounded-lg border-2 bg-black/30 backdrop-blur-sm
              ${getResultColor()}
            `}
            variants={resultVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="text-lg font-bold mb-2">
              {getResultText()}
            </div>
            <div className="text-sm text-white/80">
              {result.reason}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!playerCard && !computerCard && !result && (
        <motion.div
          className="text-center text-white/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-4xl mb-2">⚔️</div>
          <div>選擇一張卡牌開始對戰</div>
        </motion.div>
      )}
    </motion.div>
  );
};