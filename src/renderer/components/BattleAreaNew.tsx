import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card as CardComponent } from './Card';
import { FlipCard } from './FlipCard';
import { Card as CardType, BattleResult } from '../types/card';

interface BattleAreaNewProps {
  playerCard?: CardType;
  computerCard?: CardType;
  result?: BattleResult;
  isAnimating?: boolean;
  onAnimationComplete?: () => void;
  className?: string;
  // 新增的 props 用於控制翻牌流程
  battlePhase?: 'waiting' | 'player-selected' | 'computer-thinking' | 'computer-reveal' | 'result';
  onComputerRevealComplete?: () => void;
  // 待翻轉的電腦卡牌（在 computer-reveal 階段使用）
  pendingComputerCard?: CardType;
}

export const BattleAreaNew: React.FC<BattleAreaNewProps> = ({
  playerCard,
  computerCard,
  result,
  isAnimating = false,
  onAnimationComplete,
  className = '',
  battlePhase = 'waiting',
  onComputerRevealComplete,
  pendingComputerCard
}) => {
  const { t } = useTranslation();
  const [computerFlipped, setComputerFlipped] = useState(false);

  // 控制電腦卡牌翻轉時機
  useEffect(() => {
    console.log('🎬 BattleArea - 對戰階段變更:', battlePhase);
    
    if (battlePhase === 'waiting') {
      // 重置翻轉狀態
      setComputerFlipped(false);
    }
  }, [battlePhase]);

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
        delay: 0.3
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
        return t('battle.result.playerWins');
      case 'computer':
        return t('battle.result.computerWins');
      case 'tie':
        return t('battle.result.tie');
      default:
        return t('battle.result.tie');
    }
  };

  const handleComputerFlipComplete = () => {
    console.log('✨ 電腦卡牌翻轉動畫完成');
    setComputerFlipped(true); // 確保翻轉狀態正確
    onComputerRevealComplete?.();
  };

  const getPhaseDescription = () => {
    switch (battlePhase) {
      case 'waiting':
        return t('battle.selectCardToStart', { defaultValue: '選擇一張卡牌開始對戰' });
      case 'player-selected':
        return t('battle.clickConfirm', { defaultValue: '點擊確認出牌按鈕' });
      case 'computer-thinking':
        return t('battle.computerThinking', { defaultValue: '電腦正在思考...' });
      case 'computer-reveal':
        return t('battle.computerRevealing', { defaultValue: '電腦正在翻牌...' });
      case 'result':
        return t('battle.battleEnd', { defaultValue: '對戰結束' });
      default:
        return '';
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
        <h2 className="text-2xl font-bold text-white mb-2">{t('battle.battleArea', { defaultValue: '對戰區域' })}</h2>
        {result && (
          <div className="text-sm text-white/70">
            {t('game.round', { current: result.round, total: '' }).replace(/\s\/.*/, '')}
          </div>
        )}
        
        {/* Phase Indicator */}
        <div className="text-xs text-white/50 mt-2">
          {getPhaseDescription()}
        </div>
      </div>

      {/* Battle Cards */}
      <div className="flex items-center justify-center gap-8 mb-6">
        {/* Player Card */}
        <div className="text-center">
          <div className="text-sm text-blue-400 mb-2 font-medium">{t('game.playerScore', { score: '' }).split(':')[0]}</div>
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

        {/* Computer Card - 使用 FlipCard */}
        <div className="text-center">
          <div className="text-sm text-red-400 mb-2 font-medium">{t('game.computerScore', { score: '' }).split(':')[0]}</div>
          <AnimatePresence mode="wait">
            {(computerCard || pendingComputerCard) ? (
              <motion.div
                key={`computer-${(computerCard || pendingComputerCard)?.id}`}
                variants={cardVariants}
                initial="hidden"
                animate={isAnimating ? 'battle' : 'visible'}
                exit="hidden"
              >
                {/* 使用 FlipCard 組件 */}
                <FlipCard
                  key={`${(computerCard || pendingComputerCard)?.id}`}
                  card={computerCard || pendingComputerCard!}
                  size="medium"
                  isFlipped={computerFlipped}
                  autoFlip={battlePhase === 'computer-reveal'}
                  flipDelay={500}
                  onFlipComplete={handleComputerFlipComplete}
                />
              </motion.div>
            ) : battlePhase === 'computer-thinking' ? (
              <motion.div
                className="w-32 h-44 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="text-slate-500 text-center">
                  <motion.div 
                    className="text-2xl mb-1"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    🤖
                  </motion.div>
                  <div className="text-xs">{t('battle.computerThinking', { defaultValue: '電腦思考中' })}</div>
                </div>
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
                  <div className="text-xs">等待中</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Battle Result */}
      <AnimatePresence>
        {result && battlePhase === 'result' && (
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
      {!playerCard && !computerCard && !result && battlePhase === 'waiting' && (
        <motion.div
          className="text-center text-white/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-4xl mb-2">⚔️</div>
          <div>{t('battle.selectCardToStart', { defaultValue: '選擇一張卡牌開始對戰' })}</div>
        </motion.div>
      )}
    </motion.div>
  );
};